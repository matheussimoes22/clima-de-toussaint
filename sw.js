/* Service Worker - Clima de Toussaint */
const CACHE = "toussaint-v9-source-cleanup";
const ASSETS = [
  "./",
  "./index.html",
  "./clima-de-toussaint.html",
  "./manifest.webmanifest",
  "./assets/css/tailwind.css",
  "./assets/css/styles.css",
  "./assets/icons/app-icon.svg",
  "./assets/js/main.js",
  "./assets/js/app/app-controller.js",
  "./assets/js/data/world-data.js",
  "./assets/js/engine/weather-engine.js",
  "./assets/js/engine/weather-dynamics.js",
  "./assets/js/engine/weather-events.js",
  "./assets/js/views/interface-icons.js",
  "./assets/js/views/bulletin-copy.js",
  "./assets/js/navigation/calendar-swipe.js",
  "./assets/js/i18n/translations.js",
  "./assets/js/navigation/history-router.js",
  "./assets/js/state/preferences.js",
  "./assets/js/state/records.js",
  "./assets/js/views/event-bulletins.js",
  "./assets/js/views/today-view.js",
  "./assets/js/views/calendar-view.js",
  "./assets/js/views/monthly-view.js",
  "./assets/js/views/moon-view.js",
  "./favicon.ico",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Navegações usam a versão mais recente quando há rede e recorrem ao cache offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
          }
          return resp;
        })
        .catch(() =>
          caches
            .match(req)
            .then(
              (cached) => cached || caches.match("./clima-de-toussaint.html"),
            ),
        ),
    );
    return;
  }

  // Assets locais priorizam a rede para que HTML, CSS e JS sejam atualizados
  // juntos. O cache continua sendo o fallback quando o dispositivo está offline.
  e.respondWith(
    fetch(req)
      .then((resp) => {
        // Cacheia respostas válidas da própria origem.
        if (resp && resp.status === 200 && resp.type === "basic") {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return resp;
      })
      .catch(() => caches.match(req)),
  );
});
