'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import NavItem from '../../components/ui/NavItem';

const NAV_ITEMS = [
  { id: 'console-dashboard', label: 'Dashboard', href: '/console/dashboard' },
  { id: 'console-chat', label: 'Chat', href: '/console/chat' },
  { id: 'console-documents', label: 'Documents', href: '/console/documents' },
  { id: 'console-prompt-builder', label: 'Prompt Builder', href: '/console/prompt-builder' },
  { id: 'console-observabilite', label: 'Observabilité', href: '/console/observabilite' },
];

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#0C1319] text-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
        <aside className="col-span-12 sm:col-span-3 lg:col-span-2">
          <nav className="sticky top-6 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                id={item.id}
                href={item.href}
                label={item.label}
                data-codex-id={item.id}
                active={pathname === item.href}
              />
            ))}
          </nav>
        </aside>
        <section className="col-span-12 sm:col-span-9 lg:col-span-10">{children}</section>
      </div>
    </div>
  );
}
