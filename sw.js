/* Frauen-Balance-Check: kleiner Offline-Helfer.
   Er holt Seiten immer zuerst frisch aus dem Netz, damit Neuerungen sofort
   ankommen, und legt eine Kopie fuer die Offline-Nutzung ab. Ohne Netz
   antwortet er aus der Kopie. Es werden keine Daten gesammelt oder gesendet. */
"use strict";
const ABLAGE = "frauen-balance-check-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(alle => Promise.all(alle.filter(k => k !== ABLAGE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(antwort => {
        const kopie = antwort.clone();
        caches.open(ABLAGE).then(ablage => ablage.put(e.request, kopie)).catch(() => {});
        return antwort;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
