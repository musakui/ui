import { defineConfig } from 'vite'
import wind from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		//
		wind(),
	],
	test: {
		environment: 'happy-dom',
	},
})
