import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import '../../styles/site.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Arka — Cockpit IA pour piloter vos projets (chat multi-agents)',
  description:
    'Pilotez vos projets avec des assistants IA : chat multi-agents, recettes de gouvernance, observabilité et preuves partageables.',
  openGraph: {
    type: 'website',
    images: ['/assets/hero/arkabox-board.png'],
  },
  twitter: { card: 'summary_large_image' },
};

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const sora = Sora({ subsets: ['latin'], display: 'swap' });

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site-theme ${inter.className}`}>
      {/* Consent/Cookies minimal */}
      <Script id="ga4-consent" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('consent', 'default', { 'ad_storage': 'denied', 'analytics_storage': 'denied' });`}
      </Script>
      {/* GA4 placeholder (replace G-ARKA12345) */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-ARKA12345" strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} gtag('js', new Date());
          gtag('config', 'G-ARKA12345', { anonymize_ip: true });
        `}
      </Script>
      <div style={{ minHeight: '100vh' }} className={sora.className}>{children}</div>
    </div>
  );
}

