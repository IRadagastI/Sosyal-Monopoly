// Bilgiopoli - Service Worker (offline destek)
// ONEMLI: index.html/css/js her degistiginde bu surumu artir. Asagidaki fetch
// stratejisi cache-first oldugu icin surum artmazsa cihaz eski kodu calistirmaya
// devam eder.
const CACHE_VERSION = 'bilgiopoli-v8';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/questions.bundle.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  // Yerelleştirilmiş kütüphaneler (vendor)
  './vendor/confetti.browser.min.js',
  './vendor/sweetalert2.all.min.js',
  './vendor/fontawesome/css/all.min.css',
  './vendor/fontawesome/webfonts/fa-solid-900.woff2',
  // Yerelleştirilmiş yazı tipi (Outfit)
  './vendor/fonts/outfit.css',
  './vendor/fonts/files/v15-QGYvz_MVcBeNP4NJuktqQ4E.woff2',
  './vendor/fonts/files/v15-QGYvz_MVcBeNP4NJtEtq.woff2'
];

// Yükleme: çekirdek dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktivasyon: eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// İstekler: önbellekte varsa önce önbellek, arka planda ağdan tazelenir
// (cache-first + background revalidate). Yeni sürüm ancak CACHE_VERSION
// artırıldığında anında devreye girer.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        // Sadece geçerli yanıtları önbelleğe al
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
