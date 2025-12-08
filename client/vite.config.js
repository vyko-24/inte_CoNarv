import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import flowbiteReact from "flowbite-react/plugin/vite";
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';


// https://vite.dev/config/
export default defineConfig({
  define: {
    global: 'window',
  },
  plugins: [react(), flowbiteReact(),tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Habilita la PWA en "pnpm dev"
        type: 'module', // Importante si usas Vite moderno
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'RomMila Hotel App',
        short_name: 'RomMila',
        description: 'Gestión de limpieza hotelera',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone', // <--- ESTO ES CRÍTICO: Elimina la barra de URL
        orientation: 'portrait', // Bloquear orientación en móviles (opcional)
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png', // Asegúrate de tener estos iconos en public/
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // ESTRATEGIAS DE CACHÉ
        runtimeCaching: [
          {
            // 1. Cachear las Vistas y Assets (JS, CSS, HTML)
            urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
            handler: 'StaleWhileRevalidate',
          },
          {
            // 2. Cachear peticiones GET a la API (Para ver datos sin internet)
            // Ajusta la URL base si es diferente en producción
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst', // Intenta red, si falla, usa caché
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50, // Limite de entradas
                maxAgeSeconds: 60 * 60 * 24 // 1 día
              }
            }
          }
        ]
      }
    })
  ],
})