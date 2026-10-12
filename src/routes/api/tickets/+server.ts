import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const title = typeof body.title === 'string' ? body.title.trim() : '';
	if (!title) throw error(400, 'title is required');
	const db = getDb();
	const result = db.prepare(
		`INSERT INTO tickets (day_id, type, title, details, confirmation_ref, cost, time, link, price_eur, sort_order)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	).run(
		body.day_id ?? null, body.type ?? 'other', title,
		body.details ?? '', body.confirmation_ref ?? '', body.cost ?? '',
		body.time ?? '', body.link ?? '', body.price_eur ?? 0, 0
	);
	return json(db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
};
