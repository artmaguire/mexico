import ExcelJS from 'exceljs';
import { getDb } from '#lib/server/db';
import type { RequestHandler } from './$types';

type Row = (string | number | null)[];

/** Location buckets, in trip order. Each becomes its own sheet tab.
 *  Order matters: Hotel Zone must be checked before the generic Cancún
 *  match, since "Cancún Hotel Zone" also contains the substring "Cancún". */
const LOCATIONS = [
	{ key: 'Cancún Centro', match: (base: string) => base.includes('Cancún Centro'), colour: 'FF0891B2' },
	{ key: 'Holbox', match: (base: string) => base.includes('Holbox'), colour: 'FF16A34A' },
	{ key: 'Hotel Zone', match: (base: string) => base.includes('Hotel Zone'), colour: 'FFEC4899' },
	{ key: 'Resort', match: (base: string) => /resort/i.test(base), colour: 'FFF59E0B' }
];

export const GET: RequestHandler = async ({ url }) => {
	const db = getDb();

	const days = db.prepare('SELECT * FROM days ORDER BY id').all() as any[];
	const todos = db.prepare(
		`SELECT t.*, d.title AS day_title, d.base FROM todos t
		 LEFT JOIN days d ON t.day_id = d.id
		 ORDER BY COALESCE(d.id, 999), t.sort_order`
	).all() as any[];
	const tickets = db.prepare(
		`SELECT t.*, d.title AS day_title, d.base FROM tickets t
		 LEFT JOIN days d ON t.day_id = d.id
		 ORDER BY COALESCE(d.id, 999), t.sort_order`
	).all() as any[];
	const accommodations = db.prepare('SELECT * FROM accommodations ORDER BY check_in').all() as any[];
	const budget = db.prepare(
		`SELECT b.*, d.title AS day_title FROM budget_items b
		 LEFT JOIN days d ON b.day_id = d.id
		 ORDER BY b.category, b.id`
	).all() as any[];

	// JSON is a backup format only — Sheets can't import it.
	if (url.searchParams.get('format') === 'json') {
		return new Response(
			JSON.stringify({ days, todos, tickets, accommodations, budget }, null, 2),
			{
				headers: {
					'Content-Type': 'application/json',
					'Content-Disposition': 'attachment; filename="mexico-trip-2026-backup.json"'
				}
			}
		);
	}

	const wb = new ExcelJS.Workbook();
	wb.creator = 'Mexico Trip 2026';
	wb.created = new Date();

	function addSheet(name: string, tabColour: string) {
		return wb.addWorksheet(name, {
			properties: { tabColor: { argb: tabColour } },
			views: [{ state: 'frozen', ySplit: 1 }]
		});
	}

	/** Bold coloured section label, header row, then data. Skipped when empty. */
	function writeBlock(ws: ExcelJS.Worksheet, label: string, headers: string[], rows: Row[], colour: string) {
		if (rows.length === 0) return;

		const labelRow = ws.addRow([label]);
		labelRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
		labelRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colour } };
		if (headers.length > 1) {
			ws.mergeCells(labelRow.number, 1, labelRow.number, headers.length);
		}

		const headerRow = ws.addRow(headers);
		headerRow.font = { bold: true };
		headerRow.eachCell((cell) => {
			cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
			cell.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
		});

		for (const r of rows) {
			const row = ws.addRow(r);
			row.alignment = { vertical: 'top', wrapText: false };
		}
		ws.addRow([]);
	}

	/** Size columns to content, clamped so long plan text doesn't blow out the sheet. */
	function autoFit(ws: ExcelJS.Worksheet, max = 55) {
		ws.columns.forEach((col) => {
			let width = 10;
			col.eachCell?.({ includeEmpty: false }, (cell) => {
				const v = cell.value;
				const text =
					v && typeof v === 'object' && 'text' in v
						? String((v as any).text)
						: String(v ?? '');
				if (text.length > width) width = text.length;
			});
			col.width = Math.min(width + 2, max);
		});
	}

	function linkCell(urlStr: string, text: string) {
		if (!urlStr) return '';
		return { text, hyperlink: urlStr } as unknown as string;
	}

	function mapsLink(query: string) {
		if (!query) return '';
		return linkCell(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, 'Map');
	}

	const estTotal = budget.reduce((s, b) => s + b.estimated_cost, 0);

	// ---------- Overview (created first so it's the leftmost tab) ----------
	{
		const ws = addSheet('Overview', 'FF1E293B');
		ws.addRow(['Mexico Trip 2026 · Cancún & Yucatán']).font = { bold: true, size: 16 };
		ws.addRow(['3–14 November 2026 · Wedding 10–14 Nov']).font = { color: { argb: 'FF64748B' } };
		ws.addRow([`Exported ${new Date().toISOString().slice(0, 10)}`]).font = {
			color: { argb: 'FF94A3B8' },
			size: 10
		};
		ws.addRow([]);

		writeBlock(
			ws,
			'FULL ITINERARY',
			['Day', 'Date', 'Title', 'Base'],
			days.map((d) => [`Day ${d.id}`, d.date, d.title, d.base]),
			'FF1E293B'
		);

		writeBlock(
			ws,
			'SUMMARY',
			['Metric', 'Value'],
			[
				['Days before wedding', days.length],
				['Accommodation entries', accommodations.length],
				['Transport legs', tickets.length],
				['Estimated total (2 people)', estTotal],
				['Estimated per person', Math.round(estTotal / 2)]
			],
			'FF1E293B'
		);

		writeBlock(
			ws,
			'TABS IN THIS WORKBOOK',
			['Tab', 'Contains'],
			[
				['Cancún Centro', 'Accommodation, transport, itinerary, to-dos'],
				['Holbox', 'Accommodation, transport, itinerary, to-dos'],
				['Hotel Zone', 'Accommodation, transport, itinerary, to-dos'],
				['Resort', 'Transport and itinerary for the wedding transfer'],
				['Budget', 'Spend by category, estimated vs actual, with live totals']
			],
			'FF1E293B'
		);

		autoFit(ws);
	}

	// ---------- One sheet per location ----------
	for (const loc of LOCATIONS) {
		const locDays = days.filter((d) => loc.match(d.base));
		if (locDays.length === 0) continue;
		const dayIds = new Set(locDays.map((d) => d.id));
		const ws = addSheet(loc.key, loc.colour);

		const lo = Math.min(...locDays.map((d) => d.id));
		const hi = Math.max(...locDays.map((d) => d.id));
		ws.addRow([`${loc.key} · ${lo === hi ? `Day ${lo}` : `Days ${lo}–${hi}`}`]).font = {
			bold: true,
			size: 14
		};
		ws.addRow([]);

		writeBlock(
			ws,
			'ACCOMMODATION',
			['Name', 'Location', 'Check-in', 'Check-out', 'Cost/night', 'Booking', 'Map', 'Ref', 'Notes'],
			accommodations
				.filter((a) => a.day_id && dayIds.has(a.day_id))
				.map((a) => [
					a.name,
					a.location,
					a.check_in,
					a.check_out,
					a.cost_per_night,
					linkCell(a.booking_link, 'Booking'),
					mapsLink(a.maps_query),
					a.confirmation_ref,
					a.notes
				]),
			loc.colour
		);

		writeBlock(
			ws,
			'TRANSPORT',
			['Day', 'Type', 'Title', 'Time', 'Cost', 'Booking', 'Ref'],
			tickets
				.filter((t) => dayIds.has(t.day_id))
				.map((t) => [
					`Day ${t.day_id}`,
					t.type,
					t.title,
					t.time,
					t.cost,
					linkCell(t.link, 'Booking'),
					t.confirmation_ref
				]),
			loc.colour
		);

		writeBlock(
			ws,
			'ITINERARY',
			['Day', 'Date', 'Title', 'Plan'],
			locDays.map((d) => [`Day ${d.id}`, d.date, d.title, d.plan]),
			loc.colour
		);

		writeBlock(
			ws,
			'TO-DO',
			['Day', 'Task', 'Done'],
			todos
				.filter((t) => dayIds.has(t.day_id))
				.map((t) => [`Day ${t.day_id}`, t.text, t.checked ? 'Yes' : '']),
			loc.colour
		);

		autoFit(ws);
	}

	// ---------- Budget (category totals, not every line item — detail lives on each place's page) ----------
	{
		const ws = addSheet('Budget', 'FFDC2626');
		ws.addRow(['Budget · totals for 2 people (EUR)']).font = { bold: true, size: 14 };
		ws.addRow(['Fill in the Actual column as you spend — Difference turns green under budget, red over.']).font =
			{ color: { argb: 'FF64748B' }, size: 10 };
		ws.addRow([]);

		const catLabels: Record<string, string> = {
			accommodation: 'Accommodation',
			transport: 'Transport',
			activity: 'Activities',
			food: 'Food',
			misc: 'Misc'
		};
		const catOrder = ['accommodation', 'transport', 'activity', 'food', 'misc'];
		const byCat = new Map<string, number>();
		for (const b of budget) {
			byCat.set(b.category, (byCat.get(b.category) ?? 0) + b.estimated_cost);
		}

		const headerRow = ws.addRow(['Category', 'Estimated', 'Actual', 'Difference']);
		headerRow.font = { bold: true };
		headerRow.eachCell((cell) => {
			cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
			cell.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
		});

		const firstDataRow = ws.rowCount + 1;
		for (const cat of catOrder) {
			if (!byCat.has(cat)) continue;
			const row = ws.addRow([catLabels[cat] ?? cat, byCat.get(cat), null, null]);
			row.getCell(4).value = { formula: `IF(C${row.number}="","",C${row.number}-B${row.number})` } as any;
			[2, 3, 4].forEach((c) => (row.getCell(c).numFmt = '#,##0'));
		}
		const lastDataRow = ws.rowCount;

		ws.addRow([]);
		const totalRow = ws.addRow(['TOTAL', null, null, null]);
		totalRow.font = { bold: true };
		totalRow.getCell(2).value = { formula: `SUM(B${firstDataRow}:B${lastDataRow})` } as any;
		totalRow.getCell(3).value = { formula: `SUM(C${firstDataRow}:C${lastDataRow})` } as any;
		totalRow.getCell(4).value = {
			formula: `IF(C${totalRow.number}=0,"",C${totalRow.number}-B${totalRow.number})`
		} as any;
		[2, 3, 4].forEach((c) => (totalRow.getCell(c).numFmt = '#,##0'));

		const ppRow = ws.addRow(['Per person', null, null, null]);
		ppRow.font = { bold: true, color: { argb: 'FF64748B' } };
		ppRow.getCell(2).value = { formula: `B${totalRow.number}/2` } as any;
		ppRow.getCell(3).value = { formula: `IF(C${totalRow.number}=0,"",C${totalRow.number}/2)` } as any;
		[2, 3].forEach((c) => (ppRow.getCell(c).numFmt = '#,##0'));

		ws.addConditionalFormatting({
			ref: `D${firstDataRow}:D${lastDataRow}`,
			rules: [
				{
					type: 'cellIs',
					operator: 'greaterThan',
					priority: 1,
					formulae: ['0'],
					style: { font: { color: { argb: 'FFDC2626' }, bold: true } }
				} as any,
				{
					type: 'cellIs',
					operator: 'lessThan',
					priority: 2,
					formulae: ['0'],
					style: { font: { color: { argb: 'FF16A34A' }, bold: true } }
				} as any
			]
		});

		autoFit(ws);
	}

	const buffer = await wb.xlsx.writeBuffer();
	return new Response(buffer as ArrayBuffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment; filename="mexico-trip-2026.xlsx"'
		}
	});
};
