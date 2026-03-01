/*
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
*/

//開発用
// service-worker.js
const CACHE_NAME = "todo-cache-dev-v1";
const urlsToCache = [
  "/",             // ホームページ
  "/style.css",    // CSS
  "/script.js",    // JS
  "/manifest.json",// PWA マニフェスト
  "/icon-192.png", // アイコン
  "/icon-512.png"
];

// インストール時に静的ファイルをキャッシュ
self.addEventListener("install", event => {
  self.skipWaiting(); // 新しい SW を即アクティブ化
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// アクティベート時に古いキャッシュを削除
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// フェッチ時の挙動
self.addEventListener("fetch", event => {
  const requestUrl = new URL(event.request.url);

  // API やログインページはキャッシュを使わず、ネットワーク優先
  if (requestUrl.pathname.startsWith("/todos") || requestUrl.pathname.startsWith("/login")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // それ以外はキャッシュ優先
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});