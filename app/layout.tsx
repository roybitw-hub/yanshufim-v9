import type { Metadata, Viewport } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';

const heebo = Heebo({ subsets: ['hebrew', 'latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-heebo', display: 'swap' });

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
    <html lang="he" dir="rtl" className={heebo.variable} suppressHydrationWarning>
      <head>
        {/* The owl's fly-in plays once per visit; later page loads start from the hover loop. */}
        <script dangerouslySetInnerHTML={{ __html: "try{var k='ys-owl';if(sessionStorage.getItem(k))document.documentElement.dataset.owlSeen='1';else sessionStorage.setItem(k,'1')}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
