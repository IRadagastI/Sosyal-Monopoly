# Soru Havuzu — Yerel Kaynak Dosyasi

`js/questions.js` dosyasi **bilerek GitHub'a yuklenmez** (telif / icerik korumasi).

## Yeni bilgisayarda veya projeyi klonladiktan sonra

1. Eski bilgisayarinizdan `js/questions.js` dosyasini guvenli sekilde kopyalayin  
   (veya yedeginizden geri yukleyin).
2. Soru duzenledikten sonra:
   ```bash
   npm run protect:questions
   npm run build:web
   ```
3. `js/questions.bundle.js` dosyasini commit/push edin (sifreli yayin dosyasi).

## Soru formati

```javascript
{ q: "Soru metni", opts: ["A) ...", "B) ...", "C) ...", "D) ..."], ans: 0 }
```

`ans` degeri 0–3 arasi (dogru sikkin indeksi).

## Dogrulama

```bash
npm test
```

> Not: Bu repoda yalnizca `questions.bundle.js` (sifreli) bulunur; duzenlenebilir kaynak yerel kalir.
