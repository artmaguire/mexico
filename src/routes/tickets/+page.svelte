<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	let { data } = $props();

	const typeIcons: Record<string, string> = { flight: '✈️', bus: '🚌', ferry: '⛴️', tour: '🎟️', transfer: '🚐' };

	let tab = $state<'tickets' | 'stays'>('tickets');

	// Add ticket form
	let showAddTicket = $state(false);
	let newTicket = $state({ day_id: 1, type: 'bus', title: '', details: '', cost: '', time: '', confirmation_ref: '' });

	async function addTicket() {
		if (!newTicket.title.trim()) return;
		await fetch('/api/tickets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newTicket)
		});
		newTicket = { day_id: 1, type: 'bus', title: '', details: '', cost: '', time: '', confirmation_ref: '' };
		showAddTicket = false;
		invalidateAll();
	}

	async function deleteTicket(id: number) {
		await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
		invalidateAll();
	}

	// Add accommodation form
	let showAddAccom = $state(false);
	let newAccom = $state({ name: '', location: '', check_in: '', check_out: '', cost_per_night: '', confirmation_ref: '', notes: '', maps_query: '' });

	async function addAccom() {
		if (!newAccom.name.trim()) return;
		await fetch('/api/accommodations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newAccom)
		});
		newAccom = { name: '', location: '', check_in: '', check_out: '', cost_per_night: '', confirmation_ref: '', notes: '', maps_query: '' };
		showAddAccom = false;
		invalidateAll();
	}

	async function deleteAccom(id: number) {
		await fetch(`/api/accommodations/${id}`, { method: 'DELETE' });
		invalidateAll();
	}

	function mapsUrl(query: string) {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
	}

	function ticketsByDay() {
		const groups: Record<number, typeof data.tickets> = {};
		for (const t of data.tickets) {
			const d = t.day_id ?? 0;
			if (!groups[d]) groups[d] = [];
			groups[d].push(t);
		}
		return groups;
	}
</script>

<svelte:head><title>Tickets & Stays · Mexico Trip</title></svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold text-gray-900">🎫 Tickets & Stays</h1>

	<!-- Tabs -->
	<div class="mb-6 flex gap-2 border-b border-gray-200">
		<button
			class="px-4 py-2 text-sm font-medium {tab === 'tickets' ? 'border-b-2 border-cyan-600 text-cyan-700' : 'text-gray-500 hover:text-gray-700'}"
			onclick={() => tab = 'tickets'}
		>🎫 Tickets & Transport</button>
		<button
			class="px-4 py-2 text-sm font-medium {tab === 'stays' ? 'border-b-2 border-cyan-600 text-cyan-700' : 'text-gray-500 hover:text-gray-700'}"
			onclick={() => tab = 'stays'}
		>🏠 Accommodation</button>
	</div>

	{#if tab === 'tickets'}
		{#if !showAddTicket}
			<button class="btn-add mb-4" onclick={() => showAddTicket = true}>+ Add ticket</button>
		{:else}
			<button class="mb-4 w-full rounded-xl bg-gray-100 py-2 text-sm text-gray-500 active:bg-gray-200" onclick={() => showAddTicket = false}>Cancel</button>
		{/if}

		{#if showAddTicket}
			<div class="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
				<div class="grid gap-3 sm:grid-cols-2">
					<select bind:value={newTicket.day_id} class="rounded-lg border px-3 py-2 text-sm">
						{#each data.days as day (day.id)}
							<option value={day.id}>Day {day.id} — {day.title}</option>
						{/each}
					</select>
					<select bind:value={newTicket.type} class="rounded-lg border px-3 py-2 text-sm">
						<option value="flight">✈️ Flight</option>
						<option value="bus">🚌 Bus</option>
						<option value="ferry">⛴️ Ferry</option>
						<option value="tour">🎟️ Tour</option>
					</select>
					<input bind:value={newTicket.title} placeholder="Title" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newTicket.time} placeholder="Time" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newTicket.details} placeholder="Details" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newTicket.cost} placeholder="Cost" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newTicket.confirmation_ref} placeholder="Confirmation ref" class="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
				</div>
				<button onclick={addTicket} class="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">Save</button>
			</div>
		{/if}

		{#each data.days as day (day.id)}
			{@const dayTickets = ticketsByDay()[day.id] ?? []}
			{#if dayTickets.length > 0}
				<h3 class="mt-4 mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Day {day.id} — {day.title}</h3>
				<div class="space-y-2">
					{#each dayTickets as ticket (ticket.id)}
						<div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
							<span class="text-2xl">{typeIcons[ticket.type] ?? '📄'}</span>
							<div class="flex-1">
								<div class="font-semibold text-gray-900">{ticket.title}</div>
								{#if ticket.details}<p class="text-sm text-gray-600">{ticket.details}</p>{/if}
								<div class="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
									{#if ticket.time}<span>🕐 {ticket.time}</span>{/if}
									{#if ticket.cost}<span>💰 {ticket.cost}</span>{/if}
									{#if ticket.confirmation_ref}<span>📋 {ticket.confirmation_ref}</span>{/if}
								</div>
							</div>
							<button onclick={() => deleteTicket(ticket.id)} class="btn-delete" title="Delete">✕</button>
						</div>
					{/each}
				</div>
			{/if}
		{/each}
	{:else}
		{#if !showAddAccom}
			<button class="btn-add mb-4" onclick={() => showAddAccom = true}>+ Add accommodation</button>
		{:else}
			<button class="mb-4 w-full rounded-xl bg-gray-100 py-2 text-sm text-gray-500 active:bg-gray-200" onclick={() => showAddAccom = false}>Cancel</button>
		{/if}

		{#if showAddAccom}
			<div class="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
				<div class="grid gap-3 sm:grid-cols-2">
					<input bind:value={newAccom.name} placeholder="Name (e.g. Airbnb Centro)" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newAccom.location} placeholder="Location" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newAccom.check_in} type="date" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newAccom.check_out} type="date" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newAccom.cost_per_night} placeholder="Cost per night" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newAccom.confirmation_ref} placeholder="Confirmation ref" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newAccom.maps_query} placeholder="Maps search query" class="rounded-lg border px-3 py-2 text-sm" />
					<input bind:value={newAccom.notes} placeholder="Notes" class="rounded-lg border px-3 py-2 text-sm" />
				</div>
				<button onclick={addAccom} class="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">Save</button>
			</div>
		{/if}

		{#if data.accommodations.length === 0}
			<p class="text-gray-500">No accommodation added yet. Click "+ Add accommodation" to get started.</p>
		{/if}
		<div class="space-y-3">
			{#each data.accommodations as a (a.id)}
				<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="text-lg font-semibold text-gray-900">{a.name}</h3>
							{#if a.maps_query}
								<a href={mapsUrl(a.maps_query)} target="_blank" rel="noopener" class="text-sm text-cyan-600 hover:underline">📍 {a.location}</a>
							{:else}
								<p class="text-sm text-gray-600">{a.location}</p>
							{/if}
						</div>
						<button onclick={() => deleteAccom(a.id)} class="btn-delete" title="Delete">✕</button>
					</div>
					<div class="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
						<span>📅 {a.check_in} → {a.check_out}</span>
						{#if a.cost_per_night}<span>💰 {a.cost_per_night}/night</span>{/if}
						{#if a.confirmation_ref}<span>📋 {a.confirmation_ref}</span>{/if}
					</div>
					{#if a.notes}<p class="mt-1 text-sm text-gray-500">{a.notes}</p>{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
