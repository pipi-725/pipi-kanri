const CACHE_NAME = "pipi-kanri-v2";

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
    caches.match(event.request)
      .then(function(response) {

        return response || fetch(event.request);

      })
  );

});