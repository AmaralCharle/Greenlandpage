import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Greenlandpage/',
  plugins: [react()],
  // Proxy API calls during development to avoid CORS issues when backend
  // does not set Access-Control-Allow-Origin. This makes requests to
  // /api/* be forwarded to the remote API host.
  server: {
    proxy: {
      // proxy /api to the external API host
      '/api': {
        target: 'https://painful.aksaraymalaklisi.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});
