/* Service Worker: legt die App-Dateien auf dem Gerät ab, damit sie auch offline startet.
   Vergleich: wie ein Ersatzteillager vor Ort statt jedes Mal beim Händler zu bestellen.
   Bei jeder Änderung an der App die VERSION hochzählen, sonst sehen Nutzer die alte Version. */
const VERSION = "wartungsbuch-v4";
const DATEIEN = [
  "./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"
];

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
  // Eigene Dateien immer beim Server nachfragen, ob es eine neue Version gibt
  const eigene = new URL(e.request.url).origin === self.location.origin;
  const anfrage = eigene ? fetch(e.request.url, { cache: "no-cache" }) : fetch(e.request);
  e.respondWith(
    anfrage
      .then(antwort => {
        const kopie = antwort.clone();
        caches.open(VERSION).then(c => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
