// index.html sonundaki ana <script> ve js/questions.js için sözdizimi kontrolü.
// new Function(...) derler ama çalıştırmaz -> sadece SyntaxError yakalar.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function checkSyntax(label, code) {
  try {
    // eslint-disable-next-line no-new-func
    new Function(code);
    console.log('[OK]   ' + label);
    return true;
  } catch (e) {
    console.error('[FAIL] ' + label + ' -> ' + e.message);
    return false;
  }
}

let ok = true;

// questions.js
ok &= checkSyntax('js/questions.js', fs.readFileSync(path.join(ROOT, 'js', 'questions.js'), 'utf8'));

// index.html içindeki son inline <script> (src'siz)
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const re = /<script>([\s\S]*?)<\/script>/g;
let m, last = null;
while ((m = re.exec(html)) !== null) last = m[1];
if (!last) { console.error('inline script bulunamadı'); process.exit(1); }
ok &= checkSyntax('index.html ana script', last);

process.exit(ok ? 0 : 1);
