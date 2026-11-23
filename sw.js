// Senaryo: çevrimdışı açılış için basit önbellek. Sayfa önce ağdan (güncel sürüm), ağ yoksa önbellekten gelir.
const CACHE = 'senaryo-v1';
const PRE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;   // Gemini ve yazı tipleri etkilenmez
  const page = r.mode === 'navigate' || u.pathname.endsWith('/index.html');
  e.respondWith(page
    ? fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return res; })
        .catch(() => caches.match('index.html').then(x => x || caches.match('./')))
    : caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })));
});
