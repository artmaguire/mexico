// ⚠️ SCHEMA CHANGE REMINDER: Delete mexico-trip.db when schema changes so it reseeds.
import Database from 'better-sqlite3';
import { dev } from '$app/env';
import path from 'path';

const DB_PATH = dev ? 'mexico-trip.db' : path.join(process.env.DATA_DIR || '/data', 'mexico-trip.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
	if (!_db) {
		_db = new Database(DB_PATH);
		_db.pragma('journal_mode = WAL');
		_db.pragma('foreign_keys = ON');
		initSchema(_db);
	}
	return _db;
}

function initSchema(db: Database.Database) {
	db.exec(`
		CREATE TABLE IF NOT EXISTS days (
			id INTEGER PRIMARY KEY,
			date TEXT NOT NULL,
			title TEXT NOT NULL,
			base TEXT NOT NULL,
			plan TEXT NOT NULL,
			header_color TEXT NOT NULL DEFAULT 'ocean',
			notes TEXT DEFAULT ''
		);

		CREATE TABLE IF NOT EXISTS restaurants (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			day_id INTEGER NOT NULL,
			meal TEXT NOT NULL,
			name TEXT NOT NULL,
			description TEXT DEFAULT '',
			rating REAL,
			price_range TEXT DEFAULT '',
			maps_query TEXT DEFAULT '',
			is_alt INTEGER DEFAULT 0,
			is_user_added INTEGER DEFAULT 0,
			sort_order INTEGER DEFAULT 0,
			FOREIGN KEY (day_id) REFERENCES days(id)
		);

		CREATE TABLE IF NOT EXISTS todos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			day_id INTEGER,
			section TEXT DEFAULT 'day',
			text TEXT NOT NULL,
			checked INTEGER DEFAULT 0,
			sort_order INTEGER DEFAULT 0,
			FOREIGN KEY (day_id) REFERENCES days(id)
		);

		CREATE TABLE IF NOT EXISTS tickets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			day_id INTEGER,
			type TEXT NOT NULL,
			title TEXT NOT NULL,
			details TEXT DEFAULT '',
			confirmation_ref TEXT DEFAULT '',
			cost TEXT DEFAULT '',
			time TEXT DEFAULT '',
			file_path TEXT DEFAULT '',
			link TEXT DEFAULT '',
			price_eur REAL DEFAULT 0,
			sort_order INTEGER DEFAULT 0,
			FOREIGN KEY (day_id) REFERENCES days(id)
		);

		CREATE TABLE IF NOT EXISTS accommodations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			day_id INTEGER,
			name TEXT NOT NULL,
			location TEXT NOT NULL,
			booking_link TEXT DEFAULT '',
			check_in TEXT NOT NULL,
			check_out TEXT NOT NULL,
			confirmation_ref TEXT DEFAULT '',
			cost_per_night TEXT DEFAULT '',
			notes TEXT DEFAULT '',
			maps_query TEXT DEFAULT '',
			FOREIGN KEY (day_id) REFERENCES days(id)
		);

		CREATE TABLE IF NOT EXISTS packing_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			text TEXT NOT NULL,
			checked INTEGER DEFAULT 0,
			category TEXT DEFAULT 'general',
			sort_order INTEGER DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS budget_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			day_id INTEGER,
			category TEXT NOT NULL,
			description TEXT NOT NULL,
			estimated_cost REAL DEFAULT 0,
			actual_cost REAL DEFAULT 0,
			currency TEXT DEFAULT 'EUR',
			paid INTEGER DEFAULT 0,
			notes TEXT DEFAULT '',
			FOREIGN KEY (day_id) REFERENCES days(id)
		);
	`);

	// Seed only if empty
	const count = db.prepare('SELECT COUNT(*) as c FROM days').get() as { c: number };
	if (count.c === 0) {
		seedData(db);
	}
}

