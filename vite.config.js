import { defineConfig } from 'vite';

// base './' so the build works on GitHub Pages sub-paths, inside the Android WebView
// and inside game-portal iframes. `--mode crazygames|poki` builds a portal version
// (see src/portal.js) into its own folder.
export default defineConfig(({ mode }) => ({
  base: './',
  build: {
    chunkSizeWarningLimit: 1500,
    outDir: ['crazygames', 'poki'].includes(mode) ? `dist-${mode}` : 'dist',
  },
}));
