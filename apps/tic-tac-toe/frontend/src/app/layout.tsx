import './global.css';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'X / O',
  category: 'game',
  applicationName: 'X / O',
  authors: {
    name: 'Ergi Dervishaj',
    url: 'https://www.linkedin.com/in/ergi-dervishaj/',
  },
  description: 'Play Tic-Tac-Toe online with friends',
  keywords: ['Tic-Tac-Toe', 'Multiplayer Game'],
  creator: 'Ergi Dervishaj',
  openGraph: {
    type: 'website',
    title: 'X / O',
    siteName: 'X / O',
    images: ['/apple_icon_57.png', '/apple_icon_180.png'],
    description: 'Play Tic-Tac-Toe online with friends',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: [
    {
      rel: 'icon',
      sizes: '16x16',
      type: 'image/png',
      url: '/favicon_16.ico',
    },
    {
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
      url: '/favicon_32.ico',
    },
    {
      sizes: '57x57',
      rel: 'apple-touch-icon',
      url: '/apple_icon_57.png',
    },
    {
      sizes: '180x180',
      rel: 'apple-touch-icon',
      url: '/apple_icon_180.png',
    },
  ],
  appleWebApp: {
    capable: true,
    title: 'X / O',
    statusBarStyle: 'black',
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  width: 'device-width',
  themeColor: '#0c0a09',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="root h-dvh bg-stone-950 text-stone-300">{children}</body>
    </html>
  );
}
