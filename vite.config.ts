import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/optimizer': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/optimizer/, ''),
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/iot-device': {
        target: 'http://172.20.10.6',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/iot-device/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
