<script lang="ts">
	import MexFlag from '#lib/MexFlag.svelte';
	let { data } = $props();

	const colorMap: Record<string, string> = {
		ocean: 'from-cyan-600 to-cyan-500', palm: 'from-green-600 to-green-500',
		purple: 'from-purple-600 to-purple-500', sunset: 'from-amber-500 to-yellow-400',
		pink: 'from-pink-600 to-pink-500'
	};
	const tagColor: Record<string, string> = {
		ocean: 'bg-cyan-600', palm: 'bg-green-600', purple: 'bg-purple-600', sunset: 'bg-amber-500',
		pink: 'bg-pink-600'
	};

	// Pill filter — same style as Food/Phrases/Budget pages.
	const locations = [
		{ label: '🗺️ All', cat: 'all', active: 'bg-gray-800 text-white', inactive: 'bg-white text-gray-600 border border-gray-200' },
		{ label: '🌮 Cancún Centro', cat: 'centro', active: 'bg-cyan-600 text-white', inactive: 'bg-white text-cyan-700 border border-cyan-200' },
		{ label: '🏝️ Holbox', cat: 'holbox', active: 'bg-green-600 text-white', inactive: 'bg-white text-green-700 border border-green-200' },
		{ label: '🏖️ Cancún Hotel', cat: 'hotelzone', active: 'bg-pink-600 text-white', inactive: 'bg-white text-pink-700 border border-pink-200' }
	];
	let activeFilter = $state('all');

	const filterMatch: Record<string, (base: string) => boolean> = {
		all: () => true,
		centro: (b) => b.includes('Cancún Centro'),
		holbox: (b) => b.toLowerCase().includes('holbox'),
		hotelzone: (b) => b.includes('Hotel Zone')
	};

	let filteredDays = $derived(data.days.filter((d) => filterMatch[activeFilter](d.base)));

	function formatDate(d: string) {
		return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
	}
</script>

<svelte:head><title>Mexico Trip 2026</title></svelte:head>

<div class="bg-gradient-to-br from-cyan-600 via-cyan-500 to-amber-500 px-4 py-8 text-center text-white sm:py-12">
	<h1 class="flex items-center justify-center gap-2.5 text-2xl font-bold sm:text-4xl">
		<MexFlag size={34} />
		Mexico Trip
	</h1>
	<p class="mt-1 opacity-90">Cancún &amp; Yucatán · 3–14 Nov 2026</p>
	<span class="mt-2 inline-block rounded-full bg-white/25 px-3 py-1 text-sm backdrop-blur">💒 Wedding: 10–14 Nov</span>
</div>

<div class="mx-auto max-w-5xl px-4 py-6">
	<!-- Pill filter -->
	<div class="mb-5 flex flex-wrap gap-2">
		{#each locations as loc (loc.cat)}
			<button
				onclick={() => (activeFilter = loc.cat)}
				class="rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition active:scale-95 {activeFilter === loc.cat ? loc.active : loc.inactive}"
			>{loc.label}</button>
		{/each}
	</div>

	<!-- Day grid -->
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each filteredDays as day (day.id)}
			<a href="/day/{day.id}" class="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md active:shadow-md">
				<div class="bg-gradient-to-r {colorMap[day.header_color] ?? colorMap.ocean} px-4 py-3 text-white">
					<div class="text-xs opacity-80">{formatDate(day.date)}</div>
					<div class="font-bold">Day {day.id} — {day.title}</div>
				</div>
				<div class="px-4 py-3">
					<span class="inline-block rounded-full {tagColor[day.header_color] ?? tagColor.ocean} px-2 py-0.5 text-xs text-white">{day.base}</span>
					{#if day.todoTotal > 0}
						<span class="ml-2 text-xs text-gray-400">✅ {day.todoDone}/{day.todoTotal}</span>
					{/if}
					<div class="mt-2 text-xs font-medium text-cyan-600">View details →</div>
				</div>
			</a>
		{/each}
	</div>

	{#if filteredDays.length === 0}
		<p class="mt-6 text-center text-sm text-gray-400">No days found</p>
	{/if}

	<!-- Export (small, unobtrusive) -->
	<div class="mt-10 flex items-center justify-center gap-3 border-t border-gray-100 pt-4 text-xs text-gray-400">
		<span>Export for Google Sheets:</span>
		<a href="/api/export" class="font-medium text-gray-500 underline-offset-2 hover:text-cyan-600 hover:underline">.xlsx</a>
		<span class="text-gray-300">·</span>
		<a href="/api/export?format=json" class="font-medium text-gray-500 underline-offset-2 hover:text-cyan-600 hover:underline">JSON backup</a>
	</div>
</div>
