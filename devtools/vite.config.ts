import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vite: resolve(__dirname, 'src/vite.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'vue-checkin', '@vue/devtools-api', '@nuxt/devtools-kit', 'vite'],
      output: {
        preserveModules: false,
        // Éviter les conflits de noms avec Vue
        manualChunks: undefined,
      },
    },
    minify: false, // Désactiver la minification pour éviter les conflits
    sourcemap: true,
  },
});
