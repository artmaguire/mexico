import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const PASSWORD = (process.env.GATE_PASSWORD ?? 'cocobongo').toLowerCase().replace(/\s+/g, '');

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
		// by the browser — the login looks like it "succeeds" (302 redirect)
		// but the cookie never actually gets stored, so the next request has
		// no auth and bounces straight back to /login. Honour a reverse
		// proxy's forwarded proto too, in case one sits in front of this.
		const isHttps =
			url.protocol === 'https:' ||
			request.headers.get('x-forwarded-proto')?.split(',')[0].trim() === 'https';

		cookies.set('mexico_auth', 'authenticated', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: isHttps,
			maxAge: 60 * 60 * 24 * 90 // 90 days
		});

		throw redirect(303, '/');
	}
};
