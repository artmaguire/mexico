import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');
	const body = await request.json();
	if (typeof body.checked !== 'boolean') throw error(400, 'checked (boolean) is required');
	const db = getDb();
	db.prepare('UPDATE packing_items SET checked = ? WHERE id = ?').run(body.checked ? 1 : 0, id);
	return json(db.prepare('SELECT * FROM packing_items WHERE id = ?').get(id));
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');
	getDb().prepare('DELETE FROM packing_items WHERE id = ?').run(id);
	return json({ ok: true });
};
