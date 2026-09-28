import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Two real pages: `/` (Explore / game) and `/pro/` (Professional View).
// The Professional View never loads the game engine.
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: 'static', // public/assets/ holds the replaceable art
    rollupOptions: {
      input: {
        explore: resolve(import.meta.dirname, 'index.html'),
        pro: resolve(import.meta.dirname, 'pro/index.html'),
      },
    },
  },
});
