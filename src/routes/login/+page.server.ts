import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const AUTH_COOKIE = 'mexico_auth';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const next = url.searchParams.get('next') || '/';

	// Already authed? Skip the gate rather than showing the form.
	if (cookies.get(AUTH_COOKIE) === 'authenticated') {
		throw redirect(303, next);
	}

	return { next };
};
