const CACHE_NAME = 'varsity-routine-v12';
const STATIC_ASSETS = [
  '/icons/mascot-notification.png',
  '/icons/badge-cyber-cat.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/icons/apple-touch-icon.png',
  '/mascot/cyber-cat.png',
  '/mascot/cyber-cat-sassy.png',
  '/mascot/cyber-cat-psycho.png',
  '/mascot/cyber-cat-crying.png',
  '/mascot/cyber-cat-smug.png',
  '/mascot/cyber-cat-panic.png',
  '/mascot/cyber-cat-exhausted.png',
  '/mascot/cyber-cat-sleepy.png',
  '/mascot/cyber-cat-happy.png',
  '/favicon.ico',
  '/manifest.webmanifest'
];

// Persistent state cache across wakeups
let routineState = {
  dayNumber: 1,
  remainingTasks: 0,
  lastUpdated: 0,
};

function getAbsoluteUrl(path) {
  if (!path) return `${self.location.origin}/mascot/cyber-cat-sassy.png`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return new URL(path, self.location.origin).href;
}

// Install: precache static branding icons and reaction mascots
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

// Activate: purge all outdated caches immediately
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

// Fetch handler: Never cache HTML navigation to ensure latest version is always loaded
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

  // For static icons & mascots: Cache first with network fallback
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/mascot/') || url.pathname === '/favicon.ico') {
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

// Message listener for background triggers from foreground tabs
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SYNC_ROUTINE_STATE') {
    routineState = {
      dayNumber: event.data.dayNumber || routineState.dayNumber,
      remainingTasks: event.data.remainingTasks ?? routineState.remainingTasks,
      lastUpdated: Date.now(),
    };
  }

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const icon = getAbsoluteUrl(options?.icon || '/mascot/cyber-cat-sassy.png');
    const image = getAbsoluteUrl(options?.image || icon);
    const badge = getAbsoluteUrl('/icons/badge-cyber-cat.png');

    event.waitUntil(
      self.registration.showNotification(title, {
        icon,
        image,
        badge,
        ...options,
      })
    );
  }

  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options, delayMs } = event.data;
    const icon = getAbsoluteUrl(options?.icon || '/mascot/cyber-cat-sassy.png');
    const image = getAbsoluteUrl(options?.image || icon);
    const badge = getAbsoluteUrl('/icons/badge-cyber-cat.png');

    // Use event.waitUntil so the browser keeps the Service Worker alive in the background
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(async () => {
          try {
            await self.registration.showNotification(title, {
              icon,
              image,
              badge,
              ...options,
            });
          } catch (err) {
            console.error('Scheduled notification failed:', err);
          } finally {
            resolve();
          }
        }, delayMs || 60000);
      })
    );
  }
});

// Periodic Background Sync: wakes up Service Worker periodically even when tab is closed
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'routine-check' || event.tag === 'daily-mission-sync') {
    event.waitUntil(
      (async () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        // 11:40 PM Alert
        if (hour === 23 && minute >= 40) {
          const icon = getAbsoluteUrl('/mascot/cyber-cat-panic.png');
          const tasksText = routineState.remainingTasks > 0 ? `আজকের ${routineState.remainingTasks}টি ` : 'আজকের ';
          await self.registration.showNotification('রাত ১১টা ৪০ বাজার আলটিমেটাম! 🕛⏰', {
            body: `রাত ১২টা বাজতে আর মাত্র ২০ মিনিট বাকি! ${tasksText}টাস্ক এখনো শেষ করোনি? ১২টা বাজলেই আজকের AURA ধুলোয় মিশে যাবে! জলদি টেবিলে বসো! 😼`,
            icon,
            image: icon,
            badge: getAbsoluteUrl('/icons/badge-cyber-cat.png'),
            tag: 'must-1140-sw',
            renotify: true,
            data: { url: '/?tab=routine' },
          });
        }
        // Evening 8 PM to 10 PM Alert
        else if (hour >= 20 && hour < 22) {
          const icon = getAbsoluteUrl('/mascot/cyber-cat-exhausted.png');
          await self.registration.showNotification('পড়ার টেবিলে যাওয়ার সময় হয়ে গেছে! 📚', {
            body: 'আজকের মিশন কি শেষ হয়েছে? একটু সময় বের করে আজকের চ্যাপ্টারের এমসিকিউ সলভ করে ফেলো!',
            icon,
            image: icon,
            badge: getAbsoluteUrl('/icons/badge-cyber-cat.png'),
            tag: 'evening-8pm-sw',
            renotify: true,
            data: { url: '/?tab=routine' },
          });
        }
      })()
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const icon = getAbsoluteUrl(data.icon || '/mascot/cyber-cat-sassy.png');
    const image = getAbsoluteUrl(data.image || icon);
    event.waitUntil(
      self.registration.showNotification(data.title || 'ভার্সিটি অ্যাডমিশন রুটিন', {
        body: data.body || 'আজকের মিশন সম্পূর্ণ করুন!',
        icon,
        image,
        badge: getAbsoluteUrl('/icons/badge-cyber-cat.png'),
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

// Foreground/background interval check
let sent1140Today = false;
setInterval(() => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  if (h === 23 && m >= 40 && m <= 58 && !sent1140Today) {
    sent1140Today = true;
    self.registration.showNotification('রাত ১১টা ৪০ বাজার আলটিমেটাম! 🕛⏰', {
      body: 'রাত ১২টা বাজতে আর মাত্র ২০ মিনিট বাকি! আজকের টাস্ক এখনো শেষ করোনি? ১২টা বাজলেই আজকের AURA ধুলোয় মিশে যাবে! জলদি টেবিলে বসো! 😼',
      icon: '/mascot/cyber-cat-panic.png',
      image: '/mascot/cyber-cat-panic.png',
      badge: '/icons/badge-cyber-cat.png',
      tag: 'must-1140-sw',
      renotify: true,
      data: { url: '/?tab=routine' },
    });
  }
}, 8000);
