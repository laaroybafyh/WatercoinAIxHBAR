import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import ParallaxProvider from '../components/ParallaxProvider';
import { Suspense } from 'react';
import HydrationErrorBoundary from '../components/HydrationErrorBoundary';

export const metadata: Metadata = {
  title: {
    default: 'WATERCOIN AI QUALITY MONITOR',
    template: '%s | Watercoin AI'
  },
  description: 'Real-time AI monitoring and POS for Watercoin partners (B2B).',
  keywords: [
    'Water Quality', 'AI Monitoring', 'TDS', 'pH', 'POS', 'Watercoin', 'IoT', 'HEDERA', 'Blockchain'
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico'
  },
  openGraph: {
    title: 'WATERCOIN AI QUALITY MONITOR',
    description: 'Real-time AI monitoring and POS for Watercoin partners.',
    type: 'website',
    url: 'http://localhost:3000'
  },
  metadataBase: new URL('http://localhost:3000')
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover',
  themeColor: '#0D6CA3'
};

const poppins = Poppins({ subsets: ['latin'], weight: ['400','500','600','700','800'], display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <HydrationErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <ParallaxProvider>
              {children}
            </ParallaxProvider>
          </Suspense>
        </HydrationErrorBoundary>
      </body>
    </html>
  );
}


