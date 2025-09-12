import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Poppins } from 'next/font/google';
import '../../styles/site.reset.css';
import '../../styles/site.base.css';
import '../../styles/site.components.css';
import '../../styles/site.utilities.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Arka — Cockpit IA pour piloter vos projets (chat multi‑agents)',
  description:
    'Pilotez vos projets avec des assistants IA : chat multi‑agents, recettes de gouvernance, observabilité et preuves partageables.',
  openGraph: {
    type: 'website',
    images: ['/assets/hero/arkabox-board.png']},
  twitter: { card: 'summary_large_image' }};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap'});

const siteTheme = {
  '--bg': '#e3e0db',
  '--surface': '#ffffff',
  '--ink': '#0F172A',
  '--muted': '#334155',
  '--border': 'rgba(0,0,0,0.06)',
  '--site-text': '#0F172A',
  '--site-muted': '#334155',
  '--site-border': 'rgba(0,0,0,0.06)',
  '--site-section': '#ffffff',
  background: '#e3e0db',
  color: '#0F172A'} as CSSProperties;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={poppins.className} style={siteTheme}>
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
      <div id="main" style={{ minHeight: '100vh' }}>{children}</div>
    </div>
  );
}

