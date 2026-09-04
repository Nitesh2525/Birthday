import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths for static hosting
  server: {
    port: 3000,
    host: '127.0.0.1'
  }
});
