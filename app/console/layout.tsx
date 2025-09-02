
"use client";
import type { ReactNode } from 'react';

import NavItem from '../../components/ui/NavItem';

export default function ConsoleLayout({ children }: { children: ReactNode }) {
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
            <NavItem active label="Projects" codexId="nav_dashboard" />
            <NavItem label="Chat" codexId="nav_chat" />
            <NavItem label="Documents" codexId="nav_documents" />
            <NavItem label="Prompt Builder" codexId="nav_prompt_builder" />
            <NavItem label="Observabilité" codexId="nav_observabilite" />
          </nav>
        </aside>
        <section className="col-span-12 sm:col-span-9 lg:col-span-10">{children}</section>
      </div>
    </div>
  );
}
