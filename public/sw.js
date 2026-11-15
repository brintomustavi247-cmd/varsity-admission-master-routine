const CACHE_NAME = 'varsity-routine-v5';
const STATIC_ASSETS = [
  '/icons/mascot-notification.png',
  '/icons/badge-cyber-cat.png',
  '/mascot/cyber-cat.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/icons/badge-96.png',
  '/favicon.ico',
  '/manifest.webmanifest'
];

// Install: precache only static icons (NEVER index.html to avoid stale hash chunk errors)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

// Activate: purge all old caches immediately
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
    }).then(() => self.clients.claim())
  );
});

// Fetch handler: Always fetch fresh HTML from network so new app deployments load immediately
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // For HTML navigation: Network ONLY (no stale cache)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // For static icons: Cache first with network fallback
  if (url.pathname.startsWith('/icons/') || url.pathname === '/favicon.ico') {
    event.respondWith(
      caches.match(req).then((cached) => {
        return cached || fetch(req);
      })
    );
    return;
  }

  // For all other requests (JS/CSS assets): Network first
  event.respondWith(fetch(req));
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'ভার্সিটি অ্যাডমিশন রুটিন', {
        body: data.body || 'আজকের মিশন সম্পূর্ণ করুন!',
        icon: '/icons/mascot-notification.png',
        badge: '/icons/badge-cyber-cat.png',
        tag: data.tag || 'admission-routine-alert',
        renotify: true,
        data: { url: data.url || '/?tab=routine' },
      })
    );
  } catch {
    // Ignore non-json push
  }
});

// Handle notification click on mobile phone / desktop
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/?tab=routine';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
