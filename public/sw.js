/* =========================================
   HINSETE SERVICE WORKER
   Production Grade | Persistent | Hardened
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
  "/assets/images/ennat.jpg",
  "/assets/images/parchment-grain.png",
  "/assets/images/parchment-subtle.webp",
  "/assets/audio/parchment%20flip.wav",
];

/* =========================================
   INSTALL (Kept your Individual Caching)
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
   ACTIVATE (Kept your Hardened Cleanup)
========================================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("hinsete-") && !key.endsWith(VERSION)
            )
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

/* =========================================
   FETCH HANDLER (The "Persistence" Engine)
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

  // 2. PERSISTENT CONTENT: Navigation OR Next.js Data (_rsc)
  // This ensures that when user read a chapter, the SW "steals" a copy for the cache.
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
          // If network fails, look for this specific page/data in the cache
          const cached = await caches.match(request);
          if (cached) return cached;

          // If it's a new page and we have nothing, show offline fallback
          if (isNavigation) return caches.match("/offline.html");
        })
    );
    return;
  }

  // 3. STATIC ASSETS (Cache First, then Network)
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
