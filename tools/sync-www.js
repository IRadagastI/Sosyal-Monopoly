// Capacitor icin www/ klasorune web dosyalarini kopyalar.
// Orijinal dosyalar yerinde kalir; sadece Android paketi icin kopya olusturulur.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');

// Kopyalanacak dosya ve klasorler
const items = [
  'index.html',
  'manifest.json',
  'sw.js',
  'privacy.html',
  'css',
  'js',
  'vendor',
  'icons'
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// Eski www icerigini temizle
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

console.log('\nwww/ hazir.');
