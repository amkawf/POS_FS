import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'POS Terminal Resto',
        short_name: 'POS',
        description: 'Point of Sale & Kitchen Display System',
        theme_color: '#2563EB',
        background_color: '#0f172a',   
        display: 'standalone',
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
    }),
  ]  
})
