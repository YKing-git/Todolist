const CACHE_NAME = "todo-cache-v1";
const urlsToCache = [
  "/",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon-180.png"
];

// インストール時に必要なファイルをキャッシュ
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("キャッシュを追加中...");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // 新しいSWを即座に有効化
});

// アクティベート時に古いキャッシュを削除
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("古いキャッシュ削除:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // すぐにページを制御
});

// ネットワークにアクセスする前にキャッシュをチェック
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // キャッシュがあれば返す、なければネットワークから取得
      return response || fetch(event.request).catch(() => {
        // オフライン時、トップページにフォールバック
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});
