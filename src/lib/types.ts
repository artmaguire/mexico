export interface Day {
	id: number;
	date: string;
	title: string;
	base: string;
	plan: string;
	header_color: string;
	notes: string;
}

export interface Restaurant {
	id: number;
	day_id: number;
	meal: string;
	name: string;
	description: string;
	rating: number | null;
	price_range: string;
	maps_query: string;
	is_alt: number;
	is_user_added: number; // 1 = user added (shown first), 0 = recommended
	sort_order: number;
}

export interface Todo {
	id: number;
	day_id: number | null;
	section: string;
	text: string;
	checked: number;
	sort_order: number;
}

export interface Ticket {
	id: number;
	day_id: number | null;
	type: string;
	title: string;
	details: string;
	confirmation_ref: string;
	cost: string;
	time: string;
	file_path: string;
	link: string; // NEW: booking/info URL
	price_eur: number; // NEW: numeric price for auto-budget
	sort_order: number;
}

export interface Accommodation {
	id: number;
	day_id: number | null; // NEW: link to a day
	name: string;
	location: string;
	booking_link: string; // NEW: clickable booking URL
	check_in: string;
	check_out: string;
	confirmation_ref: string;
	cost_per_night: string;
	notes: string;
	maps_query: string;
}

export interface PackingItem {
	id: number;
	text: string;
	checked: number;
	category: string;
	sort_order: number;
}

export interface DayWithDetails extends Day {
	restaurants: Restaurant[];
	todos: Todo[];
}

export interface BudgetItem {
	id: number;
	day_id: number | null;
	category: string;
	description: string;
	estimated_cost: number;
	actual_cost: number;
	currency: string;
	paid: number;
	notes: string;
}
