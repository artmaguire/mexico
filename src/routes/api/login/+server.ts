import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const PASSWORD = (process.env.GATE_PASSWORD ?? 'cocobongo').toLowerCase().replace(/\s+/g, '');
const AUTH_COOKIE = 'mexico_auth';

/**
 * Login via JSON POST rather than a form action, deliberately.
 *
 * SvelteKit's CSRF protection only rejects requests whose content type is a
 * *form* type (urlencoded / multipart). A JSON body skips that check, so this
 * endpoint works no matter what host, IP or port the app is reached on —
 * nothing has to be configured to match the deployment address.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	let password = '';
	try {
		const body = await request.json();
		password = typeof body?.password === 'string' ? body.password : '';
	} catch {
		return json({ ok: false, error: 'bad request' }, { status: 400 });
	}

	const normalised = password.trim().toLowerCase().replace(/\s+/g, '');
	if (normalised !== PASSWORD) {
		return json({ ok: false, error: 'wrong password' }, { status: 401 });
	}

	// Whether to mark the cookie Secure.
	//
	// Do NOT infer this from `url.protocol`: adapter-node reports "https:" even
	// when the connection is plain HTTP, so trusting it sets a Secure cookie
	// that the browser then silently discards — the login appears to succeed
	// but no cookie is stored and the user is bounced back to the gate forever.
	//
	// Instead: trust an explicit reverse-proxy header, or an explicit opt-in
	// via COOKIE_SECURE=true. Default to false, which is correct for plain-HTTP
	// LAN access and merely slightly less strict behind a TLS proxy.
	const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
	const isHttps = forwardedProto === 'https' || process.env.COOKIE_SECURE === 'true';

	cookies.set(AUTH_COOKIE, 'authenticated', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: isHttps,
		maxAge: 60 * 60 * 24 * 90 // 90 days
	});

	return json({ ok: true });
};
