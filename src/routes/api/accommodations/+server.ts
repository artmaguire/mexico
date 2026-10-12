import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json(getDb().prepare('SELECT * FROM accommodations ORDER BY check_in, id').all());
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const name = typeof body.name === 'string' ? body.name.trim() : '';
	if (!name) throw error(400, 'name is required');
	const db = getDb();
	const result = db.prepare(
		`INSERT INTO accommodations (day_id, name, location, booking_link, check_in, check_out, confirmation_ref, cost_per_night, notes, maps_query)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	).run(body.day_id ?? null, name, body.location ?? '', body.booking_link ?? '', body.check_in ?? '', body.check_out ?? '', body.confirmation_ref ?? '', body.cost_per_night ?? '', body.notes ?? '', body.maps_query ?? '');
	return json(db.prepare('SELECT * FROM accommodations WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
};
