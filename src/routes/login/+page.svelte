<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Mexico Trip 2026 — Login</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-600 via-cyan-500 to-amber-500 px-4">
	<div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
		<div class="mb-6 text-center">
			<div class="text-4xl">🇲🇽</div>
			<h1 class="mt-2 text-xl font-bold text-gray-900">Mexico Trip 2026</h1>
			<p class="mt-1 text-sm text-gray-500">Enter the password to continue</p>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				// Providing a callback overrides SvelteKit's default enhance
				// behaviour entirely — including following redirects. So the
				// redirect has to be handled explicitly here, otherwise the
				// server's redirect result is silently ignored and the user
				// just sits on the login page.
				return async ({ result }) => {
					if (result.type === 'redirect') {
						loading = false;
						await goto(result.location, { invalidateAll: true });
						return;
					}
					const { applyAction } = await import('$app/forms');
					await applyAction(result);
					loading = false;
				};
			}}
		>
			<input
				type="password"
				name="password"
				placeholder="Password"
				class="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
				autocomplete="off"
				autofocus
			/>

			{#if form?.error}
				<p class="mt-2 text-center text-sm text-red-500">Wrong password — try again 🌮</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="mt-4 w-full rounded-lg bg-cyan-600 px-4 py-3 text-base font-medium text-white active:bg-cyan-700 disabled:opacity-50"
			>
				{loading ? 'Checking...' : 'Enter 🌴'}
			</button>
		</form>
	</div>
</div>
