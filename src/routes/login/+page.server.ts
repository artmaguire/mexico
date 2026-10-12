import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const PASSWORD = (process.env.GATE_PASSWORD ?? 'bongologo').toLowerCase().replace(/\s+/g, '');

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const raw = form.get('password');
		const password = typeof raw === 'string' ? raw.trim().toLowerCase().replace(/\s+/g, '') : '';

		if (password !== PASSWORD) {
			return fail(401, { error: true });
		}

		cookies.set('mexico_auth', 'authenticated', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 90 // 90 days
		});

		throw redirect(303, '/');
	}
};
