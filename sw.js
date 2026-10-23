importScripts("./release-manifest.js");

const { version: RELEASE_VERSION, contentVersion: CONTENT_VERSION, cacheName: CACHE, cachePrefix: CACHE_PREFIX, assets: ASSETS } = self.QIBAO_RELEASE;
const assetUrls = new Set(ASSETS.map((asset) => new URL(asset, self.registration.scope).href));
const shellUrl = new URL("./index.html", self.registration.scope).href;

function inlineResponse(response) {
  if (!response?.headers.get("Content-Disposition")) return response;
  const headers = new Headers(response.headers);
  headers.delete("Content-Disposition");
  // Fetch has already decoded the body; do not copy transport encoding/length.
  headers.delete("Content-Encoding");
  headers.delete("Content-Length");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function validMediaType(asset, response) {
  const type = (response.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
  const ext = asset === "./" ? "html" : asset.split(".").pop().toLowerCase();
  const types = { html: ["text/html"], js: ["text/javascript", "application/javascript"], mjs: ["text/javascript", "application/javascript"], css: ["text/css"], webmanifest: ["application/manifest+json", "application/json"], json: ["application/json"], png: ["image/png"], jpg: ["image/jpeg"], jpeg: ["image/jpeg"], svg: ["image/svg+xml"], webp: ["image/webp"], m4a: ["audio/mp4", "audio/x-m4a", "video/mp4"], mp3: ["audio/mpeg", "audio/mp3"] };
  return !types[ext] || types[ext].includes(type);
}

async function validatedResponse(asset, response) {
  if (response.status !== 200 || !validMediaType(asset, response)) throw new Error(`resource-invalid: ${asset}`);
  if (asset === "./" || asset.endsWith(".html")) {
    const text = await response.clone().text();
    if (!text.includes('id="app"') || !text.includes('src="./app.js"')) throw new Error(`shell-invalid: ${asset}`);
  }
  if (/\.(?:m?js|css)$/.test(asset)) {
    const text = await response.clone().text();
    if (text.trimStart().startsWith("<")) throw new Error(`resource-html: ${asset}`);
    if (asset === "./release-manifest.js" && !text.includes(`version: "${RELEASE_VERSION}"`)) throw new Error("release-mixed: manifest");
    if (asset === "./app.js" && !text.includes(`const APP_RELEASE = "${RELEASE_VERSION}";`)) throw new Error("release-mixed: app");
  }
  return inlineResponse(response);
}

function releaseRequest(asset) {
  return new Request(new URL(asset, self.registration.scope), { cache: "reload", credentials: "same-origin" });
}

async function releaseStatus(existingCache = null) {
  const cache = existingCache || await caches.open(CACHE);
  const matches = await Promise.all(ASSETS.map((asset) => cache.match(new URL(asset, self.registration.scope), { ignoreSearch: true })));
  const cached = matches.filter((response, index) => response && !/attachment/i.test(response.headers.get("Content-Disposition") || "") && validMediaType(ASSETS[index], response)).length;
  return { version: RELEASE_VERSION, cached, total: ASSETS.length, ready: cached === ASSETS.length };
}

async function cacheReleaseAssets() {
  const stagingName = `${CACHE}-download`;
  const staging = await caches.open(stagingName);
  let next = 0;
  let failure;
  try {
    // Bound mobile downloads; all workers finish before deleting the staging cache.
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (!failure && next < ASSETS.length) {
        const asset = ASSETS[next++];
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 60000);
        try {
          const request = new Request(releaseRequest(asset), { signal: controller.signal });
          const response = await validatedResponse(asset, await fetch(request));
          await staging.put(new URL(asset, self.registration.scope), response);
        } catch (error) { failure ||= error; }
        finally { clearTimeout(timer); }
      }
    }));
    if (failure) throw failure;
    const prepared = await releaseStatus(staging);
    if (!prepared.ready) throw new Error("release-incomplete");
    const cache = await caches.open(CACHE);
    for (const asset of ASSETS) {
      const url = new URL(asset, self.registration.scope);
      await cache.put(url, await staging.match(url));
    }
    return releaseStatus(cache);
  } finally { await caches.delete(stagingName); }
}

async function activateBrokenShellRepair() {
  // Exceptional same-content repair only. Healthy upgrades still wait for the parent.
  for (const key of await caches.keys()) {
    if (!key.startsWith(CACHE_PREFIX) || key === CACHE || key.endsWith("-download")) continue;
    const cache = await caches.open(key);
    const shell = await cache.match(shellUrl);
    if (!/attachment/i.test(shell?.headers.get("Content-Disposition") || "")) continue;
    const app = await cache.match(new URL("./app.js", self.registration.scope));
    if (CONTENT_VERSION && (await app?.text())?.includes(`const CONTENT_VERSION = ${CONTENT_VERSION};`)) {
      await self.skipWaiting();
      return;
    }
  }
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clients.forEach((client) => client.postMessage(message));
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try { await cacheReleaseAssets(); await activateBrokenShellRepair(); }
    catch (error) {
      console.error("Qibao release download failed", error);
      await notifyClients({ type: "QIBAO_RELEASE_FAILED", error: "课程资源未完整下载，请保持联网后重试" });
      throw error;
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    if (!(await releaseStatus()).ready) throw new Error("release-incomplete");
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE && !key.endsWith("-download")).map((key) => caches.delete(key)));
    await self.clients.claim();
    await notifyClients({ type: "QIBAO_RELEASE_ACTIVATED", version: RELEASE_VERSION });
  })());
});

async function cachedReleaseResponse(request) {
  const cache = await caches.open(CACHE);
  const url = new URL(request.url);
  url.search = "";
  return inlineResponse(await cache.match(url.href, { ignoreSearch: true }));
}

async function rangeResponse(request) {
  const cached = await cachedReleaseResponse(request);
  if (!cached) return fetch(request);
  const match = /^bytes=(\d*)-(\d*)$/i.exec((request.headers.get("range") || "").trim());
  if (!match) return cached;
  const blob = await cached.blob();
  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : blob.size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= blob.size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${blob.size}` } });
  }
  const boundedEnd = Math.min(end, blob.size - 1);
  const headers = new Headers(cached.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(boundedEnd - start + 1));
  headers.set("Content-Range", `bytes ${start}-${boundedEnd}/${blob.size}`);
  return new Response(blob.slice(start, boundedEnd + 1, blob.type), { status: 206, statusText: "Partial Content", headers });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const normalized = new URL(url.href);
  normalized.search = "";
  if (request.headers.has("range") && assetUrls.has(normalized.href)) {
    event.respondWith(rangeResponse(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match(shellUrl)).then((cached) => cached ? inlineResponse(cached) : fetch(request)));
    return;
  }
  if (assetUrls.has(normalized.href)) {
    event.respondWith(cachedReleaseResponse(request).then((cached) => cached || fetch(request)));
  }
});

self.addEventListener("message", (event) => {
  const reply = (payload) => event.ports?.[0]?.postMessage(payload);
  if (event.data?.type === "QIBAO_GET_RELEASE_STATUS") {
    event.waitUntil(releaseStatus().then((status) => reply({ ok: true, ...status })).catch((error) => reply({ ok: false, error: error?.message || "status-failed" })));
  }
  if (event.data?.type === "QIBAO_REPAIR_RELEASE") {
    event.waitUntil(cacheReleaseAssets().then((status) => reply({ ok: true, ...status })).catch((error) => reply({ ok: false, error: error?.message || "download-failed" })));
  }
  if (event.data?.type === "QIBAO_ACTIVATE_RELEASE") self.skipWaiting();
});
