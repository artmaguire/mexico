<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let password = $state('');
	let errorMsg = $state('');
	let loading = $state(false);

	async function submit() {
		if (loading) return;
		errorMsg = '';
		loading = true;

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (res.ok) {
				// Hard navigation, deliberately — not goto(). This forces a full
				// document request so the freshly-set cookie is sent by the
				// browser and the server re-evaluates auth from scratch. No
				// client-side router involved, nothing to mis-handle.
				window.location.replace(data.next || '/');
				return;
			}

			if (res.status === 401) {
				errorMsg = 'Wrong password — try again 🌮';
			} else {
				// Surface the real status so a deployment problem is diagnosable
				// from the UI rather than looking like a bad password.
				errorMsg = `Login failed (HTTP ${res.status})`;
			}
		} catch (e) {
			errorMsg = `Could not reach the server: ${e instanceof Error ? e.message : 'unknown'}`;
		}

		loading = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
	}
</script>

<svelte:head>
	<title>Mexico Trip 2026 — Login</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-600 via-cyan-500 to-amber-500 px-4">
	<div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
		<div class="mb-6 text-center">
			<div class="text-4xl">🇲🇽</div>
			<h1 class="mt-2 text-xl font-bold text-gray-900">Mexico Trip 2026</h1>
			<p class="mt-1 text-sm text-gray-500">Enter the password to continue</p>
		</div>

		<input
			type="password"
			bind:value={password}
			onkeydown={onKeydown}
			placeholder="Password"
			class="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
			autocomplete="off"
			autofocus
		/>

		{#if errorMsg}
			<p class="mt-2 text-center text-sm text-red-500">{errorMsg}</p>
		{/if}

		<button
			onclick={submit}
			disabled={loading}
			class="mt-4 w-full rounded-lg bg-cyan-600 px-4 py-3 text-base font-medium text-white active:bg-cyan-700 disabled:opacity-50"
		>
			{loading ? 'Checking…' : 'Enter 🌴'}
		</button>
	</div>
</div>
