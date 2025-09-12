import '../../design-system/tokens.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../../styles/console.css';
import '../../styles/scrollbar.css';
import Topbar from '../../components/Topbar';

export const metadata: Metadata = {
  title: 'Arka Backoffice',
  description: 'Backoffice Admin - Gestion des squads, agents, projets et clients.'};

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function BackofficeLayout({
  children}: {
  children: React.ReactNode;
}) {
  // Layout aligned with cockpit: full page, no body scroll
  return (
    <div
      className={`${inter.className} console-theme min-h-screen flex flex-col overflow-hidden`}
    >
      <Topbar role="owner" />
      <div className="flex-1 w-full overflow-hidden">{children}</div>
    </div>
  );
}