import { defineConfig } from 'vite';

// base './' so the build works on GitHub Pages sub-paths and inside the Android WebView
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1500 },
});
