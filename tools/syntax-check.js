// Harici oyun motoru ve soru kaynak/bundle dosyaları için sözdizimi kontrolü.
// new Function(...) derler ama çalıştırmaz -> sadece SyntaxError yakalar.
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

function checkSyntax(label, code) {
  try {
    new Function(code);
    console.log("[OK]   " + label);
    return true;
  } catch (e) {
    console.error("[FAIL] " + label + " -> " + e.message);
    return false;
  }
}

let ok = true;

const sourcePath = path.join(ROOT, "js", "questions.js");
if (fs.existsSync(sourcePath)) {
  ok &= checkSyntax("js/questions.js", fs.readFileSync(sourcePath, "utf8"));
}
ok &= checkSyntax(
  "js/questions.bundle.js",
  fs.readFileSync(path.join(ROOT, "js", "questions.bundle.js"), "utf8"),
);
ok &= checkSyntax(
  "js/game.js",
  fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8"),
);

process.exit(ok ? 0 : 1);
