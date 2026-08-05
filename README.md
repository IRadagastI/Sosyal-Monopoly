# Bilgiopoli – Sosyal Bilgiler v2.1.0

Bilgiopoli, 5–8. sınıf öğrencileri için hazırlanmış, çevrimdışı da çalışabilen bir Sosyal Bilgiler takım oyunudur. 16:9 akıllı tahta, Windows ve yatay Android ekranları hedeflenir.

## Özellikler

- 5, 6, 7 ve 8. sınıf seviyeleri ile altı konu ünitesi
- İki ila dört insan/AI takımı, takım güçleri ve jokerler
- SBP puanı, mülkler, binalar ve doğa dostu rozetleri
- 25 dakikalık ders süresi ve son üç dakikada Büyük Final
- Her takım için Büyük Final'de yalnızca bir deneme hakkı
- Tek yuvalı, doğrulanan ve eski kayıtları dönüştüren oyun kaydı
- PWA, imzalı Android APK/AAB ve tek dosyalı Windows EXE dağıtımı

## v2.1.0 ile gelenler

- Oyun sıfırlandığında eski zar, AI ve animasyon zamanlayıcıları artık yeni oyuna sızmıyor.
- Zar ve sıra devri kilitlenmelerine karşı otomatik toparlanma eklendi.
- Büyük Final yalnızca son üç dakikada açılıyor ve takım başına tek kullanım kuralı kayda dahil ediliyor.
- Bozuk veya değiştirilmiş kayıtlar yüklenmeden önce kapsamlı biçimde doğrulanıyor.
- Dinamik içerik güvenli biçimde ekrana yazılıyor; sayfaya içerik güvenlik politikası uygulandı.
- Fare, dokunmatik ve klavye ile çalışabilen ortak eylem sistemi kuruldu; tarayıcı yakınlaştırması açıldı.
- Android sistem yazı ölçeği kontrollü biçimde destekleniyor ve uygulama yedeği kapalı.
- Kaynak soru dosyasını içermeyen temiz klonlarda soru paketi bütünlük kontrolü yapılabiliyor.
- Web, Android ve Windows için sürekli entegrasyon; uçtan uca oyun senaryoları ve imza kontrolleri eklendi.

## Proje yapısı

```text
Sosyal-Monopoly/
├── index.html                    # Uygulama iskeleti
├── css/style.css                 # Arayüz ve erişilebilirlik stilleri
├── js/game.js                    # Oyun motoru
├── js/questions.bundle.js        # Dağıtılan, gizlenmiş soru paketi
├── js/questions.bundle.sha256    # Paket bütünlük özeti
├── vendor/                       # Çevrimdışı üçüncü taraf dosyaları
├── android/                      # Capacitor Android projesi
├── tools/                        # Doğrulama, test ve paketleme araçları
├── main.py                       # Windows masaüstü sarmalayıcısı
├── SosyalMonopoly.spec           # PyInstaller yapılandırması
├── manifest.json / sw.js         # PWA tanımı ve çevrimdışı önbellek
└── .github/workflows/ci.yml      # Otomatik kalite kontrolleri
```

`js/questions.js` düzenlenebilir ana kaynaktır ve içerik koruması amacıyla Git'e alınmaz. Yayın paketi şifreleme sağlamaz; yalnızca kolay kopyalamayı zorlaştıran bir gizleme uygular. Bütünlük, takip edilen SHA-256 özetiyle doğrulanır.

## Kurulum ve geliştirme

Gereksinimler: Node.js 20 veya üzeri. Android paketi için Android SDK ve JDK 21; Windows paketi için Python 3.12 önerilir.

```bash
git clone https://github.com/IRadagastI/Sosyal-Monopoly.git
cd Sosyal-Monopoly
npm ci
npm run dev
```

Yerel adres: `http://127.0.0.1:8000`

### Kalite kontrolleri

```bash
npm test                 # soru paketi, sözdizimi ve sayfa yapısı
npm run lint             # JavaScript kalite kontrolü
npm run format:check     # biçim kontrolü
npm run test:e2e         # gerçek tarayıcıda oyun senaryoları
npm run test:all         # tüm web kontrolleri
```

Testler; insan/AI sıra devri, final zaman sınırı, takım başına tek final hakkı, menüye dönüşte eski işlemlerin iptali ve temiz klonda soru paketi doğrulamasını kapsar.

## Paketleme

### Windows EXE

```bash
python -m pip install -r requirements-build.txt
npm run build:exe
```

Doğrulanmış çıktı `release/` altında sürüm numarası ve SHA-256 özetiyle yayımlanır. Düzenlenebilir `js/questions.js` EXE içine alınmaz.

### Android APK ve AAB

Önce Git'e alınmayan `android/keystore.properties` ve ilgili keystore dosyası hazır olmalıdır. Ardından:

```bash
npm ci
npm run android:artifacts
```

Komut Android birim testini ve lint denetimini çalıştırır, release APK/AAB üretir, iki imzayı doğrular ve sonuçları `release/` altına kopyalar. Ayrıntılar [PUBLISHING.md](PUBLISHING.md) dosyasındadır.

## Oyun akışı

1. Sınıf düzeyini seçin ve en az iki takım ekleyin.
2. Sıradaki takım zar atar ve piyon otomatik ilerler.
3. Gelinen kareye göre soru, mülk, kira, haber veya rozet işlemi tamamlanır.
4. Soru jokerleri ve takım güçleri stratejik biçimde kullanılabilir.
5. Son üç dakikada her takım Büyük Final'i bir kez deneyebilir.
6. Süre dolduğunda puan, mülk ve rozetlere göre sonuç gösterilir.

Eylemler fare/dokunmatik yanında `Tab`, `Enter` ve `Space` ile de kullanılabilir. Tarayıcı yakınlaştırması ve Android sistem yazı ölçeği desteklenir. Tasarım erişilebilirlik açısından iyileştirilmiştir ancak resmi bir WCAG uygunluk beyanı değildir; gerçek cihaz ve yardımcı teknoloji denemeleri yayın öncesi kontrol listesinde tutulur.

## Soru katkıları

Yerel `js/questions.js` içindeki `questions5/6/7/8` ve `finalQuestionsPool5/6/7/8` havuzlarını düzenleyin:

```javascript
{ q: "Soru metni", opts: ["A", "B", "C", "D"], ans: 0 }
```

Ardından `npm run protect:questions` ve `npm test` çalıştırın; oluşan bundle ve SHA-256 dosyalarını birlikte commit edin. Ayrıntılar [js/README-SORULAR.md](js/README-SORULAR.md) içindedir.

## Gizlilik ve lisans

Uygulama reklam, analitik veya kullanıcı hesabı içermez; oyun kaydı yalnızca cihazda tutulur. Ayrıntılar [PRIVACY.md](PRIVACY.md) dosyasındadır.

Bu proje [MIT Lisansı](LICENSE) ile dağıtılır.
