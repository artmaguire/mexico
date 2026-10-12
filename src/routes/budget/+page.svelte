<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	let { data } = $props();

	const catLabels: Record<string, string> = { transport: '🚌 Transport', activity: '🎟️ Activities', food: '🍽️ Food', accommodation: '🏠 Accommodation', misc: '📦 Misc' };
	const catOrder = ['accommodation', 'transport', 'activity', 'food', 'misc'];

	function grouped() {
		const g: Record<string, typeof data.items> = {};
		for (const i of filteredItems) { if (!g[i.category]) g[i.category] = []; g[i.category].push(i); }
		return catOrder.filter(c => g[c]).map(c => [c, g[c]] as const);
	}
	function allGrouped() {
		const g: Record<string, typeof data.items> = {};
		for (const i of data.items) { if (!g[i.category]) g[i.category] = []; g[i.category].push(i); }
		return catOrder.filter(c => g[c]).map(c => [c, g[c]] as const);
	}

	let totalEst = $derived(data.items.reduce((s, i) => s + i.estimated_cost, 0));
	let totalAct = $derived(data.items.reduce((s, i) => s + i.actual_cost, 0));
	function catSum(items: typeof data.items) { return items.reduce((s, i) => s + i.estimated_cost, 0); }
	function catActual(items: typeof data.items) { return items.reduce((s, i) => s + i.actual_cost, 0); }

	// Pill filter
	const budgetFilters = [
		{ label: '📊 All', cat: 'all', active: 'bg-gray-800 text-white', inactive: 'bg-white text-gray-600 border border-gray-200' },
		{ label: '🏠 Stay', cat: 'accommodation', active: 'bg-cyan-600 text-white', inactive: 'bg-white text-cyan-700 border border-cyan-200' },
		{ label: '🚌 Transport', cat: 'transport', active: 'bg-purple-600 text-white', inactive: 'bg-white text-purple-700 border border-purple-200' },
		{ label: '🎟️ Activities', cat: 'activity', active: 'bg-amber-600 text-white', inactive: 'bg-white text-amber-700 border border-amber-200' },
		{ label: '🍽️ Food', cat: 'food', active: 'bg-rose-600 text-white', inactive: 'bg-white text-rose-700 border border-rose-200' },
		{ label: '📦 Misc', cat: 'misc', active: 'bg-gray-600 text-white', inactive: 'bg-white text-gray-600 border border-gray-200' },
	];
	let budgetCat = $state('all');
	let filteredItems = $derived(budgetCat === 'all' ? data.items : data.items.filter(i => i.category === budgetCat));

	async function togglePaid(id: number, current: boolean) {
		await fetch(`/api/budget/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paid: !current }) });
		invalidateAll();
	}
	async function updateActual(id: number, val: string) {
		await fetch(`/api/budget/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actual_cost: parseFloat(val) || 0 }) });
		invalidateAll();
	}
	async function deleteItem(id: number) {
		await fetch(`/api/budget/${id}`, { method: 'DELETE' });
		invalidateAll();
	}

	let showAdd = $state(false);
	let newItem = $state({ day_id: '', category: 'misc', description: '', estimated_cost: 0, notes: '' });
	async function addItem() {
		if (!newItem.description.trim()) return;
		await fetch('/api/budget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newItem, day_id: newItem.day_id ? Number(newItem.day_id) : null }) });
		newItem = { day_id: '', category: 'misc', description: '', estimated_cost: 0, notes: '' };
		showAdd = false;
		invalidateAll();
	}

	function costColor(est: number, act: number): string {
		if (act === 0) return 'text-gray-500';
		return act <= est ? 'text-green-600' : 'text-red-600';
	}
</script>

<svelte:head><title>Budget · Mexico Trip</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<h1 class="mb-1 text-2xl font-bold text-gray-900">💰 Trip Budget</h1>
	<p class="mb-4 text-sm text-gray-500">All prices for 2 people · Pre-wedding days (3–10 Nov)</p>

	<!-- Summary -->
	<div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
		<div class="rounded-xl bg-white p-4 text-center shadow-sm border border-gray-100">
			<div class="text-xs text-gray-500">Estimated</div>
			<div class="text-2xl font-bold text-gray-900">€{totalEst.toFixed(0)}</div>
			<div class="text-xs text-gray-400">€{(totalEst / 2).toFixed(0)} pp</div>
		</div>
		<div class="rounded-xl bg-white p-4 text-center shadow-sm border border-gray-100">
			<div class="text-xs text-gray-500">Actual</div>
			<div class="text-2xl font-bold {totalAct > 0 ? (totalAct <= totalEst ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}">
				{totalAct > 0 ? `€${totalAct.toFixed(0)}` : '—'}
			</div>
			<div class="text-xs text-gray-400">{totalAct > 0 ? `€${(totalAct / 2).toFixed(0)} pp` : 'Fill in as you go'}</div>
		</div>
		{#each allGrouped() as [cat, items] (cat)}			<div class="rounded-xl bg-white p-3 text-center shadow-sm border border-gray-100">
				<div class="text-xs text-gray-500">{catLabels[cat]?.split(' ')[1] ?? cat}</div>
				<div class="text-sm font-bold {costColor(catSum(items), catActual(items))}">
					€{catSum(items).toFixed(0)}{#if catActual(items) > 0} / €{catActual(items).toFixed(0)}{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Pill filter -->
	<div class="mb-5 flex flex-wrap gap-2">
		{#each budgetFilters as f (f.cat)}
			<button onclick={() => budgetCat = f.cat} class="rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition active:scale-95 {budgetCat === f.cat ? f.active : f.inactive}">{f.label}</button>
		{/each}
	</div>

	<!-- Add -->
	{#if !showAdd}
		<button class="btn-add mb-4" onclick={() => showAdd = true}>+ Add</button>
	{:else}
		<button class="mb-4 w-full rounded-xl bg-gray-100 py-2 text-sm text-gray-500 active:bg-gray-200" onclick={() => showAdd = false}>Cancel</button>
	{/if}
	{#if showAdd}
		<div class="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
			<div class="grid gap-2">
				<input bind:value={newItem.description} placeholder="Description" class="rounded-lg border px-3 py-2.5 text-sm" />
				<div class="grid grid-cols-2 gap-2">
					<select bind:value={newItem.category} class="rounded-lg border px-3 py-2.5 text-sm">
						{#each catOrder as c}<option value={c}>{catLabels[c]}</option>{/each}
					</select>
					<input bind:value={newItem.estimated_cost} type="number" step="0.5" placeholder="€ (for 2)" class="rounded-lg border px-3 py-2.5 text-sm" />
				</div>
				<input bind:value={newItem.notes} placeholder="Notes" class="rounded-lg border px-3 py-2.5 text-sm" />
			</div>
			<button onclick={addItem} class="mt-2 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white active:bg-cyan-700">Save</button>
		</div>
	{/if}

	<!-- Items by category -->
	{#each grouped() as [cat, items] (cat)}
		<div class="mb-6">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-base font-semibold text-gray-800">{catLabels[cat] ?? cat}</h2>
				<span class="text-sm {costColor(catSum(items), catActual(items))}">
					€{catSum(items).toFixed(0)}{#if catActual(items) > 0} / €{catActual(items).toFixed(0)}{/if}
				</span>
			</div>
			<div class="grid gap-2 sm:grid-cols-2">
				{#each items as item (item.id)}
					<div class="rounded-xl border border-gray-100 bg-white p-3 shadow-sm {item.paid ? 'border-green-200 bg-green-50/30' : ''}">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<input type="checkbox" checked={!!item.paid} onchange={() => togglePaid(item.id, !!item.paid)} class="h-4 w-4 shrink-0 rounded border-gray-300 text-green-600" />
									<span class="text-sm font-medium text-gray-800 {item.paid ? 'line-through opacity-60' : ''}">{item.description}</span>
								</div>
								{#if item.notes}<div class="mt-0.5 ml-6 text-xs text-gray-400">{item.notes}</div>{/if}
							</div>
							<button onclick={() => deleteItem(item.id)} class="btn-delete">✕</button>
						</div>
						<!-- Cost: estimated / actual with color -->
						<div class="mt-2 ml-6 flex items-center gap-2 text-sm">
							<span class="font-semibold {costColor(item.estimated_cost, item.actual_cost)}">
								€{item.estimated_cost.toFixed(0)}{#if item.actual_cost > 0}<span class="font-normal text-gray-400"> / </span>€{item.actual_cost.toFixed(0)}{/if}
							</span>
							<input type="number" step="0.5" value={item.actual_cost || ''} placeholder="actual" onchange={(e) => updateActual(item.id, e.currentTarget.value)} class="w-20 rounded border px-1.5 py-1 text-xs text-right" />
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
