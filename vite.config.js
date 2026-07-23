import { defineConfig } from 'vite';

export default defineConfig({
  // Pas de root spécial : index.html est déjà à la racine
  // Vite servira les fichiers statiques (css/, js/, images/) automatiquement
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
