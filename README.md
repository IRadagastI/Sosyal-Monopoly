# Bilgiopoli – Sosyal Bilgiler v2.0

Bilgiopoli, 5-7. sınıf öğrencileri için tasarlanmış interaktif bir Sosyal Bilgiler eğitim oyunudur. Akıllı tahta ve dijital sınıflar için optimize edilmiştir.

## 🎮 Özellikler

### 📚 Eğitsel İçerik
- **6 Ünite**: Birlikte Yaşamak, Evimiz Dünya, Ortak Miras, Yaşayan Demokrasi, Hayat Ekonomi, Teknoloji & Sosyal
- **4 Sınıf Seviyesi**: 5, 6, 7 ve 8 (LGS) müfredatına uygun sorular
- **Zengin Soru Havuzu**: Her sınıf ve ünite için ayrı soru setleri
- **TEMA İstasyonları**: Çevre bilinci ve doğa dostu rozetleri

### 🎯 Oyun Mekanikleri
- **4 Takım**: Kaşifler, Girişimciler, Araştırmacılar, Diplomatlar
- **Süper Güçler**: Her takımın özel yetenekleri
- **Joker Kartlar**: 50/50, Çift Şans, Kalkan
- **Flash Haberler**: Sürpriz oyun içi olaylar
- **Büyük Final**: Son 3 dakikada ekstra puanlar

### 🏆 Öğrenci Gelişimi
- **SBP Puan Sistemi**: Sosyal Bilgiler Puanı
- **Doğa Dostu Rozetleri**: Çevre bilinci ödülleri
- **Performans Takibi**: Anlık skor ve ilerleme göstergesi
- **25 Dakikalık Oyun**: Ders saatlerine uygun süre

## 🚀 Yenilikler (v2.0)

### 🏗️ Teknik Yapı
- **Tek Dosya Dağıtım**: Tüm HTML, CSS, JavaScript ve soru havuzu `index.html` içinde gömülü (kurulum gerektirmez)
- **PWA Desteği**: `manifest.json` ve `sw.js` ile yüklenebilir uygulama
- **Masaüstü Paketi**: `pywebview` + PyInstaller ile `.exe` derleme
- **Kaydet/Devam Et**: `localStorage` ile tek slotlu oyun kaydı

### 🎨 Kullanıcı Deneyimi
- **Modern Arayüz**: Glassmorphism temalı, neon vurgulu 16:9 akıllı tahta tasarımı
- **Animasyonlar**: Zar atma, konfeti (canvas-confetti) ve geçiş efektleri
- **SweetAlert2 Modalları**: Soru, sonuç ve bilgilendirme pencereleri
- **Responsive Tasarım**: `vmin` tabanlı ölçekleme ile farklı ekranlara uyum

## 📁 Proje Yapısı

> Proje modüler bir yapıya kavuşturulmuştur: HTML iskeleti `index.html` içinde,
> stiller `css/style.css`, soru havuzu `js/questions.js` içinde yer alır. Oyun
> motoru hâlâ `index.html` sonundaki `<script>` bloğundadır.

```
sosyal-monopoly/
├── index.html            # HTML iskeleti + oyun motoru (script)
├── css/
│   └── style.css         # Tüm stiller (arka plan görseli dahil)
├── js/
│   └── questions.js      # Soru havuzu (questions5/6/7/8 + final havuzları)
├── vendor/               # Yerelleştirilmiş kütüphaneler (offline için)
│   ├── confetti.browser.min.js
│   ├── sweetalert2.all.min.js
│   ├── fontawesome/      # FA solid css + webfont
│   └── fonts/            # Outfit yazı tipi (woff2 + outfit.css)
├── tools/
│   ├── split.js              # index.html'i css/js'e ayıran betik
│   ├── validate-questions.js # soru havuzu doğrulayıcı
│   └── check-index.js        # index yapısı kontrolü
├── manifest.json         # PWA manifesti
├── sw.js                 # Service Worker (çevrimdışı önbellek)
├── icons/                # PWA ikonu (icon.svg)
├── main.py               # pywebview masaüstü sarmalayıcı
├── SosyalMonopoly.spec   # PyInstaller derleme tanımı
├── package.json          # Proje bilgileri ve script'ler
└── README.md             # Bu dosya

# Aşağıdakiler git'e dahil edilmez (.gitignore):
#   build/   dist/   *.exe   tmp_*.txt   index.html.bak
```

### Soru Doğrulama
```bash
npm test          # veya: node tools/validate-questions.js
```
Her sorunun `{ q, opts[4], ans:0..3 }` biçimine uygunluğunu denetler.

