const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const ANDROID = path.join(ROOT, "android");
const KEYSTORE_PROPERTIES = path.join(ANDROID, "keystore.properties");

if (!fs.existsSync(KEYSTORE_PROPERTIES)) {
  throw new Error(
    "Release derlemesi durduruldu: android/keystore.properties bulunamadı.",
  );
}

function javaMajor(javaHome) {
  const executable = path.join(
    javaHome,
    "bin",
    process.platform === "win32" ? "java.exe" : "java",
  );
  if (!fs.existsSync(executable)) return 0;
  const result = spawnSync(executable, ["-version"], { encoding: "utf8" });
  const match = `${result.stdout || ""}${result.stderr || ""}`.match(
    /version "(\d+)/,
  );
  return match ? Number(match[1]) : 0;
}

const candidates = [
  process.env.BILGIOPOLI_JAVA_HOME,
  process.env.JAVA_HOME,
  process.platform === "win32"
    ? "C:\\Program Files\\Android\\Android Studio\\jbr"
    : null,
  process.platform === "darwin"
    ? "/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    : null,
].filter(Boolean);
const javaHome = candidates.find((candidate) => javaMajor(candidate) >= 21);
if (!javaHome)
  throw new Error(
    "Android release için JDK 21 bulunamadı. BILGIOPOLI_JAVA_HOME ayarlayın.",
  );

const wrapper = path.join(
  ANDROID,
  process.platform === "win32" ? "gradlew.bat" : "gradlew",
);
const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  PATH: `${path.join(javaHome, "bin")}${path.delimiter}${process.env.PATH || ""}`,
};
const args = [
  "--no-daemon",
  "clean",
  "testReleaseUnitTest",
  "lintRelease",
  "assembleRelease",
  "bundleRelease",
];
const gradleCommand =
  process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : wrapper;
const gradleArgs =
  process.platform === "win32"
    ? ["/d", "/s", "/c", path.basename(wrapper), ...args]
    : args;
const result = spawnSync(gradleCommand, gradleArgs, {
  cwd: ANDROID,
  env,
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status || 1);

const publish = spawnSync(
  process.execPath,
  [path.join(ROOT, "tools", "publish-android.js")],
  {
    cwd: ROOT,
    env,
    stdio: "inherit",
  },
);
process.exit(publish.status || 0);
