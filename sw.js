// Кэширует только оболочку приложения (страницу и иконки), чтобы оно открывалось быстро.
// Данные о долгах сервис-воркер не кэширует — они запрашиваются у Google каждый раз.
const CACHE = 'arenda-v3';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;            // запросы к Google — мимо кэша
  e.respondWith(fetch(e.request).then(r => {           // сначала сеть (свежая версия), при отсутствии сети — кэш
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request)));
});
