import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const db = getDb();
	const restaurants = db.prepare(`
		SELECT r.*, d.date, d.title as day_title, d.id as day_num
		FROM restaurants r
		JOIN days d ON r.day_id = d.id
		WHERE r.maps_query != ''
		ORDER BY d.id, r.sort_order
	`).all();
	return json(restaurants);
};
