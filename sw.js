const CACHE_NAME = 'planer-cache-v2'; // Mudei para v2 para forçar a atualização
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Instala o Service Worker e armazena os arquivos em cache
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Força o novo SW a assumir o controle imediatamente
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativa o Worker e limpa caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Deleta o cache antigo (v1)
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle das abas abertas
  );
});

// Estratégia de Cache: Cache First com atualização em segundo plano
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
