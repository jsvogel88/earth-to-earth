import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Canonical transport + world city JSON inflates the main chunk.
    chunkSizeWarningLimit: 16000,
  },
  server: {
    port: 5175,
    strictPort: false,
    host: true,
    open: false,
  },
  preview: {
    port: 5175,
    strictPort: false,
    host: true,
  },
  optimizeDeps: {
    include: ['maplibre-gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/mapbox'],
  },
})
