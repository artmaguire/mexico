/// <reference lib="webworker" />
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

// Bumped to v3 — this MUST change whenever caching rules change, so the
// activate handler purges older caches. v1 poisoned itself by caching the
// unauthenticated 303 redirect for "/", which then got served after login
// and bounced the user straight back to the gate.
const CACHE_NAME = 'mexico-trip-v3';

// Only pre-cache things that are safe and not behind the auth gate.
// Never pre-cache app routes: when the service worker installs the user may
// be unauthenticated, so those requests return redirects to /login, and a
// cached redirect is indistinguishable from a cached page later on.
const PRECACHE_URLS = ['/manifest.json'];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
	);
	sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
			.then(() => sw.clients.claim())
	);
});

// Let the page tell a waiting worker to take over immediately, so a browser
// holding a poisoned older cache doesn't have to be manually cleared.
sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') sw.skipWaiting();
});

/**
 * Only a genuine, final, successful response is safe to cache.
 * A redirected response is how an auth bounce shows up here, and caching it
 * would make the gate appear permanently stuck.
 */
function isCacheable(response) {
	return response.ok && response.status === 200 && !response.redirected && response.type === 'basic';
}

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Never touch anything but GET — and never cache auth or API traffic.
	if (request.method !== 'GET') return;
	if (url.pathname.startsWith('/api/')) return;
	if (url.pathname === '/login') return;

	// Hashed, immutable build assets: cache-first, they never change content.
	if (url.pathname.startsWith('/_app/immutable/')) {
		event.respondWith(
			caches.match(request).then(
				(hit) =>
					hit ||
					fetch(request).then((response) => {
						if (isCacheable(response)) {
							const clone = response.clone();
							caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
						}
						return response;
					})
			)
		);
		return;
	}

	// Page navigations: always prefer the network so auth state is correct.
	// Only fall back to cache when genuinely offline, and only to a real
	// cached page — never to a redirect.
	event.respondWith(
		fetch(request)
			.then((response) => {
				if (isCacheable(response)) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
				}
				return response;
			})
			.catch(async () => {
				const hit = await caches.match(request);
				if (hit) return hit;
				return new Response('Offline — reconnect to load this page.', {
					status: 503,
					headers: { 'Content-Type': 'text/plain' }
				});
			})
	);
});
