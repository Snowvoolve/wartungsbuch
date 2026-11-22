/* Service Worker: legt die App-Dateien auf dem Gerät ab, damit sie auch offline startet.
   Vergleich: wie ein Ersatzteillager vor Ort statt jedes Mal beim Händler zu bestellen.
   Bei jeder Änderung an der App die VERSION hochzählen, sonst sehen Nutzer die alte Version. */
const VERSION = "wartungsbuch-v1";
const DATEIEN = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(namen => Promise.all(namen.filter(n => n !== VERSION).map(n => caches.delete(n))))
  );
  self.clients.claim();
});

// Erst aus dem Internet laden (immer aktuell), wenn offline, aus dem Lager
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(antwort => {
        const kopie = antwort.clone();
        caches.open(VERSION).then(c => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
