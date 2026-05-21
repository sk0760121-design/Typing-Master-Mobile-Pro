const CACHE_NAME = 'typemaster-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'
];

// Service Worker Install Event - caches static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching Web App Shell...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[Service Worker] Pre-caching asset omitted/failed: ', err);
      });
    })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Service Worker Activate Event - cleans up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Purging stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Dynamic Offline Caching strategy: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only handle GET requests and ignore WebSocket/HMR or external Chrome extensions protocols
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin) && !request.url.startsWith('http')) {
    return;
  }

  // Bypass API requests to Gemini if server routes are called
  if (request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline fallbacks can be handled here if needed
          });

        // Return cached version immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
