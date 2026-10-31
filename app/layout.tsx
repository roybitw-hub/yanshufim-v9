import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ינשופים',
  description: 'מערך הלימודים שלי',
  applicationName: 'ינשופים',
  appleWebApp: { capable: true, title: 'ינשופים', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icon.svg', apple: '/apple-touch-icon.png' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#6B4DFF',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap" />
        {/* The owl's fly-in plays once per visit; later page loads start from the hover loop. */}
        <script dangerouslySetInnerHTML={{ __html: "try{var k='ys-owl';if(sessionStorage.getItem(k))document.documentElement.dataset.owlSeen='1';else sessionStorage.setItem(k,'1')}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
