const APP_VERSION = "lifeline-v2";
const APP_SHELL_CACHE = `${APP_VERSION}-shell`;
const RUNTIME_CACHE = `${APP_VERSION}-runtime`;
const OFFLINE_URL = "/offline.html";
const PWA_ASSET_MANIFEST_URL = "/pwa-assets.json";
const STATIC_URLS = [
  "/",
  OFFLINE_URL,
  PWA_ASSET_MANIFEST_URL,
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

async function buildPrecacheUrls() {
  try {
    const response = await fetch(PWA_ASSET_MANIFEST_URL, { cache: "no-store" });
    const assetUrls = await response.json();

    if (!Array.isArray(assetUrls)) {
      return STATIC_URLS;
    }

    return [...new Set([...STATIC_URLS, ...assetUrls])];
  } catch {
    return STATIC_URLS;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const precacheUrls = await buildPrecacheUrls();
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.addAll(precacheUrls);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }

  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return caches.match(OFFLINE_URL);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (!isSameOrigin(requestUrl)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(
    cacheFirst(request).catch(async () => {
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }

      return new Response("", {
        status: 503,
        statusText: "Offline asset unavailable",
      });
    })
  );
});
