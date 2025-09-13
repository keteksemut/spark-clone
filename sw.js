self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("static-v1").then((cache) => {
      return cache.addAll([
        "/spark-clone/index.js",
        "/css/style.css",
        "/fonts/Inter.woff2",
      ]);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Serve from cache, fallback to network
      return cachedResponse || fetch(event.request);
    }),
  );
});
