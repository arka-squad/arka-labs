import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../../styles/console.css';
import Topbar from '../../components/Topbar';

export const metadata: Metadata = {
  title: 'Arka Cockpit',
  description: 'Application de gestion Arka - Cockpit (mode sombre)',
};

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  // Nested layout aligned with /console: padding around app grid, no body scroll
  return (
    <div className={`${inter.className} console-theme min-h-screen flex flex-col overflow-hidden`}>
      <Topbar role="owner" />
      <div className="flex-1 w-full overflow-hidden">{children}</div>
    </div>
  );
}
