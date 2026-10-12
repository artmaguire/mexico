import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');
	const body = await request.json();
	const db = getDb();
	const fields: string[] = [];
	const values: unknown[] = [];
	for (const key of ['name', 'location', 'check_in', 'check_out', 'confirmation_ref', 'cost_per_night', 'notes', 'maps_query'] as const) {
		if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]); }
	}
	if (fields.length > 0) { values.push(id); db.prepare(`UPDATE accommodations SET ${fields.join(', ')} WHERE id = ?`).run(...values); }
	return json(db.prepare('SELECT * FROM accommodations WHERE id = ?').get(id));
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');
	getDb().prepare('DELETE FROM accommodations WHERE id = ?').run(id);
	return json({ ok: true });
};
