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
			// The public-facing origin SvelteKit treats as "self" for CSRF checks
			// on form POSTs. Without this, a request behind a reverse proxy or a
			// different host:port than the one the server binds to internally
			// will always fail the Origin check with "Cross-site POST form
			// submissions are forbidden" — this is what breaks the login form
			// when the app is reached via a mapped port (e.g. :5252 -> :3000).
			// Override at build time with PUBLIC_ORIGIN, e.g.
			//   PUBLIC_ORIGIN=http://192.168.0.119:5252 npm run build
			paths: {
				origin: process.env.PUBLIC_ORIGIN || 'http://localhost:3000'
			},
			adapter: adapter({ out: 'build' })
		})
	]
});
