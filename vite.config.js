import { defineConfig } from 'vite';

export default defineConfig({
  // Pas de root spécial : index.html est déjà à la racine
  // Vite servira les fichiers statiques (css/, js/, images/) automatiquement
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
