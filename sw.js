// =========================================
// SERVICE WORKER
// Cache-first for same-origin static assets (css/js/images/audio/fonts).
// Network-first for the HTML document itself, so content updates are
// still picked up on the next load while everything heavy stays cached.
// =========================================
// v2 — bumped to evict any stale v1 cache entries that may have been
// written with the broken clone handler (fix below).
const CACHE_NAME = 'love-letter-cache-v2';
const PRECACHE_URLS = [
  './',
  'index.html',
  'css/style.css',
  'css/animations.css',
  'css/responsive.css',
  'css/cinematic.css',
  'js/perf-core.js',
  'js/particles.js',
  'js/rain.js',
  'js/cursor.js',
  'js/cinematic.js',
  'js/audio.js',
  'js/scenes.js',
  'js/main.js',
  'assets/images/heart.webp',
  'assets/images/bridge-bg.webp',
  'assets/images/paper-texture.webp',
  'assets/audio/rain.mp3',
  'assets/audio/piano.mp3',
  'assets/audio/thunder.mp3',
  'assets/audio/lightning-spike.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {}) // never block install on one missing/blocked asset
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // let CDN requests pass through untouched

  // HTML: network-first so edits to the page are picked up, falling back
  // to cache when offline / on a dropped connection.
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        // FIX: clone() must be called synchronously, before caches.open()
        // goes async — by the time that microtask resolves the original
        // response body may already be partially consumed by the browser.
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Everything else (css/js/images/audio): cache-first, fill the cache
  // in the background on first miss.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200) {
          // FIX: clone synchronously before entering the async caches.open chain.
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
