// Masaustune Play Store icin %100 uyumlu gorselleri kopyalar/uretir.
const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const DESKTOP = path.join(os.homedir(), 'Desktop', 'Bilgiopoli-Play-Store-Gorselleri');

async function exportExact(src, dest, w, h) {
  await sharp(src).resize(w, h, { fit: 'fill' }).png({ compressionLevel: 9 }).toFile(dest);
  const meta = await sharp(dest).metadata();
  const size = fs.statSync(dest).size;
  return { dest, w: meta.width, h: meta.height, kb: (size / 1024).toFixed(1) };
}

async function exportCopyOptimized(src, dest, maxW, maxH) {
  let img = sharp(src);
  const meta = await img.metadata();
  if (meta.width > maxW || meta.height > maxH) {
    img = img.resize(maxW, maxH, { fit: 'inside', withoutEnlargement: true });
  }
  await img.png({ compressionLevel: 9 }).toFile(dest);
  const out = await sharp(dest).metadata();
  const size = fs.statSync(dest).size;
  return { dest, w: out.width, h: out.height, kb: (size / 1024).toFixed(1) };
}

async function main() {
  fs.mkdirSync(DESKTOP, { recursive: true });

  const jobs = [
    {
      name: '01-uygulama-simgesi-512x512.png',
      run: () => exportExact(path.join(ROOT, 'icons', 'icon-play-store.png'), path.join(DESKTOP, '01-uygulama-simgesi-512x512.png'), 512, 512)
    },
    {
      name: '02-ozellik-grafigi-1024x500.png',
      run: () => exportExact(path.join(ROOT, 'play-store', 'feature-graphic-1024x500.png'), path.join(DESKTOP, '02-ozellik-grafigi-1024x500.png'), 1024, 500)
    },
    {
      name: '03-ekran-goruntusu-ana-menu.png',
      run: () => exportCopyOptimized(path.join(ROOT, 'play-store', 'screenshot-01-landing.png'), path.join(DESKTOP, '03-ekran-goruntusu-ana-menu.png'), 2560, 1440)
    },
    {
      name: '04-ekran-goruntusu-oyun-tahtasi.png',
      run: () => exportCopyOptimized(path.join(ROOT, 'play-store', 'screenshot-02-gameboard.png'), path.join(DESKTOP, '04-ekran-goruntusu-oyun-tahtasi.png'), 2560, 1440)
    }
  ];

  const report = [];
  for (const j of jobs) {
    report.push(await j.run());
    console.log('OK:', j.name);
  }

  const readme = `BILGIOPOLI - PLAY STORE GORSELLERI
================================

Bu klasordeki dosyalari Google Play Console > Magaza girisi > Grafik bolumune yukleyin.

1) 01-uygulama-simgesi-512x512.png
   - Alan: Uygulama simgesi
   - Boyut: 512 x 512 px (PNG, max 1 MB)

2) 02-ozellik-grafigi-1024x500.png
   - Alan: Ozellik grafigi
   - Boyut: 1024 x 500 px (PNG, max 15 MB)

3) 03-ekran-goruntusu-ana-menu.png
4) 04-ekran-goruntusu-oyun-tahtasi.png
   - Alan: Telefon veya 7 inç tablet ekran goruntuleri (yatay)
   - En az 2 adet yukleyin
   - Boyut: 2560 x 1440 px (16:9 yatay)

Video: Bos birakabilirsiniz (zorunlu degil).

Olusturulma: ${new Date().toLocaleString('tr-TR')}
`;

  fs.writeFileSync(path.join(DESKTOP, 'OKU-BENI.txt'), readme, 'utf8');

  console.log('\nKlasor:', DESKTOP);
  report.forEach((r) => console.log(` - ${path.basename(r.dest)}: ${r.w}x${r.h}, ${r.kb} KB`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
