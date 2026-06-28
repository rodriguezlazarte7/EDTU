// EDTU Service Worker — cache del "shell" para que funcione offline.
const CACHE = "edtu-v2";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Navegación: red primero, y si no hay conexión, sirve el shell cacheado.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put("./index.html", copy)).catch(()=>{});
        return r;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  // Iconos/manifest: cache primero. El resto (Supabase, CDNs) pasa directo a la red.
  if (SHELL.some(s => req.url.endsWith(s.replace("./", "")))) {
    e.respondWith(caches.match(req).then(c => c || fetch(req)));
  }
});
