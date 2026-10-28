// sw.js
const CACHE_NAME = 'alagamap-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './logo.png',
  './js/firebase.js',
  './js/data.js',
  './js/auth.js',
  './js/map.js',
  './js/report.js',
  './js/quiz.js',
  './js/app.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta as requisições para rodar rápido
self.addEventListener('fetch', (event) => {
  // Ignora requisições para o Firebase ou Leaflet externo para sempre pegar os dados em tempo real
  if (event.request.url.includes('firebase') || event.request.url.includes('openstreetmap')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
