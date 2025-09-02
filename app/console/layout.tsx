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


const NAV_ITEMS = [
  { id: 'console-dashboard', label: 'Dashboard', href: '/console/dashboard' },
  { id: 'console-chat', label: 'Chat', href: '/console/chat' },
  { id: 'console-documents', label: 'Documents', href: '/console/documents' },
  { id: 'console-prompt-builder', label: 'Prompt Builder', href: '/console/prompt-builder' },
  { id: 'console-observabilite', label: 'Observabilité', href: '/console/observabilite' },
];


  return (
    <div className="min-h-screen bg-[#0C1319] text-slate-100">
      <header className="border-b border-slate-700/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="/" data-codex-id="topbar_logo" className="text-lg font-semibold">
            Arka
          </a>
          <div className="flex items-center gap-2">
            <select
              data-codex-id="project_selector"
              className="rounded-md bg-slate-800 px-2 py-1 text-sm text-white"
            >
              <option>Aucun projet — créez-en un</option>
            </select>
            <button
              data-codex-id="btn_theme"
              className="rounded-md bg-slate-800 px-2 py-1 text-sm"
              onClick={() => alert('theme')}
            >
              🎨
            </button>
            <button
              data-codex-id="btn_settings"
              className="rounded-md bg-slate-800 px-2 py-1 text-sm"
              onClick={() => alert('settings')}
            >
              ⚙️
            </button>
            <button
              data-codex-id="topbar_logout"
              className="rounded-md bg-slate-800 px-2 py-1 text-sm"
              onClick={() => alert('logout')}
            >
              ⎋
            </button>
          </div>
        </div>
      </header>
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
