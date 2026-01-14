import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'DeerCamp - Hunting Club Management',
                short_name: 'DeerCamp',
                description: 'Manage your hunting club with stand reservations, harvest tracking, and club communication',
                theme_color: '#16a34a',
                background_color: '#0a0f0a',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                orientation: 'portrait-primary',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                categories: ['lifestyle', 'social', 'utilities'],
                shortcuts: [
                    {
                        name: 'Book a Stand',
                        short_name: 'Book Stand',
                        description: 'Reserve a hunting stand',
                        url: '/bookings/new',
                        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
                    },
                    {
                        name: 'Log Harvest',
                        short_name: 'Harvest',
                        description: 'Log a new harvest',
                        url: '/harvests',
                        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
                    },
                    {
                        name: 'View Map',
                        short_name: 'Map',
                        description: 'View compound map',
                        url: '/map',
                        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'mapbox-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'firebase-images-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'firestore-cache',
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 5 // 5 minutes
                            }
                        }
                    }
                ]
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
})
