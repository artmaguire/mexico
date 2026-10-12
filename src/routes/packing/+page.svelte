<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	let { data } = $props();

	const catLabels: Record<string, string> = { documents: '📄 Documents', essentials: '🧴 Essentials', clothing: '👕 Clothing', tech: '🔌 Tech' };
	const catOrder = ['documents', 'essentials', 'clothing', 'tech'];

	function grouped() {
		const g: Record<string, typeof data.items> = {};
		for (const i of data.items) { if (!g[i.category]) g[i.category] = []; g[i.category].push(i); }
		return catOrder.filter(c => g[c]?.length).map(c => [c, g[c]] as const);
	}

	let total = $derived(data.items.length);
	let done = $derived(data.items.filter(i => i.checked).length);
	let pct = $derived(total > 0 ? Math.round((done / total) * 100) : 0);

	async function toggle(id: number, current: boolean) {
		await fetch(`/api/packing/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checked: !current }) });
		invalidateAll();
	}
	async function remove(id: number) {
		await fetch(`/api/packing/${id}`, { method: 'DELETE' });
		invalidateAll();
	}

	// Per-category add
	let addingCat = $state('');
	let addText = $state('');
	async function addToCategory(cat: string) {
		if (!addText.trim()) return;
		await fetch('/api/packing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: addText.trim(), category: cat }) });
		addText = '';
		addingCat = '';
		invalidateAll();
	}

	// General add
	let showGeneral = $state(false);
	let genText = $state('');
	let genCat = $state('essentials');
	async function addGeneral() {
		if (!genText.trim()) return;
		await fetch('/api/packing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: genText.trim(), category: genCat }) });
		genText = '';
		showGeneral = false;
		invalidateAll();
	}
</script>

<svelte:head><title>Packing · Mexico Trip</title></svelte:head>

<div class="mx-auto max-w-2xl px-4 py-6">
	<h1 class="mb-2 text-2xl font-bold text-gray-900">🧳 Packing Checklist</h1>

	<!-- Progress -->
	<div class="mb-6">
		<div class="flex items-center justify-between text-sm text-gray-600">
			<span>{done}/{total} packed</span>
			<span class="font-semibold">{pct}%</span>
		</div>
		<div class="mt-1 h-3 rounded-full bg-gray-200">
			<div class="h-3 rounded-full bg-green-500 transition-all" style="width: {pct}%"></div>
		</div>
	</div>

	{#each grouped() as [cat, items] (cat)}
		<div class="mb-6">
			<h2 class="mb-2 text-base font-semibold text-gray-800">{catLabels[cat] ?? cat}</h2>
			<div class="space-y-1">
				{#each items as item (item.id)}
					<div class="flex min-h-[44px] items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-sm">
						<input type="checkbox" checked={!!item.checked} onchange={() => toggle(item.id, !!item.checked)} class="h-5 w-5 shrink-0 rounded border-gray-300 text-green-600" />
						<span class="flex-1 text-sm {item.checked ? 'line-through text-gray-400' : 'text-gray-700'}">{item.text}</span>
						<button onclick={() => remove(item.id)} class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 active:bg-red-50" title="Remove">✕</button>
					</div>
				{/each}
			</div>
			<!-- Per-category quick add -->
			{#if addingCat === cat}
				<div class="mt-2 flex gap-2">
					<input bind:value={addText} placeholder="New item" class="flex-1 rounded-lg border px-3 py-2.5 text-sm" onkeydown={(e) => { if (e.key === 'Enter') addToCategory(cat); }} />
					<button onclick={() => addToCategory(cat)} class="rounded-lg bg-green-600 px-3 py-2.5 text-xs font-medium text-white active:bg-green-700">Add</button>
					<button onclick={() => { addingCat = ''; addText = ''; }} class="rounded-lg bg-gray-100 px-3 py-2.5 text-xs text-gray-600 active:bg-gray-200">✕</button>
				</div>
			{:else}
				<button onclick={() => addingCat = cat} class="mt-2 text-sm font-medium text-green-600 active:text-green-700">+ Add to {catLabels[cat]?.split(' ')[1] ?? cat}</button>
			{/if}
		</div>
	{/each}

	<!-- General add -->
	<div class="border-t border-gray-200 pt-4">
		<button onclick={() => showGeneral = !showGeneral} class="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white active:bg-green-700">{showGeneral ? 'Cancel' : '+ Add item to any category'}</button>
		{#if showGeneral}
			<div class="mt-3 flex gap-2">
				<input bind:value={genText} placeholder="Item" class="flex-1 rounded-lg border px-3 py-2.5 text-sm" />
				<select bind:value={genCat} class="rounded-lg border px-3 py-2.5 text-sm">
					{#each catOrder as c}<option value={c}>{catLabels[c]}</option>{/each}
				</select>
				<button onclick={addGeneral} class="rounded-lg bg-green-600 px-3 py-2.5 text-xs font-medium text-white active:bg-green-700">Add</button>
			</div>
		{/if}
	</div>
</div>
