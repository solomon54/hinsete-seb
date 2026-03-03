//public/sw.js
/* =========================================
   HINSETE SERVICE WORKER
   Robust | Safe | Content-First
========================================= */

const VERSION = "v1";
const STATIC_CACHE = `hinsete-static-${VERSION}`;
const RUNTIME_CACHE = `hinsete-runtime-${VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/favicon-for-app/manifest.json",
  "/assets/images/parchment-grain.png",
  "/assets/images/parchment-subtle.webp",
  "/assets/images/cover_etching.jpg",
  "/assets/audio/page-flip.wav",
  "/assets/audio/Parchment flip.wav",
  "/lib/contents/introduction.json",
  "/lib/contents/chapter_1.json",
  "/lib/contents/chapter_2.json",
  "/lib/contents/chapter_3.json",
];

/* =========================================
   INSTALL
========================================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* =========================================
   ACTIVATE (Cleanup Old Caches)
========================================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

/* =========================================
   CACHE SIZE LIMITER
========================================= */
function limitCacheSize(name, size) {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
}

/* =========================================
   FETCH STRATEGY
========================================= */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* ----------------------------------------
     🚫 NEVER CACHE AUTH / API / SUPABASE
  ----------------------------------------- */
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth") ||
    url.hostname.includes("supabase")
  ) {
    return;
  }

  /* ----------------------------------------
     📄 JSON CONTENT (Lessons) → CACHE FIRST
  ----------------------------------------- */
  if (request.url.endsWith(".json")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            if (!res || res.status !== 200) return res;
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
              limitCacheSize(RUNTIME_CACHE, 60);
            });
            return res;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  /* ----------------------------------------
     🖼️ STATIC ASSETS → CACHE FIRST
  ----------------------------------------- */
  if (
    ["image", "audio", "font", "style", "script"].includes(request.destination)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            if (!res || res.status !== 200) return res;
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
              limitCacheSize(RUNTIME_CACHE, 60);
            });
            return res;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  /* ----------------------------------------
     📄 NAVIGATION (HTML) → NETWORK FIRST
  ----------------------------------------- */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clone);
            limitCacheSize(RUNTIME_CACHE, 30);
          });
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  /* ----------------------------------------
     📦 DEFAULT → STALE WHILE REVALIDATE
  ----------------------------------------- */
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
              limitCacheSize(RUNTIME_CACHE, 60);
            });
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
