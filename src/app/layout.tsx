import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

// Icons and the web manifest come from app/icon.svg, app/apple-icon.tsx and app/manifest.ts.
export const metadata: Metadata = {
  metadataBase: new URL('https://sela-energy.rw'),
  title: 'SELA ENERGY LTD | POWERING RWANDA FORWARD',
  description: 'SELA ENERGY LTD is powering Rwanda forward through energy, EV charging, and future-ready infrastructure.',
  openGraph: {
    title: 'SELA ENERGY LTD | POWERING RWANDA FORWARD',
    description: 'Modern energy and EV infrastructure for Rwanda.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="bg-brand-bg font-sans text-brand-text antialiased">{children}</body>
    </html>
  );
}
