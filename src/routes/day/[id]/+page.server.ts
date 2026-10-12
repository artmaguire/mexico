import { error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import type { Day, Restaurant, Todo, Ticket, Accommodation } from '#lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(404, 'Day not found');
	const db = getDb();
	const day = db.prepare('SELECT * FROM days WHERE id = ?').get(id) as Day | undefined;
	if (!day) throw error(404, 'Day not found');

	// Restaurants: user-added first, then recommended
	const restaurants = db
		.prepare('SELECT * FROM restaurants WHERE day_id = ? ORDER BY is_user_added DESC, sort_order, id')
		.all(id) as Restaurant[];
	const todos = db.prepare('SELECT * FROM todos WHERE day_id = ? ORDER BY sort_order, id').all(id) as Todo[];
	const tickets = db.prepare('SELECT * FROM tickets WHERE day_id = ? ORDER BY sort_order, id').all(id) as Ticket[];

	// Find accommodation that covers this day
	const accommodation = db.prepare(`
		SELECT * FROM accommodations WHERE day_id = ? LIMIT 1
	`).get(id) as Accommodation | undefined;

	const prev = db.prepare('SELECT id FROM days WHERE id < ? ORDER BY id DESC LIMIT 1').get(id) as { id: number } | undefined;
	const next = db.prepare('SELECT id FROM days WHERE id > ? ORDER BY id ASC LIMIT 1').get(id) as { id: number } | undefined;

	return { day, restaurants, todos, tickets, accommodation: accommodation ?? null, prevId: prev?.id ?? null, nextId: next?.id ?? null };
};
