import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths for GitHub Pages, Vercel, Netlify, and custom domains
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
  server: {
    port: 3000,
    host: true,
  },
});
