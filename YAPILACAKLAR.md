# Yapılacaklar — Mobil Düzeltmeleri (fix/mobil-yazi-tasmasi-ve-zar-kilitlenmesi)

Bu daldaki 5 commit iki hatayı çözüyor: telefonda yazıların karelerden taşması
ve ZAR AT'ın kalıcı olarak kilitlenmesi. Aşağıdakiler **henüz yapılmadı**.

---

## 1. Cihazda test (öncelikli)

Düzeltmelerin ikisi de tarayıcıda doğrulandı, **gerçek cihazda doğrulanmadı**.
Yazı taşmasının çözümü `MainActivity.java`'daki WebView ayarı ve bu ancak APK
derlenince çalışır — tarayıcıda test edilemez.

```bash
npm install
npm run build:web && npx cap sync android
npx cap open android
```

Android Studio açılınca telefonu USB ile bağlayıp **Run ▶** (geliştirici modu +
USB hata ayıklama açık olmalı). Bu aşamada keystore gerekmez, `versionCode`
artırılmaz.

Kontrol listesi (Samsung S25 Ultra, yatay):

- [ ] Kare adları kutulara sığıyor: "GİRİŞİMCİ OFİSİ", "TEKNOLOJİ VE TOPLUM",
      "EKONOMİK HAYAT", "TEMA İSTASYONU"
- [ ] ZAR AT'a basınca zar atılıyor ve piyon ilerliyor
- [ ] Tur ortasında **BÜYÜK FİNAL KAPIŞMASI**'na dokun → "Önce sıranı tamamla"
      uyarısı gelmeli, oyun kilitlenmemeli
- [ ] Sıra beklerken BÜYÜK FİNAL normal açılıyor (regresyon kontrolü)
- [ ] Birkaç tam tur oyna: soru → satın alma → sıra devri zinciri kopmuyor
- [ ] Telefonun sistem yazı boyutu büyütülmüş haldeyken de düzen bozulmuyor

Test geçerse dalı `main`'e merge et.

> Not: Telefonda yazılar artık taşmayacak ama masaüstüyle **aynı oranda**, yani
> küçük olacak. Bu 16:9 akıllı tahta tasarımının doğal sonucu. Telefona özel
> daha büyük yazılı bir düzen istenirse ayrı bir çalışma gerekir (bkz. Bölüm 4).

---

## 2. Yayın (test geçtikten sonra)

- [ ] `android/app/build.gradle` → `versionCode` artır (şu an `200` → `201`).
      Play aynı versionCode'u ikinci kez kabul etmez.
- [ ] İmzalı `.aab` üret: Android Studio → **Build → Generate Signed Bundle /
      APK → Android App Bundle**
- [ ] Play Console'a yükle

**Keystore bu makinede yok.** `android/keystore/` ve `android/keystore.properties`
git'e girmiyor. `build.gradle` imza yapılandırmasını yalnızca `keystore.properties`
varsa uyguluyor; dosya yokken `gradlew bundleRelease` çalıştırılırsa **imzasız**
paket üretilir ve Play reddeder. Keystore başka bir makinedeyse buraya getirilmeli.

---

## 3. Bilinen tuzaklar (tekrar eden)

- **`sw.js` → `CACHE_VERSION`**: fetch stratejisi cache-first
  (`return cached || network`). `index.html` / `css` her değiştiğinde bu sürüm
  artırılmalı, yoksa cihaz eski kodu çalıştırmaya devam eder. Bu oturumda
  gerçekten yaşandı: tarayıcı düzeltilmiş dosyaya rağmen eski kodu sundu.
  Şu an `v8`.
- **`js/questions.js` bu makinede yok** (yerel kaynak, git'e girmez). Artık
  build'i kırmıyor; mevcut `js/questions.bundle.js` kullanılıyor. Ancak
  **soruları değiştirecekseniz** önce bu dosyayı geri koymanız gerekir, yoksa
  değişiklikleriniz bundle'a yansımaz.
- **`npm run android:bundle` sadece Windows'ta çalışır** — script `gradlew.bat`
  çağırıyor. macOS'ta bu komutu kullanmayın.

---

## 4. Ele alınmayan / sonraya kalan

- **Telefona özel düzen**: Arayüz tamamen `vmin` ile ölçekleniyor; telefon yatay
  modunda `1vmin ≈ 4.24px`. Yazılar okunaklı ama küçük. Telefonda daha büyük
  görünmesi isteniyorsa ayrı bir mobil düzen (veya sabit piksel tasarım +
  `transform: scale`) gerekir — bu, mevcut 60+ `vmin` tanımını etkileyen büyük
  bir değişiklik.
- **Yeni küçük yazı eklerken dikkat**: `vmin` tabanlı 1.5vmin altındaki her yeni
  yazı, telefonda aynı sınıf hataya açık. WebView ayarı artık koruyor, ancak
  tasarımda 1vmin altına inmemek güvenli.
- **`sw.js` stratejisi**: cache-first olarak bırakıldı, yalnızca yorumu gerçek
  davranışla uyumlu hale getirildi. `index.html` için network-first'e geçmek
  sürüm artırma zorunluluğunu ortadan kaldırırdı; çevrimdışı davranışı
  etkilediği için bilinçli olarak değiştirilmedi.
- **`.claude/launch.json`**: yerel önizleme sunucusu ayarı, commit edilmedi
  (takip edilmiyor). Gerekmiyorsa silinebilir.
