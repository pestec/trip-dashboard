import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/trip-dashboard/', // Change this to your repo name for GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
