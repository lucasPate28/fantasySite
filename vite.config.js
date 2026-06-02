import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    proxy: {
      // Rule for your player stats and game logs domain
      '/api-nhl': {
        target: 'https://api-web.nhle.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-nhl/, ''),
      },
      // NEW Rule: Maps your working player search domain
      '/api-search': {
        target: 'https://search.d3.nhle.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-search/, ''),
      }
    },
  },
})
