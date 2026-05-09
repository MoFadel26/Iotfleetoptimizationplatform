import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const iotDeviceUrl = env.VITE_IOT_DEVICE_URL || 'http://172.20.10.6'

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        // The IoT device lives on the local network and isn't reachable from
        // a deployed frontend, so it stays as a dev-only proxy.
        '/iot-device': {
          target: iotDeviceUrl,
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
  }
})
