import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const AUTH_COOKIE = 'mexico_auth';
const PUBLIC_PATHS = ['/login', '/api/login'];

export const handle: Handle = async ({ event, resolve }) => {
	const p = event.url.pathname;

	// Chrome probes this on every page load when DevTools is open.
	if (p === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(null, { status: 204 });
	}

	const authed = event.cookies.get(AUTH_COOKIE) === 'authenticated';
	const isPublic = PUBLIC_PATHS.some((base) => p === base || p.startsWith(base + '/'));

	// Gate everything except the login page, SvelteKit internals and PWA assets.
	if (
		!authed &&
		!isPublic &&
		!p.startsWith('/_app') &&
		!p.startsWith('/favicon') &&
		p !== '/sw.js' &&
		p !== '/manifest.json'
	) {
		throw redirect(303, `/login?next=${encodeURIComponent(p)}`);
	}

	return resolve(event);
};