function seedData(db: Database.Database) {
	const insertDay = db.prepare('INSERT INTO days (id, date, title, base, plan, header_color) VALUES (?, ?, ?, ?, ?, ?)');
	const insertRestaurant = db.prepare('INSERT INTO restaurants (day_id, meal, name, description, rating, price_range, maps_query, is_alt, is_user_added, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
	const insertTodo = db.prepare('INSERT INTO todos (day_id, section, text, sort_order) VALUES (?, ?, ?, ?)');
	const insertPacking = db.prepare('INSERT INTO packing_items (text, category, sort_order) VALUES (?, ?, ?)');
	const insertTicket = db.prepare('INSERT INTO tickets (day_id, type, title, details, cost, time, link, price_eur, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
	const insertAccom = db.prepare('INSERT INTO accommodations (day_id, name, location, booking_link, check_in, check_out, confirmation_ref, cost_per_night, notes, maps_query) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

	const seed = db.transaction(() => {
		// Days
		insertDay.run(1, '2026-11-03', 'Arrival, Cancún', 'Cancún Centro', 'Land 8pm at Cancún airport. ADO airport bus → downtown (~€5 pp) or taxi (~€20–25). Check into Centro stay. Eat, sleep, acclimatise.', 'ocean');
		insertDay.run(2, '2026-11-04', 'Isla Mujeres Day Trip', 'Cancún Centro', 'R1 bus to Gran Puerto ferry terminal. Ultramar ferry to Isla Mujeres (~15 min). Morning at Playa Norte. Lunch in town. Afternoon golf cart tour: Punta Sur, Playa Lancheros, colourful streets. Ferry back ~5pm.', 'ocean');
		insertDay.run(3, '2026-11-05', 'Chichén Itzá Day Trip', 'Cancún Centro', 'Day trip from Cancún. Option A: organised tour (~€50–70 pp). Option B: DIY ADO bus (~3 hrs). Visit ruins early to beat heat. Optional detour to Valladolid. Back to Centro, pack for Holbox.', 'ocean');
		insertDay.run(4, '2026-11-06', 'Cancún → Holbox', 'Holbox', 'Morning ADO bus Cancún → Chiquilá (~3–3.5 hrs, ~€20–26 pp). Ferry to Holbox (~30 min, ~€11 pp). Check in, grab bikes. Sunset on the beach.', 'palm');
		insertDay.run(5, '2026-11-07', 'Holbox (full day)', 'Holbox', 'Beach day. Walk to Punta Mosquito sandbar at low tide (flamingos). Relax — hammocks, reading, swimming. Optional bioluminescence tour (~€25–35 pp).', 'palm');
		insertDay.run(6, '2026-11-08', 'Holbox (extra day)', 'Holbox', 'A second slow day on the island — no rush to leave. Hit whatever you missed first time: Punta Mosquito if the tide was wrong, more beach time, a different stretch of sand. Or just do nothing again, properly.', 'palm');
		insertDay.run(7, '2026-11-09', 'Holbox → Cancún Hotel Zone', 'Cancún Hotel Zone', 'Morning ferry back to Chiquilá, then ADO bus to Cancún (~3–3.5 hrs). Check into a Hotel Zone stay for one night — proper beach, pool, easy access for tomorrow\'s transfer up to Puerto/Playa Mujeres. Evening: explore Blvd Kukulcán, dinner somewhere decent.', 'pink');
		insertDay.run(8, '2026-11-10', 'Hotel Zone → Resort (Puerto/Playa Mujeres)', 'All-inclusive Resort', 'Relaxed morning in the Hotel Zone. Taxi/transfer north to the resort in Puerto/Playa Mujeres (~30–40 min depending on exact location). 3pm check-in. Wedding festivities begin! 🎉', 'sunset');

		// Restaurants — Day 1
		insertRestaurant.run(1, 'Dinner', 'Tacos Rigo', 'Al pastor street tacos', 4.5, '€1.50–3 pp', 'Tacos Rigo Cancún Centro', 0, 0, 1);

		// Restaurants — Day 2
		insertRestaurant.run(2, 'Lunch', 'Mango Café', 'Mexican brunch all day, chilaquiles, pork tacos', 4.6, '€6–10 pp', 'Mango Café Isla Mujeres', 0, 0, 1);
		insertRestaurant.run(2, 'Lunch', 'Lola Valentina', 'Mexican grill, chicken & pork, rooftop', 4.5, '€8–14 pp', 'Lola Valentina Isla Mujeres', 1, 0, 2);
		insertRestaurant.run(2, 'Dinner', 'El Pocito', 'Cochinita pibil tacos & salbutes', 4.6, '€5–8 pp', 'El Pocito Cancún', 0, 0, 3);
		insertRestaurant.run(2, 'Dinner', 'Taquería El Ángel', 'No-frills tacos al pastor', 4.4, '€2–4 pp', 'Taquería El Ángel Cancún', 1, 0, 4);

		// Restaurants — Day 3
		insertRestaurant.run(3, 'Lunch', 'La Casona de Valladolid', 'Yucatecan classics in a courtyard', 4.5, '€6–10 pp', 'La Casona de Valladolid Mexico', 0, 0, 1);
		insertRestaurant.run(3, 'Lunch', 'Bazar Municipal', 'Food court — panuchos, salbutes, poc chuc', null, '€2–5 pp', 'Bazar Municipal Valladolid', 1, 0, 2);
		insertRestaurant.run(3, 'Dinner', 'Tacos Rigo', 'Al pastor street tacos', 4.5, '€1.50–3 pp', 'Tacos Rigo Cancún Centro', 0, 0, 3);

		// Restaurants — Day 4
		insertRestaurant.run(4, 'Dinner', 'Taquería El Chapulín', 'Tacos al pastor & cochinita', 4.5, '€2–5 pp', 'Taquería El Chapulín Holbox', 0, 0, 1);
		insertRestaurant.run(4, 'Dinner', 'Mandarina', 'Wood-fired pizzas & Mexican grill', 4.4, '€8–14 pp', 'Mandarina Holbox', 1, 0, 2);

		// Restaurants — Day 5
		insertRestaurant.run(5, 'Lunch', 'Taquería El Chapulín', 'Cochinita pibil, al pastor, salbutes', 4.5, '€2–4 pp', 'Taquería El Chapulín Holbox', 0, 0, 1);
		insertRestaurant.run(5, 'Dinner', 'Mandarina', 'Wood-fired pizzas & grilled meats', 4.4, '€8–14 pp', 'Mandarina Holbox', 0, 0, 2);
		insertRestaurant.run(5, 'Dinner', 'Barba Negra', 'Non-seafood pizzas & grilled chicken', 4.5, '€10–18 pp', 'Barba Negra Holbox', 1, 0, 3);

		// Restaurants — Day 6 (extra Holbox day — different spots to the first two days)
		insertRestaurant.run(6, 'Lunch', 'Pizzería Edelyn', 'Local, cheap, generous wood-fired pizzas', 4.5, '€6–10 pp', 'Pizzeria Edelyn Holbox', 0, 0, 1);
		insertRestaurant.run(6, 'Dinner', 'Casa de las Quintas', 'Grilled meats & Mexican classics, garden setting', 4.4, '€10–16 pp', 'Casa de las Quintas Holbox', 0, 0, 2);

		// Restaurants — Day 7 (Hotel Zone, Cancún)
		insertRestaurant.run(7, 'Lunch', 'La Parrilla', 'Classic Mexican grill, mariachi some nights, big portions', 4.3, '€10–18 pp', 'La Parrilla Cancún Hotel Zone', 0, 0, 1);
		insertRestaurant.run(7, 'Lunch', 'El Fish Fritanga', 'Casual beachfront grill — ask for chicken/beef options', 4.2, '€8–14 pp', 'Fish Fritanga Cancún Hotel Zone', 1, 0, 2);
		insertRestaurant.run(7, 'Dinner', 'La Habichuela Sunset', 'Elevated Mexican/Caribbean, lagoon-view terrace', 4.5, '€18–28 pp', 'La Habichuela Sunset Cancún', 0, 0, 3);
		insertRestaurant.run(7, 'Dinner', 'Porfirio\'s Cancún', 'Upscale Mexican, lively atmosphere, great for a treat night', 4.4, '€20–30 pp', 'Porfirios Cancún', 1, 0, 4);

		// Accommodations
		insertAccom.run(1, 'TBC — Cancún Centro', 'Cancún Centro, SM22-24 near Parque de las Palapas', '', '2026-11-03', '2026-11-05', '', '~€30', 'Book near Palapas park', 'Parque de las Palapas Cancún');
		insertAccom.run(4, 'TBC — Holbox', 'Isla Holbox', '', '2026-11-06', '2026-11-09', '', '~€40', 'Bring cash, patchy cards. Now 3 nights.', 'Holbox island Mexico');
		insertAccom.run(7, 'TBC — Cancún Hotel Zone', 'Zona Hotelera, Blvd Kukulcán, Cancún', '', '2026-11-09', '2026-11-10', '', '~€70', 'One night only — pick something with beach access for the evening', 'Cancun Hotel Zone');

		// Todos — Day 1
		insertTodo.run(1, 'day', 'Book Cancún Centro accommodation (3 nights: 3rd, 4th, 5th)', 1);
		insertTodo.run(1, 'day', 'Note ADO airport bus schedule / stop', 2);
		insertTodo.run(1, 'day', 'Withdraw pesos at bank ATM in arrivals', 3);

		// Todos — Day 2
		insertTodo.run(2, 'day', 'No need to pre-book ferry — just turn up (Ultramar)', 1);
		insertTodo.run(2, 'day', 'Bring: sun cream, swimwear, towel, cash', 2);
		insertTodo.run(2, 'day', 'Set alarm — Chichén Itzá tomorrow', 3);

		// Todos — Day 3
		insertTodo.run(3, 'day', 'Book day-trip tour OR ADO bus times', 1);
		insertTodo.run(3, 'day', 'Bring: hat, 1L+ water, sun cream, comfy shoes', 2);
		insertTodo.run(3, 'day', 'Pack bag for Holbox (pack light!)', 3);

		// Todos — Day 4
		insertTodo.run(4, 'day', 'Book ADO Cancún → Chiquilá (morning departure)', 1);
		insertTodo.run(4, 'day', 'Confirm Holbox accommodation (3 nights: 6th, 7th & 8th)', 2);
		insertTodo.run(4, 'day', 'Bring enough pesos — patchy card acceptance', 3);

		// Todos — Day 5
		insertTodo.run(5, 'day', 'Check tide times for Punta Mosquito', 1);
		insertTodo.run(5, 'day', 'Rent bikes or use golf-cart taxis', 2);
		insertTodo.run(5, 'day', 'Ask about bioluminescence tour', 3);

		// Todos — Day 6
		insertTodo.run(6, 'day', 'No fixed plan — see what you missed on days 4–5', 1);
		insertTodo.run(6, 'day', 'Check out alternative beach spots away from the main strip', 2);
		insertTodo.run(6, 'day', 'Pack tonight — ferry + bus tomorrow back to Cancún', 3);

		// Todos — Day 7
		insertTodo.run(7, 'day', 'Book ADO Chiquilá → Cancún (morning ferry + bus)', 1);
		insertTodo.run(7, 'day', 'Book Hotel Zone accommodation (1 night: 9th)', 2);
		insertTodo.run(7, 'day', 'Confirm resort transfer pickup point/time for tomorrow', 3);
		insertTodo.run(7, 'day', 'Pack wedding outfit accessible — resort tomorrow', 4);

		// Todos — Day 8
		insertTodo.run(8, 'day', 'Confirm transfer/taxi to Puerto/Playa Mujeres resort', 1);
		insertTodo.run(8, 'day', 'Resort booking ref + check-in details to hand', 2);
		insertTodo.run(8, 'day', 'Wedding outfit accessible in bag', 3);
		insertTodo.run(8, 'day', 'Confirm flight + airport transfer (14 Nov)', 4);

		// Tickets
		insertTicket.run(1, 'flight', 'Flight → Cancún', 'Arriving 8pm CUN airport', '', '8:00 PM', '', 0, 1);
		insertTicket.run(2, 'ferry', 'Ultramar Ferry (return)', 'Gran Puerto → Isla Mujeres', '€12–15 pp return', '9:30 AM', '', 28, 1);
		insertTicket.run(3, 'tour', 'Chichén Itzá Day Trip', 'Organised tour or DIY ADO', '€50–70 pp', '7:00 AM', '', 130, 1);
		insertTicket.run(4, 'bus', 'ADO Cancún → Chiquilá', 'Bus + ferry to Holbox', '€20–26 pp', 'Morning', '', 48, 1);
		insertTicket.run(4, 'ferry', 'Ferry Chiquilá → Holbox', '~30 min crossing', '€11 pp each way', '', '', 22, 2);
		insertTicket.run(7, 'ferry', 'Ferry Holbox → Chiquilá', 'Morning departure', '€11 pp', '8–9 AM', '', 22, 1);
		insertTicket.run(7, 'bus', 'ADO Chiquilá → Cancún', 'Back to the Hotel Zone', '€20–26 pp', '', '', 48, 2);
		insertTicket.run(8, 'transfer', 'Resort transfer', 'Hotel Zone → Puerto/Playa Mujeres resort', '€25–35', '~12:00 PM', '', 30, 1);
		insertTicket.run(8, 'flight', 'Flight home', 'Fri 14 Nov departure', '', 'TBC', '', 0, 2);

		const insertBudget = db.prepare('INSERT INTO budget_items (day_id, category, description, estimated_cost, currency, notes) VALUES (?, ?, ?, ?, ?, ?)');

		// Budget — estimated costs (for 2 people, in EUR, late-booking prices)
		// Transport
		insertBudget.run(1, 'transport', 'Airport bus/taxi to Centro', 20, 'EUR', 'Taxi more likely at 8pm');
		insertBudget.run(2, 'transport', 'R1 bus to ferry (return ×2)', 3, 'EUR', '');
		insertBudget.run(2, 'transport', 'Ultramar ferry return ×2', 32, 'EUR', '~€14-16 pp return');
		insertBudget.run(2, 'activity', 'Golf cart Isla Mujeres', 45, 'EUR', 'Nov high season');
		insertBudget.run(2, 'activity', 'Punta Sur entry ×2', 8, 'EUR', '');
		insertBudget.run(3, 'transport', 'Chichén Itzá tour ×2', 140, 'EUR', '~€60-75 pp, late booking premium');
		insertBudget.run(4, 'transport', 'ADO Cancún→Chiquilá ×2', 52, 'EUR', '~€24-28 pp');
		insertBudget.run(4, 'transport', 'Ferry to Holbox ×2', 24, 'EUR', '~€12 pp');
		insertBudget.run(7, 'transport', 'Ferry Holbox→Chiquilá ×2', 24, 'EUR', '~€12 pp');
		insertBudget.run(7, 'transport', 'ADO Chiquilá→Cancún ×2', 52, 'EUR', '~€24-28 pp');
		insertBudget.run(8, 'transport', 'Resort transfer (Hotel Zone→Puerto Mujeres)', 30, 'EUR', 'Taxi or shuttle for 2');
		// Food (daily totals for 2 — mix of street food + sit-down)
		insertBudget.run(1, 'food', 'Day 1 — arrival dinner', 12, 'EUR', 'Street tacos + drinks');
		insertBudget.run(2, 'food', 'Day 2 — island lunch + dinner', 40, 'EUR', 'Island prices higher');
		insertBudget.run(3, 'food', 'Day 3 — Valladolid + tacos', 30, 'EUR', 'Tour may include lunch');
		insertBudget.run(4, 'food', 'Day 4 — travel + Holbox dinner', 28, 'EUR', '');
		insertBudget.run(5, 'food', 'Day 5 — Holbox full day', 38, 'EUR', 'Island prices + treat dinner');
		insertBudget.run(6, 'food', 'Day 6 — Holbox extra day', 35, 'EUR', 'Island prices');
		insertBudget.run(7, 'food', 'Day 7 — travel + Hotel Zone dinner', 45, 'EUR', 'Hotel Zone prices are higher');
		insertBudget.run(8, 'food', 'Day 8 — breakfast before transfer', 15, 'EUR', 'Hotel Zone breakfast prices');
		// Accommodation (total for 2, late-booking Nov prices)
		insertBudget.run(null, 'accommodation', 'Cancún Centro — 3 nights', 135, 'EUR', '~€45/night, late booking');
		insertBudget.run(null, 'accommodation', 'Holbox — 3 nights', 210, 'EUR', '~€70/night, island premium + late, now 3 nights');
		insertBudget.run(null, 'accommodation', 'Cancún Hotel Zone — 1 night', 90, 'EUR', '~€90/night, beachfront premium');
		// Misc
		insertBudget.run(null, 'misc', 'Travel insurance', 60, 'EUR', 'Late purchase premium');
		insertBudget.run(null, 'misc', 'Travel eSIM ×2', 20, 'EUR', 'Airalo/Holafly ~€10 pp for 7 days');
		insertBudget.run(null, 'misc', 'ATM withdrawal fees', 15, 'EUR', '3-4 withdrawals');
		insertBudget.run(null, 'misc', 'Tips & sundries', 40, 'EUR', '');

		// Packing
		const packingItems = [
			['Passport (valid 6+ months)', 'documents', 1],
			['Travel insurance docs', 'documents', 2],
			['Flight tickets / booking refs', 'documents', 3],
			['Resort booking confirmation', 'documents', 4],
			['Biodegradable sun cream', 'essentials', 5],
			['SPF 50+ sun cream', 'essentials', 6],
			['Mosquito repellent', 'essentials', 7],
			['Quick-dry towel', 'essentials', 8],
			['Water shoes', 'essentials', 9],
			['Rain jacket / umbrella', 'clothing', 10],
			['Hat / cap', 'clothing', 11],
			['Swimwear (×2)', 'clothing', 12],
			['Light breathable clothes', 'clothing', 13],
			['Comfortable walking shoes', 'clothing', 14],
			['Wedding outfit', 'clothing', 15],
			['Cash belt / hidden pouch', 'essentials', 16],
			['Phone charger + adapter', 'tech', 17],
			['Power bank', 'tech', 18],
		] as const;
		for (const [text, category, order] of packingItems) {
			insertPacking.run(text, category, order);
		}
	});

	seed();
}
