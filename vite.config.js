import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tensor-visualizer/',
  build: {
    chunkSizeWarningLimit: 2500,
  },
})
