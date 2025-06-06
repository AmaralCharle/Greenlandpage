import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Greenlandpage/', // Corrigido para GitHub Pages
  plugins: [react()],
});
