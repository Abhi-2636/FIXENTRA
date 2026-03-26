// Fixentra Service Worker for PWA (#29)
const CACHE_NAME = 'fixentra-v1';
const urlsToCache = ['/', '/styles.css', '/app.js', '/hero.png'];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
