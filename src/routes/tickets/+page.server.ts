import { getDb } from '#lib/server/db';
import type { Day, Ticket, Accommodation } from '#lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const db = getDb();
	const days = db.prepare('SELECT id, date, title FROM days ORDER BY id').all() as Pick<Day, 'id' | 'date' | 'title'>[];
	const tickets = db.prepare('SELECT * FROM tickets ORDER BY day_id, sort_order, id').all() as Ticket[];
	const accommodations = db.prepare('SELECT * FROM accommodations ORDER BY check_in, id').all() as Accommodation[];
	return { days, tickets, accommodations };
};
