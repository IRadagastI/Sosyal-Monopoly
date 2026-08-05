// Soru havuzu doğrular: her soru { q, opts[4], ans:0..3 } olmalı.
// Yerelde kaynak varsa onu, temiz klonda ise izlenen bundle'i doğrular.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const names = [
  "questions5",
  "questions6",
  "questions7",
  "questions8",
  "finalQuestionsPool5",
  "finalQuestionsPool6",
  "finalQuestionsPool7",
  "finalQuestionsPool8",
];
const sourcePath = path.join(ROOT, "js", "questions.js");
const bundlePath = path.join(ROOT, "js", "questions.bundle.js");

function loadPools() {
  const forceBundle = process.argv.includes("--bundle");
  if (!forceBundle && fs.existsSync(sourcePath)) {
    const code = fs.readFileSync(sourcePath, "utf8");
    const sandbox = {};
    vm.createContext(sandbox);
    const wrapped = code + `\nthis.__pools = { ${names.join(", ")} };`;
    vm.runInContext(wrapped, sandbox, { filename: sourcePath });
    return { pools: sandbox.__pools, label: "js/questions.js" };
  }
  if (!fs.existsSync(bundlePath))
    throw new Error("Ne js/questions.js ne de js/questions.bundle.js bulundu.");
  const window = {};
  const sandbox = {
    window,
    Uint8Array,
    TextDecoder,
    atob: (value) => Buffer.from(value, "base64").toString("binary"),
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(bundlePath, "utf8"), sandbox, {
    filename: bundlePath,
  });
  const pools = Object.fromEntries(names.map((name) => [name, window[name]]));
  return { pools, label: "js/questions.bundle.js" };
}

const loaded = loadPools();
const pools = loaded.pools;
let errors = 0;
let total = 0;

function checkQ(label, q) {
  total++;
  if (!q || typeof q !== "object" || Array.isArray(q)) {
    console.error(`[HATA] ${label}: soru nesne değil`);
    errors++;
    return;
  }
  if (typeof q.q !== "string" || !q.q.trim()) {
    console.error(`[HATA] ${label}: q metni boş`);
    errors++;
  }
  if (!Array.isArray(q.opts) || q.opts.length !== 4) {
    console.error(`[HATA] ${label}: opts 4 değil (${q.opts && q.opts.length})`);
    errors++;
  } else if (q.opts.some((opt) => typeof opt !== "string" || !opt.trim())) {
    console.error(`[HATA] ${label}: boş veya metin olmayan şık var`);
    errors++;
  }
  if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans > 3) {
    console.error(`[HATA] ${label}: ans geçersiz (${q.ans})`);
    errors++;
  }
  const optionFields = Array.isArray(q.opts)
    ? q.opts.map((opt, index) => [`opts[${index}]`, opt])
    : [];
  for (const [field, value] of [["q", q.q], ...optionFields]) {
    if (typeof value !== "string") continue;
    const withoutLineBreaks = value.replace(/<br\s*\/?\s*>/gi, "");
    if (/<[^>]*>|\bon[a-z]+\s*=/i.test(withoutLineBreaks)) {
      console.error(
        `[HATA] ${label}.${field}: yalnız <br> HTML etiketi kullanılabilir`,
      );
      errors++;
    }
  }
}

for (const [name, pool] of Object.entries(pools)) {
  if (Array.isArray(pool)) {
    pool.forEach((q, i) => checkQ(`${name}[${i}]`, q));
    console.log(`${name}: ${pool.length} soru`);
  } else {
    let count = 0;
    for (const unit of Object.keys(pool)) {
      pool[unit].forEach((q, i) => checkQ(`${name}.unit${unit}[${i}]`, q));
      count += pool[unit].length;
    }
    console.log(`${name}: ${count} soru (${Object.keys(pool).length} ünite)`);
  }
}

console.log(`\nKaynak: ${loaded.label}`);
console.log(`Toplam: ${total} soru, ${errors} hata`);
process.exit(errors ? 1 : 0);
