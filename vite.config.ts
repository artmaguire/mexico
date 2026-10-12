import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// No paths.origin needed: login goes through a JSON API endpoint,
			// which SvelteKit's CSRF check doesn't apply to (it only guards
			// form content types). That keeps the app working on any host,
			// IP or port without build-time configuration.
			adapter: adapter({ out: 'build' })
		})
	]
});
