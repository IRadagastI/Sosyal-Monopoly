// Soru havuzunu sifreleyip js/questions.bundle.js uretir.
// Kaynak: js/questions.js (duzenleme) | Yayin: js/questions.bundle.js (sifreli, okunmasi zor)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'js', 'questions.js');
const OUT = path.join(ROOT, 'js', 'questions.bundle.js');

function buildKey() {
  const parts = ['com', 'iradagasti', 'bilgiopoli', 'soru', '2025'];
  let key = parts.join(':');
  let out = '';
  for (let i = 0; i < key.length; i++) {
    out += String.fromCharCode(key.charCodeAt(i) ^ ((i * 13 + 13) % 256));
  }
  return out;
}

function keyToBytes(key) {
  const out = Buffer.alloc(key.length);
  for (let i = 0; i < key.length; i++) out[i] = key.charCodeAt(i) & 0xff;
  return out;
}

function xorBytes(buf, keyStr) {
  const keyBuf = keyToBytes(keyStr);
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] ^ keyBuf[i % keyBuf.length];
  }
  return out;
}

function loadPools() {
  const code = fs.readFileSync(SRC, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  const wrapped = code + '\nthis.__pools = { questions5, questions6, questions7, questions8, finalQuestionsPool5, finalQuestionsPool6, finalQuestionsPool7, finalQuestionsPool8 };';
  vm.runInContext(wrapped, sandbox);
  return sandbox.__pools;
}

function main() {
  const pools = loadPools();
  const json = JSON.stringify(pools);
  const key = buildKey();
  const keyCodes = [...key].map((c) => c.charCodeAt(0) & 0xff);
  const encrypted = xorBytes(Buffer.from(json, 'utf8'), key);
  const b64 = encrypted.toString('base64');

  // 80 karakterlik parcalara bol - duz metin aramasini zorlastirir
  const chunks = [];
  for (let i = 0; i < b64.length; i += 80) {
    chunks.push(b64.slice(i, i + 80));
  }

  const bundle = `// Bilgiopoli - sifreli soru paketi (otomatik uretilir)
(function(){
'use strict';
var _kb=new Uint8Array(${JSON.stringify(keyCodes)});
var _c=${JSON.stringify(chunks)};
function _u8(b64,kb){
  var bin=atob(b64),a=new Uint8Array(bin.length),i=0;
  for(;i<bin.length;i++) a[i]=bin.charCodeAt(i)^kb[i%kb.length];
  return a;
}
var _data=_u8(_c.join(''),_kb);
var _json=new TextDecoder('utf-8').decode(_data);
var _pools=JSON.parse(_json);
window.questions5=_pools.questions5;
window.questions6=_pools.questions6;
window.questions7=_pools.questions7;
window.questions8=_pools.questions8;
window.finalQuestionsPool5=_pools.finalQuestionsPool5;
window.finalQuestionsPool6=_pools.finalQuestionsPool6;
window.finalQuestionsPool7=_pools.finalQuestionsPool7;
window.finalQuestionsPool8=_pools.finalQuestionsPool8;
window.__questionsReady=Promise.resolve();
})();
`;

  fs.writeFileSync(OUT, bundle, 'utf8');

  // Dogrulama
  const roundTrip = xorBytes(Buffer.from(b64, 'base64'), key).toString('utf8');
  const parsed = JSON.parse(roundTrip);
  let count = 0;
  for (const p of Object.values(parsed)) {
    if (Array.isArray(p)) count += p.length;
    else count += Object.values(p).reduce((a, u) => a + u.length, 0);
  }

  console.log('Sifreli paket:', path.relative(ROOT, OUT));
  console.log('Ham JSON:', (json.length / 1024).toFixed(1), 'KB');
  console.log('Sifreli paket:', (bundle.length / 1024).toFixed(1), 'KB');
  console.log('Toplam soru:', count);
}

main();
