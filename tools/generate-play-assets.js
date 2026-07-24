// Play Store icin feature graphic (1024x500) ve ekran goruntuleri uretir.
// Kullanim: node tools/generate-play-assets.js
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'play-store');

async function ensureSharp() {
  try {
    return require('sharp');
  } catch {
    console.error('sharp gerekli: npm install --save-dev sharp');
    process.exit(1);
  }
}

async function generateFeatureGraphic(sharp) {
  const width = 1024;
  const height = 500;
  const iconPath = path.join(root, 'icons', 'icon-512.png');
  const icon = await sharp(iconPath).resize(220, 220).png().toBuffer();

  // Basit gradient arka plan + ikon + metin alani (SVG overlay)
  const overlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="24" fill="none" stroke="#334155" stroke-width="3"/>
      <text x="280" y="210" fill="#fbbf24" font-family="Arial, sans-serif" font-size="64" font-weight="800">BİLGİOPOLİ</text>
      <text x="280" y="270" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="34" font-weight="600">Sosyal Bilgiler Eğitici Oyun</text>
      <text x="280" y="330" fill="#94a3b8" font-family="Arial, sans-serif" font-size="24">5–8. Sınıf • Müfredata Uygun • Çevrimdışı</text>
      <circle cx="930" cy="90" r="8" fill="#10b981"/>
      <circle cx="960" cy="90" r="8" fill="#3b82f6"/>
      <circle cx="990" cy="90" r="8" fill="#a855f7"/>
    </svg>
  `);

  const base = await sharp(overlay).png().toBuffer();
  await sharp(base)
    .composite([{ input: icon, left: 36, top: 140 }])
    .png()
    .toFile(path.join(outDir, 'feature-graphic-1024x500.png'));

  console.log('OK: play-store/feature-graphic-1024x500.png');
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = path.join(root, urlPath.replace(/^\//, '').replace(/\.\./g, ''));
      if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404); res.end('Not found'); return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2'
      };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

async function generateScreenshots() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    console.warn('playwright yuklu degil; ekran goruntuleri atlandi.');
    return;
  }

  const port = 8765;
  const server = await startServer(port);
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  try {
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, 'screenshot-01-landing.png'), fullPage: false });

    await page.click('.btn-start');
    await page.waitForSelector('#smartboard-frame', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(outDir, 'screenshot-02-gameboard.png'), fullPage: false });

    console.log('OK: play-store/screenshot-01-landing.png');
    console.log('OK: play-store/screenshot-02-gameboard.png');
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
}

async function generateAndroidIcons(sharp) {
  const src = path.join(root, 'icons', 'icon-512.png');
  const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');
  const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };

  for (const [folder, size] of Object.entries(sizes)) {
    const dir = path.join(resDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    const buf = await sharp(src).resize(size, size).png().toBuffer();
    await sharp(buf).toFile(path.join(dir, 'ic_launcher.png'));
    await sharp(buf).toFile(path.join(dir, 'ic_launcher_round.png'));
    console.log('OK: android .../' + folder + '/ic_launcher.png');
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const sharp = await ensureSharp();
  await generateFeatureGraphic(sharp);
  await generateAndroidIcons(sharp);
  await generateScreenshots();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
