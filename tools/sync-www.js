// Capacitor icin www/ klasorune web dosyalarini kopyalar.
// Duz metin js/questions.js KOPYALANMAZ — sadece sifreli questions.bundle.js gider.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');

const items = [
  'index.html',
  'manifest.json',
  'sw.js',
  'privacy.html',
  'css',
  'vendor',
  'icons'
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

// Once sifreli soru paketini guncelle.
// js/questions.js sadece yerel kaynaktir (git'e girmez). Bulunmadigi makinede
// mevcut js/questions.bundle.js zaten guncel kabul edilir; build'i kirmak yerine
// bu adimi atla. Boylece soru havuzuna dokunmayan degisiklikler (arayuz/mantik)
// kaynak dosya olmadan da yayina alinabilir.
const questionsSrc = path.join(root, 'js', 'questions.js');
const questionsBundle = path.join(root, 'js', 'questions.bundle.js');
if (fs.existsSync(questionsSrc)) {
  execSync('node tools/protect-questions.js', { cwd: root, stdio: 'inherit' });
} else if (fs.existsSync(questionsBundle)) {
  console.warn('js/questions.js yok — mevcut js/questions.bundle.js kullanilacak.');
  console.warn('Sorulari degistirecekseniz once js/questions.js dosyasini geri koyun.');
} else {
  console.error('HATA: ne js/questions.js ne js/questions.bundle.js bulundu.');
  process.exit(1);
}

if (fs.existsSync(www)) {
  fs.rmSync(www, { recursive: true, force: true });
}
fs.mkdirSync(www, { recursive: true });

for (const item of items) {
  const src = path.join(root, item);
  if (!fs.existsSync(src)) {
    console.warn('Atlandi (bulunamadi):', item);
    continue;
  }
  copyRecursive(src, path.join(www, item));
  console.log('Kopyalandi:', item);
}

// js: sadece bundle + baska dosyalar (questions.js haric)
const jsSrc = path.join(root, 'js');
const jsDest = path.join(www, 'js');
fs.mkdirSync(jsDest, { recursive: true });
for (const entry of fs.readdirSync(jsSrc)) {
  if (entry === 'questions.js') {
    console.log('Atlandi (duz metin): js/questions.js');
    continue;
  }
  copyRecursive(path.join(jsSrc, entry), path.join(jsDest, entry));
  console.log('Kopyalandi: js/' + entry);
}

console.log('\nwww/ hazir (sorular sifreli).');
