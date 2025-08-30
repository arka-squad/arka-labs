
import type { ReactNode } from 'react';

import NavItem from '../../components/ui/NavItem';

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0C1319] text-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
        <aside className="col-span-12 sm:col-span-3 lg:col-span-2">
          <nav className="sticky top-6 space-y-2">
            <NavItem active label="Projects" />
            <NavItem label="Chat" />
            <NavItem label="Documents" />
            <NavItem label="Observabilité" />
            <NavItem label="Prompt Builder" />
          </nav>
        </aside>
        <section className="col-span-12 sm:col-span-9 lg:col-span-10">{children}</section>
      </div>
    </div>
  );
}
