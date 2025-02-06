import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        sw: './public/firebase-messaging-sw.js'
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  },
  server: {
    proxy: {
      '/api/asaas': {
        target: 'https://sandbox.asaas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/asaas/, '/api/v3'),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  }
})
