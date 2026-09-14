/* Service Worker بسيط — عمل الموقع دون اتصال */
const CACHE = 'aqua-shell-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/', '/offline']).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((cached) => cached || caches.match('/'))
            .then((cached) => cached || caches.match('/offline'))
        )
    );
    return;
  }
  event.respondWith(
    caches
      .match(req)
      .then(
        (cached) =>
          cached ||
          fetch(req)
            .then((res) => {
              if (res.ok && new URL(req.url).origin === self.location.origin) {
                const copy = res.clone();
                caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
              }
              return res;
            })
            .catch(() => caches.match('/offline'))
      )
  );
});