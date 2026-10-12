<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import MexFlag from '#lib/MexFlag.svelte';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});

	const navItems = [
		{ href: '/', label: 'Trip', icon: '🗓️', flag: false },
		{ href: '/tickets', label: 'Tickets', icon: '🎫', flag: false },
		{ href: '/budget', label: 'Budget', icon: '💰', flag: false },
		{ href: '/packing', label: 'Pack', icon: '🧳', flag: false },
		{ href: '/local', label: 'Local', icon: '', flag: true },
	];

	let isGate = $derived(page.url.pathname === '/login');

	function isActive(href: string) {
		const current = page.url.pathname;
		if (href === '/') return current === '/' || current.startsWith('/day/');
		return current.startsWith(href);
	}
</script>

<svelte:head>
	<title>Mexico Trip 2026</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#0891b2" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
</svelte:head>

<div class="min-h-screen bg-[#faf6f0] {isGate ? '' : 'pb-20 sm:pb-0'}">
	{#if !isGate}
		<!-- Desktop top nav -->
		<nav class="hidden sm:block bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
			<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
				<a href="/" class="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-cyan-600 transition">
					<MexFlag size={22} />
					Mexico 2026
				</a>
				<div class="flex items-center gap-1">
					{#each navItems as item (item.href)}
						<a
							href={item.href}
							class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition
							{isActive(item.href) ? 'bg-cyan-50 text-cyan-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}"
						>
							{#if item.flag}<MexFlag size={16} />{:else}<span>{item.icon}</span>{/if}
							{item.label}
						</a>
					{/each}
				</div>
			</div>
		</nav>
	{/if}

	<div class="animate-fadeIn">
		{@render children()}
	</div>

	{#if !isGate}
		<!-- Mobile bottom nav -->
		<nav class="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 safe-bottom">
			<div class="flex items-center justify-around px-1 py-1">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 min-w-[50px] transition
						{isActive(item.href) ? 'text-cyan-600' : 'text-gray-400 active:text-gray-600'}"
					>
						{#if item.flag}
							<span class="flex h-5 items-center"><MexFlag size={22} /></span>
						{:else}
							<span class="text-xl leading-none">{item.icon}</span>
						{/if}
						<span class="text-[10px] font-medium">{item.label}</span>
						{#if isActive(item.href)}
							<div class="absolute -top-0.5 h-0.5 w-7 rounded-full bg-cyan-600"></div>
						{/if}
					</a>
				{/each}
			</div>
		</nav>
	{/if}
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fadeIn { animation: fadeIn 0.2s ease-out; }
	.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
</style>
