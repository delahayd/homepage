import {resolve} from 'node:path';
import {defineConfig} from 'vite';

export default defineConfig({
  base: '/homepage/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        museum: resolve(__dirname, 'museum.html'),
      },
    },
  },
});
