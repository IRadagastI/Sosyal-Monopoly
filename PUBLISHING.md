# Google Play'e Yayınlama Rehberi — Bilgiopoli

Bu rehber, projede hazırlanan Android paketini Google Play'e yüklemeniz için adım adım yol gösterir.

---

## Hazır Olanlar (Projede)

| Öğe | Durum | Konum |
|-----|--------|-------|
| Capacitor Android projesi | Hazır | `android/` |
| Yatay ekran kilidi | Hazır | `AndroidManifest.xml` → `sensorLandscape` |
| Paket adı | `com.iradagasti.bilgiopoli` | |
| Sürüm | `2.0.0` (versionCode `200`) | `android/app/build.gradle` |
| PWA ikonları (PNG) | Hazır | `icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` |
| Play Store ikonu | Hazır | `icons/icon-play-store.png` |
| Feature graphic | Hazır | `play-store/feature-graphic-1024x500.png` |
| Ekran görüntüleri | Hazır | `play-store/screenshot-*.png` |
| Gizlilik politikası (HTML) | Hazır | `privacy.html` |
| Gizlilik politikası (Markdown) | Hazır | `PRIVACY.md` |

---

## 1. Gereksinimler

- Node.js 18+
- Android Studio (SDK + JDK 17)
- Google Play Console hesabı (tek seferlik ~25 USD)

---

## 2. Android Derleme

```bash
npm install
npm run android:release   # ikonlar + www kopyasi + cap sync
npx cap open android      # Android Studio acilir
```

Android Studio'da:
1. **Build → Generate Signed Bundle / APK**
2. **Android App Bundle (.aab)** seçin
3. Yeni veya mevcut imza anahtarınızı (keystore) kullanın
4. Çıktı `.aab` dosyasını Play Console'a yükleyin

> **Önemli:** Keystore dosyanızı ve şifresini güvenli saklayın. Kaybederseniz uygulama güncelleyemezsiniz.

---

## 3. Gizlilik Politikası URL'si (HTTPS)

Play Console **canlı bir HTTPS linki** ister.

### GitHub Pages ile (önerilen)

1. GitHub repo: `IRadagastI/Sosyal-Monopoly`
2. **Settings → Pages → Source:** `main` branch, `/ (root)`
3. Kaydedin; birkaç dakika sonra şu adres çalışır:

```
https://iradagasti.github.io/Sosyal-Monopoly/privacy.html
```

Bu URL'yi Play Console → **Uygulama içeriği → Gizlilik politikası** alanına yapıştırın.

---

## 4. Play Console Yükleme Kontrol Listesi

### Mağaza girişi
- [ ] **Uygulama adı:** Bilgiopoli (Monopoly kelimesini kullanmayın)
- [ ] **Kısa açıklama:** Sosyal Bilgiler müfredatına uygun eğitici mülk edinme oyunu
- [ ] **Tam açıklama:** 5–8. sınıf, 604 soru, AI rakip modu, çevrimdışı
- [ ] **Uygulama ikonu (512×512):** `icons/icon-play-store.png`
- [ ] **Feature graphic (1024×500):** `play-store/feature-graphic-1024x500.png`
- [ ] **Ekran görüntüleri (yatay):** `play-store/screenshot-01-landing.png`, `screenshot-02-gameboard.png`
- [ ] **Gizlilik politikası URL:** (yukarıdaki GitHub Pages linki)

### Politika formları
- [ ] **İçerik derecelendirme anketi:** Eğitim / Her yaş / Şiddet yok
- [ ] **Data Safety:** Veri toplanmıyor; konum, kişisel bilgi, analitik yok
- [ ] **Hedef kitle:** 5–12 yaş (eğitim uygulaması)
- [ ] **Reklam:** Hayır

### Teknik
- [ ] `.aab` dosyasını Production veya Internal testing'e yükleyin
- [ ] Her güncellemede `android/app/build.gradle` içinde `versionCode` artırın (ör. 201, 202…)

---

## 5. Sürümleme Kuralı

| Alan | Dosya | Örnek |
|------|-------|-------|
| Web sürümü | `package.json` → `version` | `2.0.0` |
| Android sürüm adı | `android/app/build.gradle` → `versionName` | `2.0.0` |
| Android sürüm kodu | `android/app/build.gradle` → `versionCode` | `200`, sonra `201`… |

---

## 6. Yararlı Komutlar

```bash
npm run dev              # Yerel gelistirme sunucusu
npm test                 # Soru havuzu dogrulama
npm run icons:generate   # PNG ikonlari yeniden uret
npm run build:web        # www/ klasorunu guncelle
npm run cap:sync         # www -> android kopyala
npm run play:assets      # Play Store grafiklerini yeniden uret
npm run android:release  # Hepsini birden (yayin oncesi)
```

---

## 7. Sizin Manuel Yapmanız Gerekenler

Bunlar kodla otomatik yapılamaz:

1. **GitHub Pages'i açmak** (Settings → Pages)
2. **Play Console hesabı** oluşturmak / giriş yapmak
3. **Signed .aab** derlemek (Android Studio + keystore)
4. **İçerik derecelendirme** anketini doldurmak
5. **Data Safety** formunu onaylamak
6. **Uygulamayı incelemeye göndermek**

---

## Notlar

- Oyun **yatay (landscape)** modda çalışır; telefonda dikey tutulunca uyarı gösterir.
- Uygulama **internet izni** ister (Capacitor WebView için) ancak veri göndermez.
- Marka adı olarak her yerde **Bilgiopoli** kullanın; "Monopoly" tescilli markadır.
