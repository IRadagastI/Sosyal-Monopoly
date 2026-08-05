# Bilgiopoli v2.1.0 – Android Yayın Rehberi

Bu rehber, doğrulanmış Android paketlerinin üretilmesi ve Google Play'e yüklenmesi içindir.

## Sürüm bilgileri

| Alan | Değer |
|---|---|
| Paket adı | `com.iradagasti.bilgiopoli` |
| Sürüm adı | `2.1.0` |
| Sürüm kodu | `204` |
| Ekran yönü | `sensorLandscape` |
| Hedef çıktı | İmzalı APK ve AAB |

## Gereksinimler

- Node.js 20+
- Android SDK
- JDK 21 (Android Studio'nun JBR'ı desteklenir)
- `android/keystore.properties` ve burada gösterilen keystore
- Google Play Console hesabı

Keystore ile parola dosyaları Git'e alınmaz. Release derlemesi bu bilgiler yoksa veya imza doğrulanamazsa başarısız olur; yanlışlıkla imzasız AAB yayımlamaz.

## Tek komutla doğrulanmış paket

```bash
npm ci
npm run test:all
npm run android:artifacts
```

Son komut sırasıyla web dağıtımını hazırlar, Capacitor eşitlemesini yapar, Android birim testi ve lint çalıştırır, release APK/AAB üretir ve imzaları doğrular.

Başarılı çıktı:

```text
release/Bilgiopoli-v2.1.0-SIGNED.apk
release/Bilgiopoli-v2.1.0-SIGNED.aab
release/SHA256SUMS.txt
```

Paketleri paylaşmadan önce `release/SHA256SUMS.txt` dosyasındaki özetlerle birlikte saklayın. Keystore yedeğini güvenli ve ayrı bir konumda koruyun; kaybı gelecekteki güncellemeleri engelleyebilir.

## Google Play mağaza girdisi

- Uygulama adı: **Bilgiopoli**
- Kısa açıklama: Sosyal Bilgiler müfredatına uygun eğitici takım oyunu
- Tam açıklama: 5–8. sınıf, 604 soru, AI rakip modu ve çevrimdışı kullanım
- İkon: `icons/icon-play-store.png`
- Özellik grafiği: `play-store/feature-graphic-1024x500.png`
- Yatay ekran görüntüleri: `play-store/screenshot-01-landing.png` ve `play-store/screenshot-02-gameboard.png`
- Gizlilik politikası: `https://iradagasti.github.io/Sosyal-Monopoly/privacy.html`

Play Console formlarında uygulamanın gerçek davranışını esas alın:

- Reklam ve uygulama içi satın alma yoktur.
- Hesap, analitik ve kişisel veri toplama yoktur.
- Oyun kaydı cihazda tutulur; Android yedeklemesi kapalıdır.
- Hedef yaş grupları eğitim içeriği ve 5–8. sınıf kapsamına göre seçilmelidir.
- Yeni yüklemede sürüm kodu önceki Play sürümünden yüksek olmalıdır.

## Sürümleme

Yeni yayında şu üç alan birlikte güncellenmelidir:

| Dosya | Alan | Bu sürüm |
|---|---|---|
| `package.json` | `version` | `2.1.0` |
| `android/app/build.gradle` | `versionName` | `2.1.0` |
| `android/app/build.gradle` | `versionCode` | `204` |

## Yararlı komutlar

```bash
npm run dev                 # yalnızca yerel geliştirme sunucusu
npm test                    # hızlı bütünlük kontrolleri
npm run test:e2e            # tarayıcı oyun senaryoları
npm run build:web           # www dağıtımını hazırla
npm run android:release     # web + Capacitor eşitlemesi
npm run android:artifacts   # test + lint + imzalı APK/AAB + doğrulama
npm run build:exe           # doğrulanmış Windows EXE
```

## Yayın öncesi dış kontroller

- En az bir gerçek Android cihazda yatay düzeni, büyük sistem yazısını ve birkaç tam turu deneyin.
- Google Play iç test kanalına AAB'yi yükleyip Play'in otomatik cihaz raporunu inceleyin.
- Data Safety, içerik derecelendirme ve hedef kitle formlarını hesap sahibi olarak onaylayın.
- İncelemeye göndermeden önce mağaza metni ve ekran görüntülerini son kez kontrol edin.

Kod deposu bu hesap/cihaz işlemlerini otomatikleştiremez; paket üretimi ve yerel imza doğrulaması ise `npm run android:artifacts` tarafından yapılır.
