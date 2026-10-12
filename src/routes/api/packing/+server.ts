import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const text = typeof body.text === 'string' ? body.text.trim() : '';
	if (!text) throw error(400, 'text is required');
	const db = getDb();
	const result = db.prepare('INSERT INTO packing_items (text, category, sort_order) VALUES (?, ?, 999)').run(text, body.category ?? 'general');
	return json(db.prepare('SELECT * FROM packing_items WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
};
