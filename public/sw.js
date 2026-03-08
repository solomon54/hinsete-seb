/* =========================================
   HINSETE SERVICE WORKER
   Production Grade | Persistent | Hardened
========================================= */

const VERSION = "v1.1.70";
const STATIC_CACHE = `hinsete-static-${VERSION}`;
const RUNTIME_CACHE = `hinsete-runtime-${VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "/assets/images/ennat.jpg",
  "/assets/images/parchment-grain.png",
  "/assets/images/parchment-subtle.webp",
  "/assets/audio/parchment-flip.wav",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Use allSettled so one failing asset doesn't break the whole install on mobile
      const results = await Promise.allSettled(
        STATIC_ASSETS.map((asset) => cache.add(asset))
      );
      results.forEach((res, i) => {
        if (res.status === "rejected") {
          console.warn(`[SW] Failed to cache: ${STATIC_ASSETS[i]}`);
        }
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("hinsete-") && !key.includes(VERSION)
            )
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth") ||
    url.hostname.includes("supabase")
  ) {
    return;
  }

  const isNavigation = request.mode === "navigate";
  const isNextData = url.search.includes("_rsc");

  if (isNavigation || isNextData) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          event.waitUntil(
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, clone))
          );
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          if (isNavigation) return caches.match("/offline.html");
        })
    );
    return;
  }

  if (
    ["image", "audio", "font", "style", "script"].includes(request.destination)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (!response || response.status !== 200) return response;
            const clone = response.clone();
            event.waitUntil(
              caches
                .open(RUNTIME_CACHE)
                .then((cache) => cache.put(request, clone))
            );
            return response;
          })
        );
      })
    );
    return;
  }
});

// Listener for the "Update" action in the Modal
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
