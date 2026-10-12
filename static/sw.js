/// <reference lib="webworker" />
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const CACHE_NAME = 'mexico-trip-v1';

// Pages and assets to pre-cache on install
const PRECACHE_URLS = [
	'/',
	'/food',
	'/packing',
	'/tickets',
	'/budget',
	'/manifest.json'
];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
	);
	sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
		)
	);
	sw.clients.claim();
});

sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// API calls: network-first, fall back to cache
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					if (response.ok && event.request.method === 'GET') {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
					}
					return response;
				})
				.catch(() => caches.match(event.request).then((r) => r || new Response('{"error":"offline"}', { status: 503 })))
		);
		return;
	}

	// Pages and assets: network-first with cache fallback
	if (event.request.method === 'GET') {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
					return response;
				})
				.catch(() => caches.match(event.request).then((r) => r || caches.match('/')))
		);
		return;
	}

	// POST/PATCH/DELETE: try network, queue if offline
	event.respondWith(fetch(event.request));
});
