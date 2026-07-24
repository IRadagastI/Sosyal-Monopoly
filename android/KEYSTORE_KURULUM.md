# Bilgiopoli — Release Keystore Olusturma (bir kez yapilir)

Play Store icin imzali `.aab` dosyasi gerekir. Asagidaki adimlari **siz** calistirin;
sifreyi guvenli bir yere not edin (kaybederseniz uygulama guncellenemez).

## Yontem A — Android Studio (Onerilen)

1. `npm run cap:open` ile Android Studio'yu acin
2. **Build → Generate Signed App Bundle / APK**
3. **Android App Bundle** secin → **Next**
4. **Create new...** ile yeni keystore olusturun:
   - Key store path: `android/keystore/bilgiopoli-release.jks`
   - Password: kendi sifrenizi secin
   - Alias: `bilgiopoli`
   - Validity: 25+ yil
5. **release** build type → **Create**
6. Cikti: `android/app/release/app-release.aab`

## Yontem B — Komut satiri

PowerShell'de (sifreyi kendiniz belirleyin):

```powershell
cd android
mkdir keystore -Force
keytool -genkeypair -v -storetype PKCS12 `
  -keystore keystore/bilgiopoli-release.jks `
  -alias bilgiopoli -keyalg RSA -keysize 2048 -validity 10000
```

Sonra `android/keystore.properties` dosyasi olusturun:

```properties
storeFile=keystore/bilgiopoli-release.jks
storePassword=SIZIN_SIFRENIZ
keyAlias=bilgiopoli
keyPassword=SIZIN_SIFRENIZ
```

Imzali derleme:

```powershell
cd android
.\gradlew.bat bundleRelease
```

Cikti: `android/app/build/outputs/bundle/release/app-release.aab`
