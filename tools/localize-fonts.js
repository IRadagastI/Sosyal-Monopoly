// Google Fonts 'Outfit' (400/600/800/900) yazi tipini yerellestirir.
// css2 ciktisini modern UA ile ceker, woff2 dosyalarini indirir ve
// vendor/fonts/outfit.css + vendor/fonts/files/*.woff2 olusturur.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'vendor', 'fonts');
const FILES_DIR = path.join(OUT_DIR, 'files');
fs.mkdirSync(FILES_DIR, { recursive: true });

const CSS_URL = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap';
// Chrome UA -> woff2 doner
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function main() {
  const res = await fetch(CSS_URL, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error('css2 alinamadi: ' + res.status);
  let css = await res.text();

  // url(...woff2) baglantilarini bul, indir, yerel yola cevir
  const urlRe = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
  const seen = new Map();
  let m;
  const downloads = [];
  while ((m = urlRe.exec(css)) !== null) {
    const remote = m[1];
    if (seen.has(remote)) continue;
    const fname = remote.split('/').slice(-2).join('-'); // benzersiz ad
    seen.set(remote, fname);
    downloads.push({ remote, fname });
  }

  for (const d of downloads) {
    const r = await fetch(d.remote, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error('font indirilemedi: ' + d.remote);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(FILES_DIR, d.fname), buf);
    console.log('indirildi:', d.fname, buf.length, 'bytes');
  }

  // CSS icindeki uzak url'leri yerel ./files/ yoluna cevir
  for (const [remote, fname] of seen.entries()) {
    css = css.split(remote).join('./files/' + fname);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'outfit.css'), css, 'utf8');
  console.log('\nvendor/fonts/outfit.css yazildi. Toplam', seen.size, 'woff2 dosyasi.');
}

main().catch((e) => { console.error(e); process.exit(1); });
