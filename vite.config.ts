import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  server: {},
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
    // Alias @ to the src directory
    '@': path.resolve(__dirname, './src'),
  },
},

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
