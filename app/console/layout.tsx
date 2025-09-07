
import '../../styles/console.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Topbar from '../../components/Topbar';
import OfflineBanner from '../../components/system/OfflineBanner';
import Watermark from '../../components/system/Watermark';

export const metadata: Metadata = {
  title: 'Arka Console',
  description: 'Espace projet : chat multi‑agents, documents et observabilité.',
};

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="console-theme min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <OfflineBanner />
      <Topbar role="owner" />
      <Watermark />
      <div className="flex-1 w-full overflow-hidden">{children}</div>
    </div>
  );
}
