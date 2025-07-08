const CACHE_NAME = 'sticker-cropper-v1.2.0';
const STATIC_CACHE = 'sticker-static-v1.2.0';
const DYNAMIC_CACHE = 'sticker-dynamic-v1.2.0';

// Critical resources to cache immediately
const STATIC_URLS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/StickerCropperApp.js',
  '/js/CanvasManager.js',
  '/js/GridManager.js',
  '/js/StickerManager.js',
  '/js/EventManager.js',
  '/js/MessageManager.js',
  '/js/PerformanceMonitor.js',
  '/sticker_sheet.png',
  '/manifest.json',
  '/favicon.ico',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/apple-touch-icon.png',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png'
];

// External resources that should be cached
const EXTERNAL_URLS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_URLS);
      }),
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Caching external resources');
        return cache.addAll(EXTERNAL_URLS.map(url => new Request(url, {
          cache: 'reload'
        })));
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      self.skipWaiting();
    }).catch((error) => {
      console.error('Service Worker installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    cacheFirst(event.request)
  );
});

// Cache-first strategy with network fallback
async function cacheFirst(request) {
  try {
    // Check static cache first
    const staticResponse = await caches.match(request, { cacheName: STATIC_CACHE });
    if (staticResponse) {
      return staticResponse;
    }
    
    // Check dynamic cache
    const dynamicResponse = await caches.match(request, { cacheName: DYNAMIC_CACHE });
    if (dynamicResponse) {
      return dynamicResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    
    // Return offline fallback for navigation requests
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    // Return generic offline response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle any background sync tasks
  return Promise.resolve();
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/android-chrome-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Sticker Cropper', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
