// index.html'de YINELENEN ilk checkFinal fonksiyonunu kaldirir.
// Ikinci tanim (Buyuk Final +1000 SBP) aktif olan oldugu icin korunur.
const fs = require('fs');
const path = require('path');
const idx = path.resolve(__dirname, '..', 'index.html');
let html = fs.readFileSync(idx, 'utf8');

const sig = 'function checkFinal(btn, selected, correct)';
const first = html.indexOf(sig);
if (first === -1) throw new Error('checkFinal bulunamadi');
const second = html.indexOf(sig, first + 1);
if (second === -1) throw new Error('ikinci checkFinal yok (zaten temizlenmis olabilir)');

// Ilk fonksiyonun govdesini brace sayarak bul
const braceStart = html.indexOf('{', first);
let depth = 0, end = -1, inStr = null;
for (let i = braceStart; i < html.length; i++) {
  const c = html[i];
  if (inStr) { if (c === '\\') { i++; continue; } if (c === inStr) inStr = null; continue; }
  if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
}
if (end === -1) throw new Error('ilk checkFinal kapanisi bulunamadi');

// Fonksiyon basindan kapanis }'ine kadar olan blogu (ve cevresindeki fazla bos satirlari) sil
let blockStart = first;
// onceki bos satir(lar)i tek bos satira indir: function'dan onceki satir basina geri sar
while (blockStart > 0 && html[blockStart - 1] !== '\n') blockStart--; // satir basi
let after = end + 1;
// kapanistan sonra gelen newline ve takip eden tek bos satiri yut
if (html[after] === '\n') after++;
if (html.slice(after).match(/^\s*\n/)) after += html.slice(after).match(/^\s*\n/)[0].length;

html = html.slice(0, blockStart) + html.slice(after);
fs.writeFileSync(idx, html, 'utf8');

const remaining = (html.match(/function checkFinal\(/g) || []).length;
console.log('Kalan checkFinal tanim sayisi:', remaining);
