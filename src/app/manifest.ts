import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EduTutor',
    short_name: 'EduTutor',
    description: 'Nền tảng Quản lý Lớp Gia sư & Tự luyện Toán',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5fa',
    theme_color: '#1a1625',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
