import { json, error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) {
		throw error(400, 'Invalid todo id');
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (typeof body.checked !== 'boolean') {
		throw error(400, 'checked (boolean) is required');
	}

	const db = getDb();

	const existing = db.prepare('SELECT id FROM todos WHERE id = ?').get(id);
	if (!existing) {
		throw error(404, 'Todo not found');
	}

	db.prepare('UPDATE todos SET checked = ? WHERE id = ?').run(body.checked ? 1 : 0, id);

	const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
	return json(updated);
};
