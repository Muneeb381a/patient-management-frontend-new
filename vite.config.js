import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://patient-management-backend-nine.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path, // Remove the path rewrite
      }
    }
  },
  build: {
    outDir: 'dist',
  }
})
