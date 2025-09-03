'use client';

import { useState, type ReactNode } from 'react';

import NavItem from '../../components/ui/NavItem';

import Topbar from '../../components/Topbar';

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState('projects');

  return (
    <div className="min-h-screen bg-[#0C1319] text-slate-100">
      <Topbar />
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
            <NavItem
              active={tab === 'prompt-builder'}
              label="Prompt Builder"
              onClick={() => setTab('prompt-builder')}
            />
          </nav>
        </aside>
        <section className="col-span-12 sm:col-span-9 lg:col-span-10">{children}</section>
      </div>
    </div>
  );
}
