'use client';

import { useState } from 'react';
import NavItem from '../../components/ui/NavItem';
import ProjectsPage from './page';
import ChatPage from './chat/page';
import DocumentsPage from './documents/page';
import ObservabilitePage from './observabilite/page';
import PromptBuilderPage from './prompt-builder/page';

const tabs = {
  projects: ProjectsPage,
  chat: ChatPage,
  documents: DocumentsPage,
  observabilite: ObservabilitePage,
  'prompt-builder': PromptBuilderPage,
} as const;

type TabKey = keyof typeof tabs;

export default function ConsoleLayout() {
  const [tab, setTab] = useState<TabKey>('projects');
  const Current = tabs[tab];

  return (
    <div className="min-h-screen bg-[#0C1319] text-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
        <aside className="col-span-12 sm:col-span-3 lg:col-span-2">
          <nav className="sticky top-6 space-y-2">
            <NavItem active={tab === 'projects'} label="Projects" onClick={() => setTab('projects')} />
            <NavItem active={tab === 'chat'} label="Chat" onClick={() => setTab('chat')} />
            <NavItem active={tab === 'documents'} label="Documents" onClick={() => setTab('documents')} />
            <NavItem active={tab === 'observabilite'} label="Observabilité" onClick={() => setTab('observabilite')} />
            <NavItem active={tab === 'prompt-builder'} label="Prompt Builder" onClick={() => setTab('prompt-builder')} />
          </nav>
        </aside>
        <section className="col-span-12 sm:col-span-9 lg:col-span-10">
          <div key={tab} className="animate-fade-in-up">
            <Current />
          </div>
        </section>
      </div>
    </div>
  );
}
