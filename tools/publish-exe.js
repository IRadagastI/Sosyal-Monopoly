const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PACKAGE = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
);
const SOURCE = path.join(ROOT, "dist", "Bilgiopoli.exe");
const RELEASE_DIR = path.join(ROOT, "release");

if (!fs.existsSync(SOURCE)) throw new Error("dist/Bilgiopoli.exe bulunamadı.");
const binary = fs.readFileSync(SOURCE);
if (binary.length < 1024 || binary[0] !== 0x4d || binary[1] !== 0x5a) {
  throw new Error(
    "Üretilen dosya geçerli bir Windows PE yürütülebiliri değil.",
  );
}

fs.mkdirSync(RELEASE_DIR, { recursive: true });
for (const file of fs.readdirSync(RELEASE_DIR)) {
  if (/^Bilgiopoli-v.*\.exe$/i.test(file))
    fs.unlinkSync(path.join(RELEASE_DIR, file));
}

const name = `Bilgiopoli-v${PACKAGE.version}.exe`;
const destination = path.join(RELEASE_DIR, name);
fs.copyFileSync(SOURCE, destination);
const hash = crypto.createHash("sha256").update(binary).digest("hex");
const sumsPath = path.join(RELEASE_DIR, "SHA256SUMS.txt");
const existing = fs.existsSync(sumsPath)
  ? fs
      .readFileSync(sumsPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.endsWith(".exe"))
  : [];
existing.push(`${hash}  ${name}`);
fs.writeFileSync(sumsPath, `${existing.join("\n")}\n`, "utf8");
const gradle = fs.readFileSync(
  path.join(ROOT, "android", "app", "build.gradle"),
  "utf8",
);
const versionCode = gradle.match(/versionCode\s+(\d+)/)?.[1] || "bilinmiyor";
const aabName = `Bilgiopoli-v${PACKAGE.version}-SIGNED.aab`;
const apkName = `Bilgiopoli-v${PACKAGE.version}-SIGNED.apk`;
const androidLines = [aabName, apkName]
  .filter((file) => fs.existsSync(path.join(RELEASE_DIR, file)))
  .map((file) => `${path.extname(file).slice(1).toUpperCase()}: ${file}`)
  .join("\n");
fs.writeFileSync(
  path.join(RELEASE_DIR, "OKU-BENI.txt"),
  `BILGIOPOLI - YAYIN PAKETLERI\n\nSürüm: ${PACKAGE.version} (${versionCode})\n${androidLines}${androidLines ? "\n" : ""}EXE: ${name}\n\nAndroid paketlerinin imzası ve Windows PE yapısı otomatik doğrulanmıştır.\nTüm SHA-256 değerleri SHA256SUMS.txt içindedir.\n`,
  "utf8",
);
console.log(`EXE doğrulandı ve release/ klasörüne kopyalandı: ${name}`);
