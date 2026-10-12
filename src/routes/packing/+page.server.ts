import { getDb } from '#lib/server/db';
import type { PackingItem } from '#lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const db = getDb();
	const items = db.prepare('SELECT * FROM packing_items ORDER BY sort_order, id').all() as PackingItem[];
	return { items };
};
