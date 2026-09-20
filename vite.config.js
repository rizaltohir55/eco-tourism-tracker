import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Izinkan akses lewat tunnel publik (mis. Pinggy). Tanpa ini, Vite
    // menolak request dengan Host asing (403 "Blocked request").
    allowedHosts: 'all',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
    css: true,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    testTimeout: 20000,
  },
  build: {
    rollupOptions: {
      output: {
        // Code-splitting vendor.
        //
        // PERHATIAN: jangan kelompokkan @vis.gl/react-maplibre (wrapper
        // react-map-gl/maplibre) bersama maplibre-gl di chunk yang sama.
        // Wrapper memuat maplibre-gl via import() dinamis, dan Vite menaruh
        // preload-helper di chunk pemanggil. Kalau keduanya satu chunk,
        // preload-helper itu ikut ke chunk maplibre (1MB) lalu entry chunk
        // mengimpornya secara STATIS -> Vite memunculkannya sebagai
        // <link rel="modulepreload"> di index.html dan tujuan lazy-load gagal.
        // Karena itu hanya maplibre-gl yang dipaksa ke chunk 'maplibre';
        // wrapper tetap di chunk Map (yang memang lazy).
        manualChunks: (id) => {
          if (/[\\/]node_modules[\\/]maplibre-gl[\\/]/.test(id)) return 'maplibre';
          if (/[\\/]node_modules[\\/]@supabase[\\/]supabase-js[\\/]/.test(id)) return 'supabase';
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          return undefined;
        },
      },
    },
  },
})
