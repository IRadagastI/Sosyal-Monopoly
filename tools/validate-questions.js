// Soru havuzunu doğrular: her soru { q, opts[4], ans:0..3 } olmalı.
// Kullanım: node tools/validate-questions.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'js', 'questions.js'), 'utf8');

const sandbox = {};
vm.createContext(sandbox);
// const'ları yakalamak için sonuna toplama ekle
const wrapped = code + '\nthis.__pools = { questions5, questions6, questions7, questions8, finalQuestionsPool5, finalQuestionsPool6, finalQuestionsPool7, finalQuestionsPool8 };';
vm.runInContext(wrapped, sandbox);

const pools = sandbox.__pools;
let errors = 0;
let total = 0;

function checkQ(label, q) {
  total++;
  if (typeof q.q !== 'string' || !q.q.trim()) { console.error(`[HATA] ${label}: q metni boş`); errors++; }
  if (!Array.isArray(q.opts) || q.opts.length !== 4) { console.error(`[HATA] ${label}: opts 4 değil (${q.opts && q.opts.length})`); errors++; }
  if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans > 3) { console.error(`[HATA] ${label}: ans geçersiz (${q.ans})`); errors++; }
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

console.log(`\nToplam: ${total} soru, ${errors} hata`);
process.exit(errors ? 1 : 0);
