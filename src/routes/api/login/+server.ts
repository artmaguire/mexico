import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const PASSWORD = (process.env.GATE_PASSWORD ?? 'bongo loco').toLowerCase();

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();
	const password = typeof body.password === 'string' ? body.password.trim().toLowerCase() : '';

	if (password !== PASSWORD) {
		throw error(401, 'Wrong password');
	}

	cookies.set('mexico_auth', 'authenticated', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 90 // 90 days
	});

	return json({ ok: true });
};
