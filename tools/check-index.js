const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const game = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
const checks = [
  ["harici CSS", html.includes('href="css/style.css"')],
  ["soru bundle", html.includes('src="js/questions.bundle.js"')],
  ["harici oyun motoru", html.includes('src="js/game.js"')],
  ["düz soru kaynağı yayınlanmıyor", !html.includes('src="js/questions.js"')],
  [
    "inline script yok",
    !/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i.test(html),
  ],
  ["inline olay işleyici yok", !/\son[a-z]+\s*=/i.test(html)],
  ["dinamik inline olay işleyici yok", !/\son[a-z]+\s*=/i.test(game)],
  [
    "Content Security Policy var",
    /http-equiv="Content-Security-Policy"/i.test(html),
  ],
];

let failed = 0;
for (const [label, passed] of checks) {
  console.log(`${passed ? "[OK]  " : "[FAIL]"} ${label}`);
  if (!passed) failed++;
}
if (failed) {
  console.error(`\n${failed} yapı kontrolü başarısız.`);
  process.exit(1);
}
console.log("\nindex.html yapısı doğrulandı.");
