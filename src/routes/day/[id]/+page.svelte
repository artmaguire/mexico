<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	let { data } = $props();

	const colorMap: Record<string, string> = {
		ocean: 'from-cyan-600 to-cyan-500', palm: 'from-green-600 to-green-500',
		purple: 'from-purple-600 to-purple-500', sunset: 'from-amber-500 to-yellow-400',
		pink: 'from-pink-600 to-pink-500'
	};
	const typeIcons: Record<string, string> = { flight: '✈️', bus: '🚌', ferry: '⛴️', tour: '🎟️', transfer: '🚐' };

	function mapsUrl(q: string) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }
	function formatDate(d: string) { return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); }

	let userRestaurants = $derived(data.restaurants.filter(r => r.is_user_added));
	let recommendedRestaurants = $derived(data.restaurants.filter(r => !r.is_user_added));

	// --- Accommodation ---
	let showAddAccom = $state(false);
	let accomForm = $state({ name: '', location: '', booking_link: '', check_in: '', check_out: '', cost_per_night: '', confirmation_ref: '', notes: '', maps_query: '' });

	// Pre-fill form if editing
	function initAccomForm() {
		if (data.accommodation) {
			accomForm = {
				name: data.accommodation.name, location: data.accommodation.location,
				booking_link: data.accommodation.booking_link, check_in: data.accommodation.check_in,
				check_out: data.accommodation.check_out, cost_per_night: data.accommodation.cost_per_night,
				confirmation_ref: data.accommodation.confirmation_ref, notes: data.accommodation.notes,
				maps_query: data.accommodation.maps_query
			};
		}
		showAddAccom = true;
	}

	async function saveAccom() {
		if (!accomForm.name.trim()) return;
		if (data.accommodation) {
			// Update existing
			await fetch(`/api/accommodations/${data.accommodation.id}`, {
				method: 'PATCH', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...accomForm, day_id: data.day.id })
			});
		} else {
			// Create new — also auto-add budget entry
			await fetch('/api/accommodations', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...accomForm, day_id: data.day.id })
			});
			if (accomForm.cost_per_night) {
				const nights = accomForm.check_in && accomForm.check_out
					? Math.max(1, Math.round((new Date(accomForm.check_out).getTime() - new Date(accomForm.check_in).getTime()) / 86400000))
					: 1;
				const perNight = parseFloat(accomForm.cost_per_night.replace(/[^0-9.]/g, '')) || 0;
				if (perNight > 0) {
					await fetch('/api/budget', {
						method: 'POST', headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ category: 'accommodation', description: `${accomForm.name} — ${nights} night${nights > 1 ? 's' : ''}`, estimated_cost: perNight * nights * 2 })
					});
				}
			}
		}
		showAddAccom = false;
		invalidateAll();
	}

	// --- Todos ---
	async function toggleTodo(id: number, checked: boolean) {
		await fetch(`/api/todos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checked: !checked }) });
		invalidateAll();
	}
	let showAddTodo = $state(false);
	let newTodoText = $state('');
	async function addTodo() {
		if (!newTodoText.trim()) return;
		await fetch('/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day_id: data.day.id, text: newTodoText.trim() }) });
		newTodoText = '';
		showAddTodo = false;
		invalidateAll();
	}

	// --- Restaurants ---
	let showAddR = $state(false);
	let newR = $state({ name: '', description: '', meal: 'Lunch', price_range: '', maps_query: '' });
	async function addRestaurant() {
		if (!newR.name.trim()) return;
		await fetch('/api/restaurants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newR, day_id: data.day.id, is_user_added: 1 }) });
		newR = { name: '', description: '', meal: 'Lunch', price_range: '', maps_query: '' };
		showAddR = false;
		invalidateAll();
	}
	async function deleteRestaurant(id: number) {
		await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
		invalidateAll();
	}

	// --- Transport ---
	let showAddT = $state(false);
	let newT = $state({ type: 'bus', title: '', link: '', time: '', price_eur: 0 });
	async function addTransport() {
		if (!newT.title.trim()) return;
		await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day_id: data.day.id, type: newT.type, title: newT.title, link: newT.link, time: newT.time, cost: `€${newT.price_eur}`, price_eur: newT.price_eur }) });
		if (newT.price_eur > 0) {
			await fetch('/api/budget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day_id: data.day.id, category: 'transport', description: newT.title, estimated_cost: newT.price_eur }) });
		}
		newT = { type: 'bus', title: '', link: '', time: '', price_eur: 0 };
		showAddT = false;
		invalidateAll();
	}
	async function deleteTicket(id: number) {
		await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
		invalidateAll();
	}
</script>

<svelte:head><title>Day {data.day.id} — {data.day.title}</title></svelte:head>

<div class="bg-gradient-to-r {colorMap[data.day.header_color] ?? colorMap.ocean} px-4 py-6 text-white">
	<div class="mx-auto max-w-2xl">
		<a href="/" class="mb-1 inline-block text-sm opacity-80 active:opacity-100">← All days</a>
		<div class="text-sm opacity-80">{formatDate(data.day.date)}</div>
		<h1 class="text-xl font-bold sm:text-2xl">Day {data.day.id} — {data.day.title}</h1>
		<span class="mt-1 inline-block rounded-full bg-white/25 px-3 py-0.5 text-sm">{data.day.base}</span>
	</div>
</div>

<div class="mx-auto max-w-2xl space-y-6 px-4 py-6">

	<!-- ACCOMMODATION: big add/edit box -->
	<section>
		<h2 class="mb-2 text-lg font-bold text-gray-900">🏠 Staying</h2>
		{#if data.accommodation && !showAddAccom}
			<div class="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<div class="font-semibold text-gray-900">{data.accommodation.name}</div>
						<div class="text-sm text-gray-500">{data.accommodation.location}</div>
						<div class="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
							<span>📅 {data.accommodation.check_in} → {data.accommodation.check_out}</span>
							{#if data.accommodation.cost_per_night}<span>💰 {data.accommodation.cost_per_night}/night</span>{/if}
							{#if data.accommodation.confirmation_ref}<span>📋 Ref: {data.accommodation.confirmation_ref}</span>{/if}
						</div>
					</div>
					<div class="flex shrink-0 gap-1">
						{#if data.accommodation.booking_link}
							<a href={data.accommodation.booking_link} target="_blank" rel="noopener" class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-lg active:bg-cyan-200" title="Booking">🔗</a>
						{/if}
						{#if data.accommodation.maps_query}
							<a href={mapsUrl(data.accommodation.maps_query)} target="_blank" rel="noopener" class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-lg active:bg-cyan-200" title="Maps">📍</a>
						{/if}
					</div>
				</div>
				<button onclick={initAccomForm} class="mt-3 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white active:bg-cyan-700">✏️ Edit accommodation</button>
			</div>
		{:else}
			<div class="rounded-xl border-2 border-dashed {showAddAccom ? 'border-cyan-300 bg-cyan-50' : 'border-gray-200 bg-gray-50'} p-4">
				{#if !showAddAccom}
					<button onclick={() => showAddAccom = true} class="w-full py-4 text-center text-sm font-medium text-gray-400 active:text-gray-600">
						+ Add accommodation for {data.day.base}
					</button>
				{:else}
					<div class="grid gap-2">
						<input bind:value={accomForm.name} placeholder="Name (e.g. Airbnb Centro)" class="rounded-lg border px-3 py-2.5 text-sm" />
						<input bind:value={accomForm.location} placeholder="Location / address" class="rounded-lg border px-3 py-2.5 text-sm" />
						<input bind:value={accomForm.booking_link} placeholder="Booking link (URL)" type="url" class="rounded-lg border px-3 py-2.5 text-sm" />
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="text-xs text-gray-500">Check-in</label>
								<input bind:value={accomForm.check_in} type="date" class="w-full rounded-lg border px-3 py-2.5 text-sm" />
							</div>
							<div>
								<label class="text-xs text-gray-500">Check-out</label>
								<input bind:value={accomForm.check_out} type="date" class="w-full rounded-lg border px-3 py-2.5 text-sm" />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<input bind:value={accomForm.cost_per_night} placeholder="Cost per night (e.g. 30)" class="rounded-lg border px-3 py-2.5 text-sm" />
							<input bind:value={accomForm.confirmation_ref} placeholder="Booking ref" class="rounded-lg border px-3 py-2.5 text-sm" />
						</div>
						<input bind:value={accomForm.maps_query} placeholder="Maps search" class="rounded-lg border px-3 py-2.5 text-sm" />
						<input bind:value={accomForm.notes} placeholder="Notes" class="rounded-lg border px-3 py-2.5 text-sm" />
					</div>
					<p class="mt-2 text-xs text-gray-400">💡 Cost auto-adds to budget (total for 2 × nights). Shared with other days at {data.day.base}.</p>
					<div class="mt-3 flex gap-2">
						<button onclick={saveAccom} class="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white active:bg-cyan-700">Save</button>
						<button onclick={() => showAddAccom = false} class="rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-600 active:bg-gray-200">Cancel</button>
					</div>
				{/if}
			</div>
		{/if}
	</section>

	<!-- Plan -->
	<section>
		<h2 class="mb-2 text-lg font-bold text-gray-900">📋 Plan</h2>
		<div class="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-700 whitespace-pre-line shadow-sm">{data.day.plan}</div>
	</section>

	<!-- Todos with add button -->
	<section>
		<div class="mb-2 flex items-center justify-between">
			<h2 class="text-lg font-bold text-gray-900">✅ To-do</h2>
			<button onclick={() => showAddTodo = !showAddTodo} class="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 active:bg-gray-200">{showAddTodo ? 'Cancel' : '+ Add'}</button>
		</div>
		{#if showAddTodo}
			<div class="mb-3 flex gap-2">
				<input bind:value={newTodoText} placeholder="New to-do item" class="flex-1 rounded-lg border px-3 py-2.5 text-sm" onkeydown={(e) => { if (e.key === 'Enter') addTodo(); }} />
				<button onclick={addTodo} class="rounded-lg bg-cyan-600 px-4 py-2.5 text-xs font-medium text-white active:bg-cyan-700">Add</button>
			</div>
		{/if}
		{#if data.todos.length > 0}
			<div class="space-y-1">
				{#each data.todos as todo (todo.id)}
					<label class="flex min-h-[44px] items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm active:bg-gray-50">
						<input type="checkbox" checked={!!todo.checked} onchange={() => toggleTodo(todo.id, !!todo.checked)} class="h-5 w-5 shrink-0 rounded border-gray-300 text-cyan-600" />
						<span class="text-sm {todo.checked ? 'line-through text-gray-400' : 'text-gray-700'}">{todo.text}</span>
					</label>
				{/each}
			</div>
		{:else if !showAddTodo}
			<p class="text-sm text-gray-400">No to-dos yet.</p>
		{/if}
	</section>

	<!-- Restaurants -->
	<section>
		<div class="mb-2 flex items-center justify-between">
			<h2 class="text-lg font-bold text-gray-900">🍽️ Where to Eat</h2>
			<button onclick={() => showAddR = !showAddR} class="{showAddR ? 'rounded-xl bg-gray-100 py-2 text-sm text-gray-500 active:bg-gray-200 w-full' : 'btn-add'}">{showAddR ? 'Cancel' : '+ Add'}</button>
		</div>

		{#if showAddR}
			<div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
				<div class="grid gap-2">
					<input bind:value={newR.name} placeholder="Restaurant name" class="rounded-lg border px-3 py-2.5 text-sm" />
					<select bind:value={newR.meal} class="rounded-lg border px-3 py-2.5 text-sm">
						<option>Breakfast</option><option>Lunch</option><option>Dinner</option>
					</select>
					<input bind:value={newR.description} placeholder="What's good there?" class="rounded-lg border px-3 py-2.5 text-sm" />
					<input bind:value={newR.price_range} placeholder="Price (e.g. €5–10 pp)" class="rounded-lg border px-3 py-2.5 text-sm" />
					<input bind:value={newR.maps_query} placeholder="Search on Maps (e.g. Tacos Rigo Cancún)" class="rounded-lg border px-3 py-2.5 text-sm" />
				</div>
				<button onclick={addRestaurant} class="mt-3 w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white active:bg-amber-600">Save restaurant</button>
			</div>
		{/if}

		<!-- User picks (top) -->
		{#if userRestaurants.length > 0}
			<div class="space-y-2">
				{#each userRestaurants as r (r.id)}
					<div class="flex gap-2">
						{#if r.maps_query}
							<a href={mapsUrl(r.maps_query)} target="_blank" rel="noopener" class="block flex-1 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 shadow-sm active:bg-amber-100 transition">
								<div class="flex items-center gap-2 flex-wrap">
									<span class="font-semibold text-gray-900">{r.name}</span>
									<span class="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">Your pick</span>
									<span class="text-xs text-gray-500">{r.meal}</span>
									<span class="ml-auto text-sm">📍</span>
								</div>
								{#if r.description}<p class="mt-1 text-sm text-gray-600">{r.description}</p>{/if}
								{#if r.price_range}<p class="mt-0.5 text-xs text-gray-400">{r.price_range}</p>{/if}
							</a>
						{:else}
							<div class="flex-1 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 shadow-sm">
								<div class="flex items-center gap-2 flex-wrap">
									<span class="font-semibold text-gray-900">{r.name}</span>
									<span class="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">Your pick</span>
									<span class="text-xs text-gray-500">{r.meal}</span>
								</div>
								{#if r.description}<p class="mt-1 text-sm text-gray-600">{r.description}</p>{/if}
							</div>
						{/if}
						<button onclick={() => deleteRestaurant(r.id)} class="btn-delete">✕</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Recommended (bottom) -->
		{#if recommendedRestaurants.length > 0}
			{#if userRestaurants.length > 0}
				<div class="my-3 flex items-center gap-2 text-xs text-gray-400">
					<div class="flex-1 border-t border-gray-200"></div>
					<span>Recommended</span>
					<div class="flex-1 border-t border-gray-200"></div>
				</div>
			{/if}
			<div class="space-y-2">
				{#each recommendedRestaurants as r (r.id)}
					{#if r.maps_query}
						<a href={mapsUrl(r.maps_query)} target="_blank" rel="noopener" class="block rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50 transition {r.is_alt ? 'opacity-60' : ''}">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-semibold text-gray-900">{r.name}</span>
								<span class="text-xs text-gray-500">{r.meal}</span>
								{#if r.rating}<span class="text-xs text-amber-500">⭐ {r.rating}</span>{/if}
								{#if r.is_alt}<span class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">alt</span>{/if}
								<span class="ml-auto text-sm">📍</span>
							</div>
							{#if r.description}<p class="mt-1 text-sm text-gray-600">{r.description}</p>{/if}
							{#if r.price_range}<p class="mt-0.5 text-xs text-gray-400">{r.price_range}</p>{/if}
						</a>
					{:else}
						<div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm {r.is_alt ? 'opacity-60' : ''}">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-semibold text-gray-900">{r.name}</span>
								<span class="text-xs text-gray-500">{r.meal}</span>
								{#if r.rating}<span class="text-xs text-amber-500">⭐ {r.rating}</span>{/if}
							</div>
							{#if r.description}<p class="mt-1 text-sm text-gray-600">{r.description}</p>{/if}
						</div>
					{/if}
				{/each}
			</div>
		{/if}
		{#if data.restaurants.length === 0}
			<p class="text-sm text-gray-400">No restaurants yet — add one above!</p>
		{/if}
	</section>

	<!-- Transport -->
	<section>
		<div class="mb-2 flex items-center justify-between">
			<h2 class="text-lg font-bold text-gray-900">🚌 Transport</h2>
			<button onclick={() => showAddT = !showAddT} class="{showAddT ? 'rounded-xl bg-gray-100 py-2 text-sm text-gray-500 active:bg-gray-200 w-full' : 'btn-add'}">{showAddT ? 'Cancel' : '+ Add'}</button>
		</div>
		{#if showAddT}
			<div class="mb-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
				<div class="grid gap-2">
					<select bind:value={newT.type} class="rounded-lg border px-3 py-2.5 text-sm">
						<option value="bus">🚌 Bus</option><option value="ferry">⛴️ Ferry</option><option value="flight">✈️ Flight</option><option value="tour">🎟️ Tour</option>
					</select>
					<input bind:value={newT.title} placeholder="Title (e.g. ADO Cancún → Tulum)" class="rounded-lg border px-3 py-2.5 text-sm" />
					<input bind:value={newT.link} placeholder="Booking link (URL)" type="url" class="rounded-lg border px-3 py-2.5 text-sm" />
					<div class="grid grid-cols-2 gap-2">
						<input bind:value={newT.time} placeholder="Time" class="rounded-lg border px-3 py-2.5 text-sm" />
						<input bind:value={newT.price_eur} type="number" step="0.5" placeholder="Price € (for 2)" class="rounded-lg border px-3 py-2.5 text-sm" />
					</div>
				</div>
				<p class="mt-1 text-xs text-gray-400">💡 Price auto-adds to budget</p>
				<button onclick={addTransport} class="mt-2 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white active:bg-cyan-700">Save</button>
			</div>
		{/if}
		{#if data.tickets.length > 0}
			<div class="space-y-2">
				{#each data.tickets as t (t.id)}
					<div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
						<span class="text-xl">{typeIcons[t.type] ?? '📄'}</span>
						<div class="min-w-0 flex-1">
							<div class="font-semibold text-gray-900">{t.title}</div>
							{#if t.details}<p class="text-sm text-gray-600">{t.details}</p>{/if}
							<div class="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
								{#if t.time}<span>🕐 {t.time}</span>{/if}
								{#if t.cost}<span>💰 {t.cost}</span>{/if}
								{#if t.confirmation_ref}<span>📋 {t.confirmation_ref}</span>{/if}
							</div>
						</div>
						<div class="flex shrink-0 gap-1">
							{#if t.link}
								<a href={t.link} target="_blank" rel="noopener" class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-sm active:bg-cyan-100">🔗</a>
							{/if}
							<button onclick={() => deleteTicket(t.id)} class="btn-delete">✕</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-gray-400">No transport added yet.</p>
		{/if}
	</section>

	<!-- Nav -->
	<div class="flex items-center justify-between border-t border-gray-200 pt-6">
		{#if data.prevId}
			<a href="/day/{data.prevId}" class="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 active:bg-gray-200">← Day {data.prevId}</a>
		{:else}<div></div>{/if}
		{#if data.nextId}
			<a href="/day/{data.nextId}" class="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white active:bg-cyan-700">Day {data.nextId} →</a>
		{:else}
			<a href="/" class="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white active:bg-amber-600">🏠 Overview</a>
		{/if}
	</div>
</div>
