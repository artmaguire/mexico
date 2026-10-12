import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');
	const body = await request.json();
	const db = getDb();
	const existing = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(id);
	if (!existing) throw error(404, 'Restaurant not found');
	const fields: string[] = [];
	const values: unknown[] = [];
	for (const key of ['name', 'description', 'meal', 'price_range', 'maps_query', 'rating', 'is_alt'] as const) {
		if (body[key] !== undefined) {
			fields.push(`${key} = ?`);
			values.push(key === 'is_alt' ? (body[key] ? 1 : 0) : body[key]);
		}
	}
	if (fields.length > 0) {
		values.push(id);
		db.prepare(`UPDATE restaurants SET ${fields.join(', ')} WHERE id = ?`).run(...values);
	}
	return json(db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id));
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');
	const db = getDb();
	db.prepare('DELETE FROM restaurants WHERE id = ?').run(id);
	return json({ ok: true });
};
