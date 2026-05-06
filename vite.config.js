import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		//
	],
	test: {
		environment: 'happy-dom',
		coverage: { provider: 'v8' },
	},
})