## 🎮 Nasıl Oynanır

### Başlangıç
1. Oyunu tarayıcıda açın
2. En az 2 takım seçin
3. "Oyunu Başlat" butonuna tıklayın

### Oyun Akışı
1. **Zar At**: “Zar At” butonuna tıkla
2. **Hareket Et**: Zar toplamı kadar ilerle
3. **Soru Cevapla**: Karedeki soruyu yanıtla
4. **SBP Kazan**: Doğru cevaplar için puan al
5. **Rozet Topla**: TEMA istasyonlarından rozet kazan
6. **Joker Kullan**: Stratejik avantajlar için

### Kontroller
Oyun fare/dokunmatik ile oynanır:
- **Zar At** butonu: Sıradaki takımın zarını atar
- **Kare/Joker** düğmeleri: M. lük al, bina yap, joker kullan
- **Ana menü “DEVAM ET”**: Kayıtlı oyunu yükler

> Not: Klavye kısayolları (Space/Ctrl+S vb.) henüz uygulanmadı; planlanan özelliklerdir.

## 🛠️ Kurulum ve Çalıştırma

### Geliştirme Ortamı
```bash
# Projiyi klonlayın
git clone https://github.com/username/sosyal-monopoly.git
cd sosyal-monopoly

# Yerel sunucuyu başlatın
npm run dev
# veya
python -m http.server 8000

# Tarayıcıda açın
http://localhost:8000
```

### Python Uygulaması
```bash
# Gerekli kütüphaneleri yükleyin
pip install pywebview

# Uygulamayı çalıştırın
python main.py
```

### `.exe` Derleme (Windows)
```bash
pip install pyinstaller pywebview
pyinstaller SosyalMonopoly.spec
# Çıktı: dist/SosyalMonopoly.exe
```

## 🎓 Eğitsel Faydaları

### Öğrenci Gelişimi
- **Eleştirel Düşünme**: Soru çözme becerileri
- **Takım Çalışması**: İş birliği ve iletişim
- **Stratejik Planlama**: Kaynak yönetimi
- **Çevre Bilinci**: Doğa dostu davranışlar
- **Sosyal Beceriler**: Rekabet ve sportmenlik

### Müfredat Uygunluğu
- **Milli Eğitim Standartları**: MEB müfredatına uygun
- **Kazanım Odaklı**: Her ünite için özel kazanımlar
- **Değerler Eğitimi**: Demokrasi, hoşgörü, dayanışma
- **Disiplinlerarası**: Tarih, coğrafya, vatandaşlık

## 🔧 Teknik Özellikler

### Tarayıcı Desteği
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Performans
- **Tek Dosya**: Harici JS modülü bağımlılığı yok; soru havuzu gömülü
- **Hedef Ekran**: 16:9 akıllı tahta ve geniş ekranlar için optimize

### Erişilebilirlik (yol haritası)
Mevcut sürüm tam WCAG uyumlu değildir. Planlanan iyileştirmeler:
- Soru şıkları için `<button>` + `aria` etiketleri ve klavye odak desteği
- Yüksek kontrast ve daha büyük okunabilir font seçenekleri

## 🤝 Katkıda Bulunma

### Geliştirme
1. Fork yapın
2. Feature branch oluşturun: `git checkout -b feature/yeni-ozellik`
3. Değişiklikleri yapın: `git commit -am 'Yeni özellik eklendi'`
4. Push yapın: `git push origin feature/yeni-ozellik`
5. Pull Request oluşturun

### Soru Katkıları
- Yeni sorular eklemek için `js/questions.js` dosyasını düzenleyin (`questions5/6/7/8` ve `finalQuestionsPool5/6/7/8`)
- Soru formatı: `{ q: "Soru metni", opts: ["A", "B", "C", "D"], ans: 0 }` (`ans` 0–3 arası, doğru şıkkın indeksi)
- Değişiklikten sonra `npm test` ile soru havuzunu doğrulayın
- Lütfen müfredat uygunluğuna dikkat edin

## 📄 Lisans

Bu proje MIT Lisansı altında dağıtılmaktadır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

## 📞 İletişim

- **Sorular ve Geri Bildirim**: GitHub Issues
- **Eğitsel İş Birliği**: [email protected]
- **Teknik Destek**: [email protected]

## 🙏 Teşekkürler

- Milli Eğitim Bakanlığı - Müfredat desteği için
- TEMA Vakfı - Çevre eğitimi içeriği için
- Tüm öğretmenler - Değerli geri bildirimler için

---

**Bilgiopoli – Sosyal Bilgiler** - Eğitimi daha eğlenceli hale getirin! 🎓🎮
