const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "js", "questions.js");
const BUNDLE = path.join(ROOT, "js", "questions.bundle.js");
const HASH_FILE = path.join(ROOT, "js", "questions.bundle.sha256");

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

if (!fs.existsSync(BUNDLE) || !fs.existsSync(HASH_FILE)) {
  throw new Error(
    "Soru bundle veya SHA-256 manifesti bulunamadı. npm run protect:questions çalıştırın.",
  );
}

const bundle = fs.readFileSync(BUNDLE);
const expectedBundleHash = fs
  .readFileSync(HASH_FILE, "utf8")
  .trim()
  .split(/\s+/)[0];
const actualBundleHash = sha256(bundle);
if (
  !/^[a-f0-9]{64}$/i.test(expectedBundleHash) ||
  actualBundleHash !== expectedBundleHash
) {
  throw new Error(
    `Soru bundle SHA-256 uyuşmuyor. Beklenen ${expectedBundleHash}, bulunan ${actualBundleHash}.`,
  );
}

if (fs.existsSync(SOURCE)) {
  const header = bundle
    .toString("utf8")
    .match(/^\/\/ source-sha256: ([a-f0-9]{64})$/m);
  const actualSourceHash = sha256(fs.readFileSync(SOURCE));
  if (!header || header[1] !== actualSourceHash) {
    throw new Error(
      "Yerel js/questions.js, izlenen bundle ile aynı sürümde değil. npm run protect:questions çalıştırın.",
    );
  }
  console.log("Kaynak ve bundle aynı sürümde.");
}

console.log(`Soru bundle SHA-256 doğrulandı: ${actualBundleHash}`);
