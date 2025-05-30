/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	build: {
		target: 'esnext',
	},
	plugins: [react()],
	test: {
		globals: true,
		setupFiles: 'src/test-setup.ts',
	}
})
