const CACHE_PREFIX = "jb-virtual-perfume-lab-";
const CACHE_NAME = `${CACHE_PREFIX}shell-v19`;
const THREE_MODULE_URL = "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js";
const THREE_CORE_URL = "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.core.js";
const THREE_ASSETS = new Set([THREE_MODULE_URL, THREE_CORE_URL]);

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
  "./src/js/app.js",
  "./src/js/core/navigation.js",
  "./src/js/core/pwa.js",
  "./src/js/features/perfume-library/data.js",
  "./src/js/features/perfume-library/library.js",
  "./src/js/features/laboratory/catalog.js",
  "./src/js/features/laboratory/inspector.js",
  "./src/js/features/laboratory/scene.js",
  "./src/js/features/laboratory/render-profile.js",
  "./src/js/features/laboratory/architecture.js",
  "./src/js/features/laboratory/materials.js",
  "./src/js/features/laboratory/environment.js",
  "./src/js/features/laboratory/perfume-assets.js",
  "./src/js/features/laboratory/mixing/state.js",
  "./src/js/features/laboratory/mixing/panel.js",
  "./src/js/features/laboratory/analysis/engine.js",
  "./src/js/features/laboratory/analysis/panel.js",
  "./src/js/features/laboratory/evolution/engine.js",
  "./src/js/features/laboratory/evolution/panel.js",
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
  const requestUrl = new URL(request.url);
  if (request.method !== "GET") return;

  if (requestUrl.origin !== self.location.origin) {
    if (!THREE_ASSETS.has(request.url)) return;
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })());
    return;
  }

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
