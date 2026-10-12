import { getDb } from '#lib/server/db';
import type { Day } from '#lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const db = getDb();
	const days = db.prepare('SELECT * FROM days ORDER BY id').all() as Day[];
	const dayData = days.map((day) => {
		const todoCount = db
			.prepare('SELECT COUNT(*) as total, SUM(checked) as done FROM todos WHERE day_id = ?')
			.get(day.id) as { total: number; done: number };
		return { ...day, todoTotal: todoCount.total, todoDone: todoCount.done ?? 0 };
	});
	return { days: dayData };
};
