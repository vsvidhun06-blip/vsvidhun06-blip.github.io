import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages user/org sites serve from root, so base = '/'
// If deploying to project pages (username.github.io/repo-name), change base to '/repo-name/'
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
