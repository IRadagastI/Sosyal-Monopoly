# Google Play'e Yayınlama Rehberi — Sosyal Bilgiler Monopoly

Bu oyun bir web uygulamasıdır (`index.html`). Google Play'e koymak için onu bir Android paketine (`.aab`) sarmalamanız gerekir. İki yol vardır.

---

## Yol A — Capacitor (Önerilen, native his)

### 1. Gereksinimler
- Node.js 18+
- Android Studio (SDK + JDK)

### 2. Kurulum
```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Sosyal Monopoly" "com.sirketiniz.sosyalmonopoly" --web-dir=.
npx cap add android
```

> `--web-dir=.` : Proje kökündeki `index.html` doğrudan kullanılır.
> `appId` (`com.sirketiniz.sosyalmonopoly`) Play'de benzersiz olmalı; kendi alan adınıza göre değiştirin.

### 3. Yatay (landscape) kilidi
`android/app/src/main/AndroidManifest.xml` içinde ana activity'e ekleyin:
```xml
android:screenOrientation="sensorLandscape"
```

### 4. Çalıştır / derle
```bash
npx cap sync android
npx cap open android   # Android Studio açılır
```
Android Studio'da: **Build > Generate Signed Bundle / APK > Android App Bundle (.aab)**.

---

## Yol B — TWA (Trusted Web Activity, PWA tabanlı)

Oyunu önce bir HTTPS adresine deploy edin (Netlify, GitHub Pages vb.), sonra:

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://SITE-ADRESINIZ/manifest.json
bubblewrap build
```
Çıktı: imzalı `.aab`. (Bu yol için site canlı ve `manifest.json` erişilebilir olmalı.)

---

## Yayın Öncesi Kontrol Listesi
- [ ] `PRIVACY.md` içeriğini bir HTTPS sayfasında yayınlayın; Play Console'a **Gizlilik Politikası URL'si** olarak girin.
- [ ] `icons/generate-icons.html` ile `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` üretip `icons/` klasörüne koyun.
- [ ] Play Console: Uygulama ikonu (512x512), özellik grafiği (1024x500), en az 2 ekran görüntüsü (yatay).
- [ ] **İçerik derecelendirmesi** anketi (eğitim/çocuk).
- [ ] **Data Safety** formu: "Veri toplanmıyor" olarak işaretleyin (mevcut sürümde doğru).
- [ ] Marka/telif kontrolü: TÜBİTAK, TEMA, E-Devlet gibi adların kullanımı için izin gerekebilir; gerekiyorsa jenerik adlarla değiştirin.
- [ ] "Designed for Families" programına katılacaksanız ek politika gereksinimlerini gözden geçirin.

## Sürümleme
- `package.json` ve (Capacitor için) `android/app/build.gradle` içinde `versionCode` / `versionName` değerlerini her güncellemede artırın.
