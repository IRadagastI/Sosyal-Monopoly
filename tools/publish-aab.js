// Derlenen imzali AAB'yi release/ klasorune kopyalar; eski .aab dosyalarini siler.
// Kullanim: node tools/publish-aab.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(ROOT, 'release');
const GRADLE = path.join(ROOT, 'android', 'app', 'build.gradle');
const BUILT_AAB = path.join(
  ROOT,
  'android',
  'app',
  'build',
  'outputs',
  'bundle',
  'release',
  'app-release.aab'
);

function readVersion() {
  const gradle = fs.readFileSync(GRADLE, 'utf8');
  const code = gradle.match(/versionCode\s+(\d+)/);
  const name = gradle.match(/versionName\s+"([^"]+)"/);
  if (!code || !name) {
    throw new Error('build.gradle icinde versionCode / versionName bulunamadi.');
  }
  return { versionCode: code[1], versionName: name[1] };
}

function removeOldAabs() {
  if (!fs.existsSync(RELEASE_DIR)) {
    fs.mkdirSync(RELEASE_DIR, { recursive: true });
    return;
  }
  for (const file of fs.readdirSync(RELEASE_DIR)) {
    if (file.toLowerCase().endsWith('.aab')) {
      fs.unlinkSync(path.join(RELEASE_DIR, file));
      console.log('Silindi (eski surum):', file);
    }
  }
}

function writeReadme(versionName, versionCode, destName) {
  const text = `BILGIOPOLI - PLAY STORE PAKETI
================================

Bu klasorde her zaman TEK guncel imzali .aab dosyasi bulunur.
Yeni surum derlendiginde eskiler otomatik silinir.

Guncel dosya: ${destName}
Surum: ${versionName} (${versionCode})

Play Console yukleme:
  Test edin ve yayinlayin -> Dahili test -> Yeni surum olustur
  Bu .aab dosyasini surukleyip birakin.

Kaynak (gradle ciktisi):
  android/app/build/outputs/bundle/release/app-release.aab

Keystore: android/keystore/ (git'e girmez)
Keystore bilgisi: android/keystore/KEYSTORE_BILGI.txt

ONEMLI: Keystore sifresini kaybederseniz uygulamayi guncelleyemezsiniz!

Son guncelleme: ${new Date().toLocaleString('tr-TR')}
`;
  fs.writeFileSync(path.join(RELEASE_DIR, 'OKU-BENI.txt'), text, 'utf8');
}

function main() {
  if (!fs.existsSync(BUILT_AAB)) {
    console.error('Imzali AAB bulunamadi. Once derleyin:');
    console.error('  npm run android:bundle');
    process.exit(1);
  }

  const { versionName, versionCode } = readVersion();
  const destName = `Bilgiopoli-v${versionName}-SIGNED.aab`;
  const destPath = path.join(RELEASE_DIR, destName);

  removeOldAabs();
  fs.copyFileSync(BUILT_AAB, destPath);
  writeReadme(versionName, versionCode, destName);

  const sizeMb = (fs.statSync(destPath).size / (1024 * 1024)).toFixed(2);
  console.log('OK:', destPath);
  console.log(`Surum ${versionName} (${versionCode}) · ${sizeMb} MB`);
}

main();
