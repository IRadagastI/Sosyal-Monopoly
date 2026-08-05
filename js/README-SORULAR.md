# Soru Havuzu – Özel Kaynak ve Yayın Paketi

`js/questions.js` düzenlenebilir ana kaynaktır ve içerik koruması amacıyla GitHub'a gönderilmez. Takip edilen `js/questions.bundle.js`, kaynağın uygulamada çalışabilen gizlenmiş kopyasıdır.

Bu işlem şifreleme değildir. Tarayıcıya teslim edilen içerik kararlı bir kullanıcı tarafından incelenebilir; amaç yalnızca ham soru dosyasının doğrudan kopyalanmasını zorlaştırmaktır. SHA-256 dosyası gizlilik değil, yanlışlıkla değişiklik/bozulma kontrolü sağlar.

## Soru biçimi

```javascript
{ q: "Soru metni", opts: ["A", "B", "C", "D"], ans: 0 }
```

`ans`, doğru seçeneğin 0–3 arasındaki indeksidir. Soru metninde yalnızca satır sonu amacıyla `<br>` etiketi kabul edilir.

## Soruları güncelleme

1. Güvenli yedeğinizden `js/questions.js` dosyasını çalışma alanına koyun.
2. `questions5/6/7/8` veya `finalQuestionsPool5/6/7/8` havuzunu düzenleyin.
3. Aşağıdaki kontrolleri çalıştırın:

```bash
npm run protect:questions
npm test
npm run test:e2e
```

4. `js/questions.bundle.js` ve `js/questions.bundle.sha256` dosyalarını birlikte commit edin. Özel kaynak dosyasını eklemeyin.

`protect:questions`, bundle başlığına kaynak SHA-256 değerini yazar ve bundle'ın kendi SHA-256 manifestini günceller. Kaynak mevcutsa iki tarafın eşleşmesi de doğrulanır.

## Temiz klon davranışı

Özel kaynak dosyası bulunmayan temiz bir klonda `npm test` yine çalışır: izole bir JavaScript ortamında bundle'ı açar, 604 sorunun biçimini denetler ve manifest özetini karşılaştırır. `npm run build:web` doğrulamayı geçmeyen bundle'ı dağıtıma kopyalamaz.

Windows EXE ve Android paketleri yalnızca bundle ile SHA-256 manifestini içerir; `js/questions.js` paketlere alınmaz.
