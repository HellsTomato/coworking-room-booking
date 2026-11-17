import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { mockApiPlugin } from './mock/apiPlugin.js'

const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8080'

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    restoreMocks: true,
    clearMocks: true,
    include: ['src/**/*.test.{js,jsx}'],
  },
})
