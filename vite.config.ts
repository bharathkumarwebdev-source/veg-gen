import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY so the existing code works
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      // Ensure the service worker is copied to the build output
      rollupOptions: {
        input: {
          main: 'index.html',
          sw: 'service-worker.js'
        },
        output: {
          entryFileNames: (assetInfo) => {
            return assetInfo.name === 'sw' ? 'service-worker.js' : 'assets/[name]-[hash].js';
          }
        }
      }
    }
  };
});