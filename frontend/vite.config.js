import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function buildServiceWorkerSource(assetPaths) {
  return `const APP_VERSION = "lifeline-v3";
const APP_SHELL_CACHE = \`\${APP_VERSION}-shell\`;
const RUNTIME_CACHE = \`\${APP_VERSION}-runtime\`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = ${JSON.stringify(
    [
      "/",
      "/offline.html",
      "/manifest.json",
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      ...assetPaths,
    ],
    null,
    2
  )};

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.addAll(PRECACHE_URLS);
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
    await cache.put(request, response.clone());
  }

  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const offlineResponse = await caches.match(OFFLINE_URL);

    if (offlineResponse) {
      return offlineResponse;
    }

    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function navigationCacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const appShellResponse = await caches.match("/");

  if (appShellResponse) {
    return appShellResponse;
  }

  return networkFirst(request);
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
    event.respondWith(navigationCacheFirst(request));
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
});`;
}

function pwaAssetManifestPlugin() {
  return {
    name: "lifeline-pwa-asset-manifest",
    apply: "build",
    generateBundle(_, bundle) {
      const assetPaths = Object.values(bundle)
        .map((item) => item?.fileName)
        .filter(Boolean)
        .filter((fileName) => !fileName.endsWith(".map"))
        .filter((fileName) => fileName !== "index.html")
        .filter((fileName) => fileName !== "lifeline-sw.js")
        .map((fileName) => `/${fileName}`);

      this.emitFile({
        type: "asset",
        fileName: "pwa-assets.json",
        source: JSON.stringify([...new Set(assetPaths)], null, 2),
      });

      this.emitFile({
        type: "asset",
        fileName: "lifeline-sw.js",
        source: buildServiceWorkerSource([...new Set(assetPaths)]),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), pwaAssetManifestPlugin()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
