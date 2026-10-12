import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json(getDb().prepare('SELECT * FROM budget_items ORDER BY category, id').all());
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const description = typeof body.description === 'string' ? body.description.trim() : '';
	if (!description) throw error(400, 'description is required');
	const db = getDb();
	const result = db.prepare(
		`INSERT INTO budget_items (day_id, category, description, estimated_cost, actual_cost, currency, paid, notes)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	).run(
		body.day_id ?? null, body.category ?? 'misc', description,
		body.estimated_cost ?? 0, body.actual_cost ?? 0, body.currency ?? 'EUR',
		body.paid ? 1 : 0, body.notes ?? ''
	);
	return json(db.prepare('SELECT * FROM budget_items WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
};
