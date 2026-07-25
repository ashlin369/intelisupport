const CACHE_NAME = 'intelisupport-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/?shortcut=sos',
  '/?shortcut=caregiver-crisis'
];

// Offline Fallback Data Cache for Critical Emergency Guides & Narcan Protocols
const OFFLINE_EMERGENCY_DATA = {
  narcanSteps: [
    { step: 1, title: 'Check Unresponsiveness', desc: 'Shout name and rub knuckles hard on center of chest (sternum rub).' },
    { step: 2, title: 'Call 911 Immediately', desc: 'Put phone on speaker. Tell operator: "Someone is unresponsive and not breathing."' },
    { step: 3, title: 'Administer Naloxone (Narcan)', desc: 'Peel back package. Insert nozzle firmly into one nostril. Press plunger firmly until it clicks.' },
    { step: 4, title: 'Give Rescue Breathing & Position', desc: 'If not breathing, perform CPR/Rescue Breathing. Turn person onto their side in recovery position.' }
  ],
  hotlines: [
    { name: '988 Suicide & Crisis Lifeline', number: '988', text: 'Call or Text 24/7 Free & Confidential' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', text: 'Treatment Referral & Information' },
    { name: 'Poison Control Center', number: '1-800-222-1222', text: 'Immediate Medical Guidance' }
  ],
  deescalationOfflineScript: "Take a deep breath together. Speak in a low, quiet, calm tone. Lower your shoulders. Say: 'I am right here with you. You are safe. We will get through this step by step.'"
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[InteliSupport SW] Pre-caching offline crisis shell');
      return cache.addAll(OFFLINE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[InteliSupport SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate for navigate/page requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Cache first with network fallback for assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Cache valid HTTP responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Fallback for API data or offline static requests
        if (event.request.url.includes('/api/offline-data')) {
          return new Response(JSON.stringify(OFFLINE_EMERGENCY_DATA), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      });
    })
  );
});
