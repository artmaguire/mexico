import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const dayId = Number(body.day_id);
	const name = typeof body.name === 'string' ? body.name.trim() : '';
	const meal = typeof body.meal === 'string' ? body.meal.trim() : '';
	if (!Number.isInteger(dayId)) throw error(400, 'day_id is required');
	if (!name) throw error(400, 'name is required');
	if (!meal) throw error(400, 'meal is required');
	const db = getDb();
	const day = db.prepare('SELECT id FROM days WHERE id = ?').get(dayId);
	if (!day) throw error(404, 'Day not found');
	const nextOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM restaurants WHERE day_id = ?').get(dayId) as { n: number };
	const rating = body.rating === null || body.rating === undefined || body.rating === '' ? null : Number(body.rating);
	const result = db.prepare(
		`INSERT INTO restaurants (day_id, meal, name, description, rating, price_range, maps_query, is_alt, is_user_added, sort_order)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	).run(dayId, meal, name, body.description ?? '', Number.isFinite(rating as number) ? rating : null, body.price_range ?? '', body.maps_query ?? '', body.is_alt ? 1 : 0, body.is_user_added ? 1 : 0, nextOrder.n);
	return json(db.prepare('SELECT * FROM restaurants WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
};
