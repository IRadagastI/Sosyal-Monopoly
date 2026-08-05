// Capacitor icin www/ klasorune web dosyalarini kopyalar.
// Düz metin js/questions.js KOPYALANMAZ — yalnız obfuscate edilmiş bundle gider.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const www = path.join(root, "www");

const items = [
  "index.html",
  "manifest.json",
  "sw.js",
  "privacy.html",
  "css",
  "vendor",
  "icons",
];

function copyRecursive(src, dest, skipFiles) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (skipFiles && skipFiles.has(path.join(src, entry))) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry), skipFiles);
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// Önce soru paketini güncelle ve bütünlüğünü doğrula.
// js/questions.js sadece yerel kaynaktir (git'e girmez). Bulunmadigi makinede
// mevcut js/questions.bundle.js zaten guncel kabul edilir; build'i kirmak yerine
// bu adimi atla. Boylece soru havuzuna dokunmayan degisiklikler (arayuz/mantik)
// kaynak dosya olmadan da yayina alinabilir.
const questionsSrc = path.join(root, "js", "questions.js");
const questionsBundle = path.join(root, "js", "questions.bundle.js");
if (fs.existsSync(questionsSrc)) {
  execSync("node tools/protect-questions.js", { cwd: root, stdio: "inherit" });
} else if (fs.existsSync(questionsBundle)) {
  console.warn(
    "js/questions.js yok — SHA-256 ile doğrulanan mevcut bundle kullanılacak.",
  );
} else {
  console.error("HATA: ne js/questions.js ne js/questions.bundle.js bulundu.");
  process.exit(1);
}

execSync("node tools/verify-question-bundle.js", {
  cwd: root,
  stdio: "inherit",
});
execSync("node tools/validate-questions.js", { cwd: root, stdio: "inherit" });

if (fs.existsSync(www)) {
  fs.rmSync(www, { recursive: true, force: true });
}
fs.mkdirSync(www, { recursive: true });

for (const item of items) {
  const src = path.join(root, item);
  if (!fs.existsSync(src)) {
    console.warn("Atlandi (bulunamadi):", item);
    continue;
  }
  copyRecursive(src, path.join(www, item));
  console.log("Kopyalandi:", item);
}

// js: yalnızca çalışma zamanında gereken açıkça izinli dosyalar
const jsSrc = path.join(root, "js");
const jsDest = path.join(www, "js");
fs.mkdirSync(jsDest, { recursive: true });
const publishedJs = [
  "game.js",
  "questions.bundle.js",
  "questions.bundle.sha256",
];
for (const entry of publishedJs) {
  copyRecursive(path.join(jsSrc, entry), path.join(jsDest, entry));
  console.log("Kopyalandi: js/" + entry);
}
console.log("Atlandi (özel kaynak): js/questions.js");

console.log("\nwww/ hazır (sorular doğrulandı ve obfuscate edildi).");
