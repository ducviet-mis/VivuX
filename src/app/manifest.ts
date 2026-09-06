import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FlyDo',
    short_name: 'FlyDo',
    description: 'Nền tảng Học & Tự luyện Toán thông minh FlyDo',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F9FC',
    theme_color: '#F7F9FC',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
