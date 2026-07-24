// SVG'den Play Store / PWA icin PNG ikonlar uretir.
// Kullanim: node tools/generate-icons.js
const fs = require('fs');
const path = require('path');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('sharp paketi gerekli. Calistirin: npm install --save-dev sharp');
    process.exit(1);
  }

  const iconsDir = path.resolve(__dirname, '..', 'icons');
  const svgPath = path.join(iconsDir, 'icon.svg');
  const svg = fs.readFileSync(svgPath);

  const specs = [
    { size: 192, name: 'icon-192.png', maskable: false },
    { size: 512, name: 'icon-512.png', maskable: false },
    { size: 512, name: 'icon-maskable-512.png', maskable: true },
    { size: 512, name: 'icon-play-store.png', maskable: false }
  ];

  for (const s of specs) {
    const out = path.join(iconsDir, s.name);
    if (s.maskable) {
      // Maskable: %10 guvenli kenar boslugu + koyu arka plan
      const inner = Math.round(s.size * 0.8);
      const pad = Math.round((s.size - inner) / 2);
      const innerBuf = await sharp(svg).resize(inner, inner).png().toBuffer();
      await sharp({
        create: {
          width: s.size,
          height: s.size,
          channels: 4,
          background: { r: 15, g: 23, b: 42, alpha: 1 }
        }
      })
        .composite([{ input: innerBuf, left: pad, top: pad }])
        .png()
        .toFile(out);
    } else {
      await sharp(svg).resize(s.size, s.size).png().toFile(out);
    }
    console.log('OK:', s.name);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
