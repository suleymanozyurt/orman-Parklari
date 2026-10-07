/* Çevrimdışı kabuk: uygulama dosyaları önbellekten, veriler her zaman ağdan (yoksa son kopya) */
const V = 'op-v1';
const SHELL = ['./', 'index.html', 'app.css?v=1', 'js/engine.js?v=1', 'js/kasa.js?v=1', 'js/app.js?v=1', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const veri = u.pathname.includes('/data/') || u.hostname === 'api.github.com';
  if (veri) {   // ağ öncelikli; çevrimdışında son kopya
    e.respondWith(fetch(e.request).then((r) => { if (r.ok && u.origin === location.origin) { const c = r.clone(); caches.open(V).then((ca) => ca.put(u.pathname, c)); } return r; })
      .catch(() => caches.match(u.pathname)));
    return;
  }
  if (u.origin === location.origin) {   // kabuk: önbellek, arkada güncelle
    e.respondWith(caches.match(e.request).then((m) => { const f = fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); } return r; }).catch(() => m); return m || f; }));
  }
});
