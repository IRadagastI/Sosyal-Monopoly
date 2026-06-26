// 8. sinif sorularindaki yapay "cift-soru" formatini sadelestirir:
//   "<baglam cumlesi?><br><br><dogrudan soru?>"  ->  "<dogrudan soru?>"
// Siklar ikinci (dogrudan) soruyla uyumlu oldugu icin SON segment korunur.
// Liste (I/II/III) formatli sorular ve cok-parcali metinler DEGISTIRILMEZ.
// Ayrica "vadici" -> "vadeli" yazim hatasi duzeltilir.
const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'js', 'questions.js');
let src = fs.readFileSync(file, 'utf8');

// questions8 blogunu izole et (brace eslestirme)
const decl = src.indexOf('const questions8 =');
if (decl === -1) throw new Error('questions8 bulunamadi');
const braceStart = src.indexOf('{', decl);
let depth = 0, end = -1, inStr = null;
for (let i = braceStart; i < src.length; i++) {
  const c = src[i];
  if (inStr) { if (c === '\\') { i++; continue; } if (c === inStr) inStr = null; continue; }
  if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
}
if (end === -1) throw new Error('questions8 kapanisi bulunamadi');

const before = src.slice(0, braceStart);
let block = src.slice(braceStart, end + 1);
const after = src.slice(end + 1);

let simplified = 0, typo = 0;

// Sadece bu blok icindeki q metinlerini isle (q: "...")
block = block.replace(/q: "([^"]*)"/g, (m, content) => {
  let out = content;
  const isList = /Yukar[ıi]daki|yukar[ıi]daki ifade|<br>\s*I\./.test(out);
  if (out.includes('<br><br>') && !isList) {
    const parts = out.split('<br><br>');
    const last = parts[parts.length - 1].trim();
    if (last.endsWith('?') && last.length > 15) { out = last; simplified++; }
  }
  if (out.includes('vadici')) { out = out.split('vadici').join('vadeli'); typo++; }
  return 'q: "' + out + '"';
});

fs.writeFileSync(file, before + block + after, 'utf8');
console.log('Sadelestirilen cift-soru :', simplified);
console.log('Duzeltilen "vadici"      :', typo);
