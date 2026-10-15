import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SELA ENERGY LTD',
    short_name: 'SELA ENERGY',
    description: 'Modern energy and EV infrastructure for Rwanda.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7FAFC',
    theme_color: '#071A2B',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' }
    ]
  };
}
