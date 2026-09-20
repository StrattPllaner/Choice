import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// base relativa: el mismo build sirve en dominio propio y en cualquier subcarpeta
// (GitHub Pages) sin recompilar
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2019',            // cubre Android 8+ de gama baja sin polyfills
    cssCodeSplit: true,
    sourcemap: false,
    modulePreload: { polyfill: false },
    assetsInlineLimit: 2048,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // vendor y router aparte: cambian poco, se quedan en caché del SW entre releases
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor'
          if (/node_modules\/(react-router|react-router-dom|@remix-run)\//.test(id)) return 'router'
          return 'libs'
        },
      },
    },
  },
  server: { host: true, port: 5173 },
  preview: { port: 4173 },
})
