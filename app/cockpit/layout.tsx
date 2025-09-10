import '../../design-system/tokens.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../../styles/console.css';
import Topbar from '../../components/Topbar';
import CockpitShell from './components/CockpitShell';

export const metadata: Metadata = {
  title: 'Arka Cockpit',
  description: 'Interface de pilotage interne en mode sombre.',
};

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function CockpitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.className} console-theme min-h-screen flex flex-col overflow-hidden`}
    >
      <Topbar role="owner" />
      <div className="flex-1 w-full overflow-hidden">
        <CockpitShell>
          {children}
        </CockpitShell>
      </div>
    </div>
  );
}
