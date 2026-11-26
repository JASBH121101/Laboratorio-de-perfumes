const CACHE_PREFIX = "jb-virtual-perfume-lab-";
const CACHE_NAME = `${CACHE_PREFIX}shell-v44`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/brand-logo.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./src/css/styles.css",
  "./src/css/design-system.css",
  "./src/css/perfume-library.css",
  "./src/css/laboratory.css",
  "./src/css/analytics.css",
  "./src/js/app.js",
  "./src/js/core/navigation.js",
  "./src/js/core/pwa.js",
  "./src/js/features/perfume-library/data.js",
  "./src/js/features/perfume-library/library.js",
  "./src/js/features/laboratory/mixing/state.js",
  "./src/js/features/laboratory/mixing/draft-storage.js",
  "./src/js/features/laboratory/mixing/panel.js",
  "./src/js/features/laboratory/creative-assistant/engine.js",
  "./src/js/features/laboratory/creative-assistant/panel.js",
  "./src/js/features/laboratory/formulation-proposals/engine.js",
  "./src/js/features/laboratory/formulation-proposals/panel.js",
  "./src/js/features/laboratory/inspiration-differentiation/engine.js",
  "./src/js/features/laboratory/inspiration-differentiation/panel.js",
  "./src/js/features/laboratory/client-brief/engine.js",
  "./src/js/features/laboratory/client-brief/panel.js",
  "./src/js/features/laboratory/audience-fit/engine.js",
  "./src/js/features/laboratory/audience-fit/panel.js",
  "./src/js/features/laboratory/reference-benchmark/data.js",
  "./src/js/features/laboratory/reference-benchmark/engine.js",
  "./src/js/features/laboratory/reference-benchmark/panel.js",
  "./src/js/features/laboratory/analysis/engine.js",
  "./src/js/features/laboratory/analysis/panel.js",
  "./src/js/features/laboratory/analytics/dashboard.js",
  "./src/js/features/laboratory/originality/engine.js",
  "./src/js/features/laboratory/originality/panel.js",
  "./src/js/features/laboratory/comparison/engine.js",
  "./src/js/features/laboratory/comparison/panel.js",
  "./src/js/features/laboratory/signature-history/engine.js",
  "./src/js/features/laboratory/signature-history/panel.js",
  "./src/js/features/laboratory/sensory-experiments/model.js",
  "./src/js/features/laboratory/sensory-experiments/panel.js",
  "./src/js/features/laboratory/professional-reports/engine.js",
  "./src/js/features/laboratory/professional-reports/panel.js",
  "./src/js/features/laboratory/evolution/engine.js",
  "./src/js/features/laboratory/evolution/panel.js",
  "./src/js/features/laboratory/performance-estimator/engine.js",
  "./src/js/features/laboratory/performance-estimator/panel.js",
  "./src/js/features/archive/model.js",
  "./src/js/features/archive/repository.js",
  "./src/js/features/archive/panel.js",
  "./src/js/ui/views.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("./index.html", response.clone());
        }
        return response;
      } catch {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const refresh = fetch(request).then(async (response) => {
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }).catch(() => null);
    if (cached) {
      event.waitUntil(refresh.then(() => undefined));
      return cached;
    }
    return (await refresh) || Response.error();
  })());
});
