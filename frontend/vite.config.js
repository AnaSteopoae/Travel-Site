import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // înlocuiți cu portul corect al backend-ului
        changeOrigin: true,
        // Opțional, rewrite pentru a elimina /api din calea către backend
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
