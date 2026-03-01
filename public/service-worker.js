const CACHE_NAME = "todo-cache-v1";
const urlsToCache = [
  "/",
  "/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

//更新履歴　（何か変更するたびにつける）
//  update 2026-03-01
