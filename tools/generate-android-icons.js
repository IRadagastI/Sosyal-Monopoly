// Android launcher ikonlarini uretir (legacy + adaptive foreground).
// Adaptive icon: API 26+ telefonlar ic_launcher_foreground kullanir;
// eski Capacitor placeholder birakilirsa ikon gorunmez veya bos kalir.
const fs = require('fs');
const path = require('path');

const LEGACY_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Adaptive foreground: 108dp taban (Google guvenli bolge ~%66)
const FOREGROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432
};

async function generateAndroidLauncherIcons(sharp, sourceBuffer, rootDir) {
  const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

  for (const [folder, size] of Object.entries(LEGACY_SIZES)) {
    const dir = path.join(resDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    const buf = await sharp(sourceBuffer).resize(size, size).png().toBuffer();
    const launcher = path.join(dir, 'ic_launcher.png');
    const round = path.join(dir, 'ic_launcher_round.png');
    await sharp(buf).toFile(launcher);
    await sharp(buf).toFile(round);
    console.log('OK: android/' + folder + '/ic_launcher.png');
  }

  for (const [folder, canvasSize] of Object.entries(FOREGROUND_SIZES)) {
    const dir = path.join(resDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    const iconSize = canvasSize;
    const pad = 0;
    const iconBuf = await sharp(sourceBuffer).resize(iconSize, iconSize).png().toBuffer();
    await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: iconBuf, left: pad, top: pad }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
    console.log('OK: android/' + folder + '/ic_launcher_foreground.png');
  }
}

module.exports = { generateAndroidLauncherIcons };
