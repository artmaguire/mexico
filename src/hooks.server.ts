import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const AUTH_COOKIE = 'mexico_auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Allow the login page through unauthenticated (GET to show it, POST to submit the form action)
	if (event.url.pathname === '/login') {
		return resolve(event);
	}

	// Allow static assets and service worker
	if (event.url.pathname.startsWith('/_app/') || event.url.pathname === '/sw.js' || event.url.pathname === '/manifest.json') {
		return resolve(event);
	}

	// Check auth cookie
	const auth = event.cookies.get(AUTH_COOKIE);
	if (auth !== 'authenticated') {
		throw redirect(303, '/login');
	}

	return resolve(event);
};
