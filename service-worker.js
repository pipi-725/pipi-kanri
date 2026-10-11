const CACHE_NAME = "pipi-kanri-v10";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];


// インストール時に必要なファイルを保存
self.addEventListener("install", function(event) {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(FILES_TO_CACHE);
      })
  );

});


// 保存したファイルを優先して読み込む
self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        const responseClone = response.clone();

        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseClone);
          });

        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});

// 古いキャッシュを削除
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});