import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Types et helpers purs partagés avec les apps mobiles (aucun module React Native n'est importé ici).
      '@shared': fileURLToPath(new URL('../packages/shared/src', import.meta.url)),
    },
  },
  server: { port: 5173, open: false },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 2000 },
});
