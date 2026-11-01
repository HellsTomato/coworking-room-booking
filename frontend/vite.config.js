import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Inside Docker Compose the backend is reachable by its service name.
const apiProxy = {
  '/api': {
    target: process.env.API_PROXY_TARGET || 'http://backend:8080',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, strictPort: true, proxy: apiProxy },
  preview: { host: true, port: 5173, strictPort: true, proxy: apiProxy },
});
