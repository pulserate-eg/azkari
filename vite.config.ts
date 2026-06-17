import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/azkari/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Include all assets needed for full offline experience
      includeAssets: [
        'icon.svg',
        'islamic_bg_gold.png',
        'audio/*/*.mp3',
        'azkar/*.mp3'
      ],
      workbox: {
        // Cache audio files with a CacheFirst strategy (audio never changes)
        runtimeCaching: [
          {
            // Google Fonts CSS - StaleWhileRevalidate so it updates but works offline
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            // Google Fonts actual font files - CacheFirst (never change)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Local audio files - CacheFirst (never change) with Range Request support
            urlPattern: /\/(audio\/.*|azkar)\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              rangeRequests: true,
              cacheableResponse: {
                statuses: [200]
              }
            },
          },
          {
            urlPattern: /\.png$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
      },
      manifest: {
        name: 'أذكاري - رسائل ربانية',
        short_name: 'أذكاري',
        description: 'تطبيق أذكار وآيات قرآنية مع رسائل ربانية محفزة - يعمل بدون إنترنت',
        theme_color: '#022c22',
        background_color: '#022c22',
        display: 'standalone',
        dir: 'rtl',
        lang: 'ar',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
