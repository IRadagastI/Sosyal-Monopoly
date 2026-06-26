// Tek dosyalık index.html'i modüllere ayırır:
//  - <head> içindeki büyük <style> bloğu  -> css/style.css
//  - Soru havuzu const'ları               -> js/questions.js
// String/yorum duyarlı tarayıcı ile parantez eşleştirmesi yapar (güvenli kesim).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const idxPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(idxPath, 'utf8');

// --- 1) İlk <style> ... </style> bloğunu çıkar (head içindeki büyük blok) ---
const styleOpen = html.indexOf('<style>');
const styleClose = html.indexOf('</style>', styleOpen);
if (styleOpen === -1 || styleClose === -1) throw new Error('style bloğu bulunamadı');
const cssContent = html.slice(styleOpen + '<style>'.length, styleClose);
fs.mkdirSync(path.join(ROOT, 'css'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'css', 'style.css'), cssContent.replace(/^\n/, ''), 'utf8');
html = html.slice(0, styleOpen) + '<link rel="stylesheet" href="css/style.css">' + html.slice(styleClose + '</style>'.length);

// --- 2) Soru havuzu const'larını çıkar ---
// String (', ", `) ve yorum (// , /* */) duyarlı eşleştirici
function findMatch(src, openIdx) {
  const open = src[openIdx];
  const close = open === '{' ? '}' : ']';
  let depth = 0, inStr = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '/') {
      const n = src[i + 1];
      if (n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (n === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i++; continue; }
    }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return i; }
  }
  return -1;
}

const names = [
  'questions5', 'questions6', 'questions7', 'questions8',
  'finalQuestionsPool5', 'finalQuestionsPool6', 'finalQuestionsPool7', 'finalQuestionsPool8'
];

const extracted = [];
for (const name of names) {
  const re = new RegExp('const\\s+' + name + '\\s*=\\s*', 'g');
  const m = re.exec(html);
  if (!m) throw new Error('bulunamadı: ' + name);
  const declStart = m.index;
  let p = m.index + m[0].length;
  const openChar = html[p];
  if (openChar !== '{' && openChar !== '[') throw new Error(name + ' için açılış parantezi yok: ' + JSON.stringify(html.slice(p, p + 20)));
  const matchIdx = findMatch(html, p);
  if (matchIdx === -1) throw new Error(name + ' kapanışı bulunamadı');
  let end = matchIdx + 1;
  // sondaki noktalı virgülü de dahil et
  while (end < html.length && /\s/.test(html[end])) end++;
  if (html[end] === ';') end++;
  const segment = html.slice(declStart, end);
  extracted.push({ name, declStart, end, segment });
}

// Yüksek indexten düşüğe doğru kaldır (index kaymasını önlemek için)
extracted.sort((a, b) => b.declStart - a.declStart);
for (const e of extracted) {
  html = html.slice(0, e.declStart) + html.slice(e.end);
}

// Bildirim sırasına göre questions.js içeriğini oluştur
const inOrder = [...extracted].sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name));
const header = '// Bilgiopoli - Soru Havuzu (5/6/7/8. sinif)\n// Bu dosya index.html icindeki ana script\'ten ONCE yuklenmelidir.\n\n';
const jsContent = header + inOrder.map(e => e.segment.trim()).join('\n\n') + '\n';
fs.mkdirSync(path.join(ROOT, 'js'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'js', 'questions.js'), jsContent, 'utf8');

// --- 3) Ana script'ten ONCE questions.js'i ekle ---
const anchor = html.indexOf('let baseTeams');
if (anchor === -1) throw new Error('ana script bağlantı noktası (let baseTeams) bulunamadı');
const scriptTagIdx = html.lastIndexOf('<script>', anchor);
if (scriptTagIdx === -1) throw new Error('ana <script> etiketi bulunamadı');
html = html.slice(0, scriptTagIdx) + '<script src="js/questions.js"></script>\n\n    ' + html.slice(scriptTagIdx);

fs.writeFileSync(idxPath, html, 'utf8');

// Diagnostik
console.log('css/style.css       :', fs.statSync(path.join(ROOT, 'css', 'style.css')).size, 'bytes');
console.log('js/questions.js     :', fs.statSync(path.join(ROOT, 'js', 'questions.js')).size, 'bytes');
console.log('yeni index.html     :', fs.statSync(idxPath).size, 'bytes');
console.log('cikarilan const\'lar :', inOrder.map(e => e.name).join(', '));
