import { getDb } from '#lib/server/db';
import type { BudgetItem, Day } from '#lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const db = getDb();
	const items = db.prepare('SELECT * FROM budget_items ORDER BY category, id').all() as BudgetItem[];
	const days = db.prepare('SELECT id, title FROM days ORDER BY id').all() as Pick<Day, 'id' | 'title'>[];
	return { items, days };
};
