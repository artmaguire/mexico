import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const text = typeof body.text === 'string' ? body.text.trim() : '';
	if (!text) throw error(400, 'text is required');
	const db = getDb();
	const result = db.prepare('INSERT INTO todos (day_id, section, text, sort_order) VALUES (?, ?, ?, 999)').run(body.day_id ?? null, body.section ?? 'day', text);
	return json(db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
};
