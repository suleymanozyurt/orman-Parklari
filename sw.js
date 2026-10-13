/* Çevrimdışı kabuk.
   - Sayfa (index) ağ öncelikli: yeni sürüm her açılışta gelir, çevrimdışında son kopya.
   - Uygulama dosyaları (?v= sürümlü) önbellekten, arkada güncellenir.
   - Veriler (data/, GitHub API) her zaman ağdan; çevrimdışında son kopya.
   - Harita altlık karoları: görüntülenenler sınırlı sayıda saklanır (çevrimdışında yalnız daha önce açılan bölgeler görünür). */
const V = 'op-v5';
const T = 'op-karo-v1', TMAX = 3000;
const SHELL = ['./', 'index.html', 'app.css?v=5', 'js/engine.js?v=5', 'js/kasa.js?v=5', 'js/ekler.js?v=5', 'js/app.js?v=5', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css', 'vendor/leaflet/images/layers.png', 'vendor/leaflet/images/layers-2x.png', 'vendor/proj4.js', 'vendor/jszip.min.js'];
const KARO = ['tile.openstreetmap.org', 'server.arcgisonline.com'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== T).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
let budama = 0;
async function karoBuda(c) { if (++budama % 50) return; const ks = await c.keys(); if (ks.length > TMAX) await Promise.all(ks.slice(0, ks.length - TMAX).map((k) => c.delete(k))); }
self.addEventListener('fetch', (e) => {
  const q = e.request; if (q.method !== 'GET') return;
  const u = new URL(q.url);
  if (q.mode === 'navigate' && u.origin === location.origin) {   // sayfa: ağ öncelikli
    e.respondWith(fetch(q).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((ca) => ca.put('index.html', c)); } return r; })
      .catch(() => caches.match('index.html').then((m) => m || caches.match('./'))));
    return;
  }
  if (KARO.some((h) => u.hostname.endsWith(h)) && (/\/tile\//.test(u.pathname) || /\.png$/.test(u.pathname))) {   // altlık karoları: önbellek, yoksa ağ
    e.respondWith(caches.open(T).then((c) => c.match(q).then((m) => m || fetch(q).then((r) => { if (r.ok || r.type === 'opaque') { c.put(q, r.clone()); karoBuda(c); } return r; }))));
    return;
  }
  const veri = u.pathname.includes('/data/') || u.hostname === 'api.github.com';
  if (veri) {   // ağ öncelikli; çevrimdışında son kopya
    e.respondWith(fetch(q).then((r) => { if (r.ok && u.origin === location.origin) { const c = r.clone(); caches.open(V).then((ca) => ca.put(u.pathname, c)); } return r; })
      .catch(() => caches.match(u.pathname)));
    return;
  }
  if (u.origin === location.origin) {   // kabuk: önbellek, arkada güncelle
    e.respondWith(caches.match(q).then((m) => { const f = fetch(q).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((ca) => ca.put(q, c)); } return r; }).catch(() => m); return m || f; }));
  }
});
