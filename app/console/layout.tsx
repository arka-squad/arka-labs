'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import NavItem from '../../components/ui/NavItem';

import Topbar from '../../components/Topbar';
import OfflineBanner from '../../components/system/OfflineBanner';
import Watermark from '../../components/system/Watermark';

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState('projects');
  const router = useRouter();

  // Guard minimal: redirige vers /login si aucun token présent
  useEffect(() => {
    try {
      const has =
        (typeof window !== 'undefined' &&
          (localStorage.getItem('RBAC_TOKEN') || localStorage.getItem('token'))) ||
        (typeof document !== 'undefined' && /(arka_access_token|arka_auth)=/.test(document.cookie));
      if (!has) router.replace('/login');
    } catch {
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0C1319] text-slate-100">
      <OfflineBanner />
      <Topbar />
      <Watermark />
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
        {/* SideNav (serveur) & contenu */}
        <aside className="col-span-12 sm:col-span-3 lg:col-span-2">
          <nav className="sticky top-6 space-y-2">
            <NavItem
              active={tab === 'projects'}
              label="Projects"
              onClick={() => setTab('projects')}
            />
            <NavItem
              active={tab === 'chat'}
              label="Chat"
              onClick={() => setTab('chat')}
            />
            <NavItem
              active={tab === 'documents'}
              label="Documents"
              onClick={() => setTab('documents')}
            />
            <NavItem
              active={tab === 'observabilite'}
              label="Observabilité"
              onClick={() => setTab('observabilite')}
            />
            {false && (
              <NavItem
                active={tab === 'prompt-builder'}
                label="Prompt Builder"
                onClick={() => setTab('prompt-builder')}
              />
            )}
          </nav>
        </aside>
        <section className="col-span-12 sm:col-span-9 lg:col-span-10">{children}</section>
      </div>
    </div>
  );
}
