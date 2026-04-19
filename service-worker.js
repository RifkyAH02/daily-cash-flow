const CACHE_NAME = 'rifky-cf-cache-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './logo.png',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;800&display=swap'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force active
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            clients.claim(), // Claim all clients immediately
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.filter((name) => name !== CACHE_NAME)
                              .map((name) => caches.delete(name))
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
