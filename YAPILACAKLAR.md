# Bilgiopoli v2.1.0 – Yayın Öncesi Kontrol Listesi

## Otomatik olarak doğrulananlar

- [x] Soru paketi içeriği ve SHA-256 bütünlüğü
- [x] Temiz klonda özel soru kaynağı olmadan doğrulama
- [x] JavaScript sözdizimi, lint ve biçim kontrolü
- [x] Sayfada CSP, harici oyun motoru ve inline olay işleyicisi bulunmaması
- [x] İnsan/AI sıra devri ve zar kilidi toparlanması
- [x] Büyük Final'in son üç dakika ve takım başına tek deneme kuralı
- [x] Menüye dönüşte eski zamanlayıcıların iptali
- [x] Android birim testi, lint, release derlemesi ve paket imzası
- [x] Windows EXE dosya yapısı ve sürüm özeti

## Gerçek Android cihaz kontrolü

Samsung ve benzeri geniş ekranlı bir cihazda, yatay konumda:

- [ ] Kare adları taşmadan okunuyor.
- [ ] Normal ve büyütülmüş sistem yazı boyutunda temel düzen korunuyor.
- [ ] Yakınlaştırma hareketi çalışıyor ve oyun kontrolleri erişilebilir kalıyor.
- [ ] Zar → hareket → soru/mülk → sıra devri zinciri birkaç tur boyunca kopmuyor.
- [ ] Oyun ortasında Büyük Final kilitli; son üç dakikada yalnızca bir kez açılıyor.
- [ ] Uygulamayı kapatıp açınca geçerli kayıt devam ediyor.
- [ ] Çevrimdışıyken uygulama açılıyor ve soru/ikon/yazı tipi eksik kalmıyor.

## Google Play hesabı işlemleri

- [ ] AAB'yi önce iç test kanalına yükle.
- [ ] Play otomatik cihaz test raporunu incele.
- [ ] Data Safety ve içerik derecelendirme formlarını onayla.
- [ ] Gizlilik politikası bağlantısının HTTPS üzerinden açıldığını doğrula.
- [ ] Mağaza metni ve görsellerini kontrol edip incelemeye gönder.

## Bakım notları

- Geçerli Service Worker önbelleği `bilgiopoli-v10` değerindedir. Kullanıcıya giden web dosyaları değiştiğinde sürümü artırın.
- `js/questions.js` özel yerel kaynaktır. Değişiklikten sonra `npm run protect:questions`; ardından `npm test` çalıştırın ve bundle ile SHA dosyasını birlikte gönderin.
- `npm run android:artifacts` Windows/macOS/Linux ayrımını kendisi yapar ve JDK 21 arar.
- Her Play yüklemesinde `versionCode` önceki sürümden yüksek olmalıdır.
- 16:9 tasarım küçük telefonlarda doğal olarak daha yoğundur; kapsamlı telefona özel yerleşim ayrı bir tasarım çalışmasıdır.
