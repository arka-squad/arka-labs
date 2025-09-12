'use client';

import '../../design-system/tokens.css';
import { Inter } from 'next/font/google';
import '../../styles/console.css';
import CockpitShell from './components/CockpitShell';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function CockpitLayout({
  children}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} console-theme h-screen overflow-hidden`}>
      <CockpitShell>
        {children}
      </CockpitShell>
    </div>
  );
}
