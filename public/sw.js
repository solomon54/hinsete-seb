/* =========================================
   HINSETE SERVICE WORKER
   Production Grade | Bulletproof | Safe
========================================= */

const VERSION = "v1.1.0";
const STATIC_CACHE = `hinsete-static-${VERSION}`;
const RUNTIME_CACHE = `hinsete-runtime-${VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "/assets/images/parchment-grain.png",
  "/assets/images/parchment-subtle.webp",
  "/assets/audio/parchment%20flip.wav",
];

/* =========================================
   INSTALL (Individual Caching)
========================================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn("[SW] Skipping non-existent asset:", asset);
        }
      }
    })
  );
  self.skipWaiting();
});

/* =========================================
   ACTIVATE (Hardened Cleanup)
========================================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("hinsete-static-") ||
              key.startsWith("hinsete-runtime-")
          )
          .filter((key) => !key.endsWith(VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* =========================================
   FETCH HANDLER
========================================= */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1. BYPASS AUTH & API (Always Network)
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth") ||
    url.hostname.includes("supabase")
  ) {
    return;
  }

  // 2. NAVIGATION (Network First, then Offline Page)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
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
          return cached || caches.match("/offline.html");
        })
    );
    return;
  }

  // 3. STATIC ASSETS (Cache First)
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
