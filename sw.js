/* CariocAce Hands: works offline once opened; the page itself is refreshed from the network whenever there is one,
   so a new version published on the host reaches the phone on the next open. */
const V = 'cah-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    /* page: network first, but never wait more than 3.5 s on a bad connection (poker room wifi) */
    e.respondWith((async () => {
      const cache = await caches.open(V);
      /* ask the server whether the page changed, instead of trusting the host's 10-minute HTTP cache (GitHub Pages) */
      const net = fetch(r.url, { cache: 'no-cache' });
      const cached = await cache.match('./index.html');
      if (!cached) return net;
      /* a network error or an error page (5xx, 404...) must never replace the saved copy */
      const good = net.then(res => { if (!(res && res.ok)) throw new Error('bad response'); cache.put('./index.html', res.clone()); return res; });
      return Promise.race([good.catch(() => cached), new Promise(res => setTimeout(() => res(cached), 3500))]);
    })());
    return;
  }
  const fonts = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (u.origin === location.origin || fonts) {
    /* files and fonts: serve the saved copy at once, refresh it in the background */
    e.respondWith(caches.match(r).then(hit => {
      const net = fetch(r, u.origin === location.origin ? { cache: 'no-cache' } : undefined).then(res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
      e.waitUntil(net.catch(() => {}));
      return hit || net;
    }));
  }
});
