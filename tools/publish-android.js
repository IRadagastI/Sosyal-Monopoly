const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const RELEASE_DIR = path.join(ROOT, "release");
const GRADLE = path.join(ROOT, "android", "app", "build.gradle");
const AAB = path.join(
  ROOT,
  "android",
  "app",
  "build",
  "outputs",
  "bundle",
  "release",
  "app-release.aab",
);
const APK = path.join(
  ROOT,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "release",
  "app-release.apk",
);

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} başarısız.\n${result.stdout || ""}\n${result.stderr || ""}`,
    );
  }
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function version() {
  const text = fs.readFileSync(GRADLE, "utf8");
  const code = text.match(/versionCode\s+(\d+)/);
  const name = text.match(/versionName\s+"([^"]+)"/);
  if (!code || !name) throw new Error("Android sürümü okunamadı.");
  return { code: code[1], name: name[1] };
}

function sdkDir() {
  const localProperties = path.join(ROOT, "android", "local.properties");
  if (!fs.existsSync(localProperties))
    throw new Error("android/local.properties bulunamadı.");
  const match = fs
    .readFileSync(localProperties, "utf8")
    .match(/^sdk\.dir=(.+)$/m);
  if (!match) throw new Error("sdk.dir bulunamadı.");
  return match[1].trim().replace(/\\:/g, ":").replace(/\\\\/g, "\\");
}

function findApkSignerJar() {
  const buildTools = path.join(sdkDir(), "build-tools");
  const versions = fs
    .readdirSync(buildTools, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  for (const item of versions) {
    const candidate = path.join(buildTools, item, "lib", "apksigner.jar");
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("Android SDK içinde apksigner bulunamadı.");
}

function sha256(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

if (!fs.existsSync(AAB) || !fs.existsSync(APK))
  throw new Error("Release APK/AAB çıktıları eksik.");

// Play yükleme anahtarları çoğunlukla kendinden imzalıdır; jarsigner'ın
// `-strict` seçeneği bu geçerli kullanımda sıfır olmayan kod döndürür. İmza
// bütünlüğünü normal doğrulama ile, APK'yı ise Android SDK aracıyla denetle.
const aabVerification = run("jarsigner", ["-verify", "-certs", AAB]);
if (!/jar verified\./i.test(aabVerification)) {
  throw new Error("AAB imzası doğrulanamadı.");
}
run("java", [
  "-jar",
  findApkSignerJar(),
  "verify",
  "--verbose",
  "--print-certs",
  APK,
]);

const current = version();
fs.mkdirSync(RELEASE_DIR, { recursive: true });
for (const file of fs.readdirSync(RELEASE_DIR)) {
  if (/^Bilgiopoli-v.*-SIGNED\.(aab|apk)$/i.test(file))
    fs.unlinkSync(path.join(RELEASE_DIR, file));
}

const aabName = `Bilgiopoli-v${current.name}-SIGNED.aab`;
const apkName = `Bilgiopoli-v${current.name}-SIGNED.apk`;
const aabDest = path.join(RELEASE_DIR, aabName);
const apkDest = path.join(RELEASE_DIR, apkName);
fs.copyFileSync(AAB, aabDest);
fs.copyFileSync(APK, apkDest);

const sumsPath = path.join(RELEASE_DIR, "SHA256SUMS.txt");
const existingExeSums = fs.existsSync(sumsPath)
  ? fs
      .readFileSync(sumsPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && line.toLowerCase().endsWith(".exe"))
  : [];
const sums = [
  `${sha256(aabDest)}  ${aabName}`,
  `${sha256(apkDest)}  ${apkName}`,
  ...existingExeSums,
];
fs.writeFileSync(sumsPath, `${sums.join("\n")}\n`, "utf8");
const exeName = `Bilgiopoli-v${current.name}.exe`;
const exeLine = fs.existsSync(path.join(RELEASE_DIR, exeName))
  ? `EXE: ${exeName}\n`
  : "";
fs.writeFileSync(
  path.join(RELEASE_DIR, "OKU-BENI.txt"),
  `BILGIOPOLI - YAYIN PAKETLERI\n\nSürüm: ${current.name} (${current.code})\nAAB: ${aabName}\nAPK: ${apkName}\n${exeLine}\nAndroid paketlerinin imzası otomatik doğrulanmıştır.\nTüm SHA-256 değerleri SHA256SUMS.txt içindedir.\n`,
  "utf8",
);
console.log(
  `Android paketleri doğrulandı ve release/ klasörüne kopyalandı: ${current.name} (${current.code})`,
);
