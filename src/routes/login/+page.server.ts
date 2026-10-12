import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const PASSWORD = (process.env.GATE_PASSWORD ?? 'cocobongo').toLowerCase().replace(/\s+/g, '');
const AUTH_COOKIE = 'mexico_auth';

export const load: PageServerLoad = async ({ cookies, url }) => {
	// Already authed? Skip the gate entirely rather than showing the form.
	if (cookies.get(AUTH_COOKIE) === 'authenticated') {
		throw redirect(303, url.searchParams.get('next') || '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const raw = form.get('password');
		const password = typeof raw === 'string' ? raw.trim().toLowerCase().replace(/\s+/g, '') : '';

		if (password !== PASSWORD) {
			return fail(401, { error: true });
		}

		// Only mark the cookie Secure on real HTTPS. On plain-HTTP LAN access
		// (e.g. http://192.168.0.119:5252) a Secure cookie is silently dropped
		// by the browser, which would leave the user stuck at the gate.
		// Honour a reverse proxy's forwarded proto too.
		const isHttps =
			url.protocol === 'https:' ||
			request.headers.get('x-forwarded-proto')?.split(',')[0].trim() === 'https';

		cookies.set(AUTH_COOKIE, 'authenticated', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: isHttps,
			maxAge: 60 * 60 * 24 * 90 // 90 days
		});

		throw redirect(303, url.searchParams.get('next') || '/');
	}
};
