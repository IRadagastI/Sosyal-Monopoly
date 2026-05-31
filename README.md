# Bilgiopoli – Sosyal Bilgiler v2.0

Bilgiopoli, 5-7. sınıf öğrencileri için tasarlanmış interaktif bir Sosyal Bilgiler eğitim oyunudur. Akıllı tahta ve dijital sınıflar için optimize edilmiştir.

## 🎮 Özellikler

### 📚 Eğitsel İçerik
- **6 Ünite**: Birlikte Yaşamak, Evimiz Dünya, Ortak Miras, Yaşayan Demokrasi, Hayat Ekonomi, Teknoloji & Sosyal
- **3 Sınıf Seviyesi**: 5. 6. ve 7. sınıf müfredatına uygun sorular
- **150+ Soru**: Her ünite için zengin soru havuzu
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

### 🏗️ Teknik İyileştirmeler
- **Modüler Yapı**: HTML, CSS, JavaScript ayrıştırıldı
- **Performans Optimizasyonu**: Daha hızlı yükleme ve akıcı oyun
- **Hata Yönetimi**: Gelişmiş loglama ve hata yakalama
- **Kaydet/Yükle**: Oyun ilerlemesini kaydetme özelliği
- **Ses Efektleri**: Web Audio API ile sentetik sesler

### 🎨 Kullanıcı Deneyimi
- **Loading States**: Yükleme ekranları ve görsel geri bildirimler
- **Klavye Kısayolları**: Space, Ctrl+S, Ctrl+L
- **Responsive Tasarım**: Farklı ekran boyutlarına uyum
- **Erişilebilirlik**: Ekran okuyucu desteği ve yüksek kontrast
- **Oryantasyon Uyarısı**: Dikey modda uyarı sistemi

### 🔧 Geliştirici Araçları
- **Logger Sistemi**: Detaylı loglama ve hata takibi
- **Performance Monitor**: FPS ve bellek kullanımı takibi
- **Debug Mod**: Geliştirme için hata ayıklama araçları

## 📁 Proje Yapısı

```
sosyal-monopoly/
├── index.html              # Ana HTML dosyası
├── css/
│   └── style.css          # Tüm stiller
├── js/
│   ├── app.js            # Ana uygulama
│   ├── game.js          # Oyun motoru
│   ├── ui.js            # Arayüz yönetimi
│   ├── audio.js         # Ses sistemi
│   ├── logger.js        # Loglama sistemi
│   ├── questions_expanded.js      # 5. sınıf soruları
│   ├── questions6_expanded.js     # 6. sınıf soruları
│   └── questions7_expanded.js     # 7. sınıf soruları
├── assets/
│   └── bg.png           # Arka plan resmi
├── dist/
│   └── SosyalMonopoly.exe      # Derlenmiş uygulama
├── main.py               # Python wrapper
├── package.json          # Proje bilgileri
└── README.md            # Bu dosya
```

## 🎮 Nasıl Oynanır

### Başlangıç
1. Oyunu tarayıcıda açın
2. En az 2 takım seçin
3. "Oyunu Başlat" butonuna tıklayın

### Oyun Akışı
1. **Zar At**: Space tuşu veya buton
2. **Hareket Et**: Zar toplamı kadar ilerle
3. **Soru Cevapla**: Karedeki soruyu yanıtla
4. **SBP Kazan**: Doğru cevaplar için puan al
5. **Rozet Topla**: TEMA istasyonlarından rozet kazan
6. **Joker Kullan**: Stratejik avantajlar için

### Kontroller
- **Space**: Zar at
- **Ctrl+S**: Oyunu kaydet
- **Ctrl+L**: Oyunu yükle
- **M**: Sesi aç/kapat
- **ESC**: Modalı kapat

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
- **Hafıza Kullanımı**: Optimize edilmiş kaynak yönetimi
- **Yükleme Süresi**: < 3 saniye
- **FPS**: 60+ akıcı animasyonlar
- **Responsive**: 320px - 4K ekran desteği

### Erişilebilirlik
- **WCAG 2.1**: AA seviyesi uyumluluk
- **Klavye Navigasyonu**: Tam erişilebilirlik
- **Ekran Okuyucu**: NVDA, JAWS desteği
- **Yüksek Kontrast**: Görme engelli dostu

## 🤝 Katkıda Bulunma

### Geliştirme
1. Fork yapın
2. Feature branch oluşturun: `git checkout -b feature/yeni-ozellik`
3. Değişiklikleri yapın: `git commit -am 'Yeni özellik eklendi'`
4. Push yapın: `git push origin feature/yeni-ozellik`
5. Pull Request oluşturun

### Soru Katkıları
- Yeni sorular eklemek için `questions*_expanded.js` dosyalarını düzenleyin
- Soru formatı: `{ q: "Soru metni", opts: ["A", "B", "C", "D"], ans: 0 }`
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
