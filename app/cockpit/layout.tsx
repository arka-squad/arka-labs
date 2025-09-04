import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Arka Cockpit',
  description: 'Application de gestion Arka - Cockpit (mode sombre)',
};

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  // Nested layout: no <html>/<body>; scope Inter + dark theme to this segment
  return (
    <div className={`${inter.className} min-h-screen bg-[#0C1117] text-slate-100`}>
      {children}
    </div>
  );
}
