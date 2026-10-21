/* 서비스 워커: 오프라인에서도 앱이 열리도록 파일을 저장해 둡니다.
   페이지(HTML)는 항상 네트워크를 먼저 시도하므로, 배포하면 바로 새 버전이 보입니다.
   저장할 파일 목록이 바뀌면 CACHE 이름의 숫자를 올립니다. */
const CACHE = 'lucky-lotto-v1';
const PRECACHE = [
  '/',
  '/about',
  '/privacy',
  '/page.css',
  '/page.js',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return; // 제휴 문의 폼 전송(POST)은 건드리지 않음
  const url = new URL(request.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;

  // 페이지: 네트워크 먼저, 오프라인이면 저장해 둔 페이지
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok && !response.redirected) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }).then(hit => hit || caches.match('/')))
    );
    return;
  }

  // 당첨번호 데이터: 추첨 직후에도 새 회차가 보이도록 네트워크 먼저, 오프라인이면 저장해 둔 것
  if (url.origin === self.location.origin && url.pathname.startsWith('/data/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }))
    );
    return;
  }

  // 나머지 파일·글꼴: 저장해 둔 것을 바로 쓰고, 뒤에서 새로 받아 둠
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response.ok || response.type === 'opaque') {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
