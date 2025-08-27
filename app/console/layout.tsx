'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RoleProvider, useRole } from '../../src/role-context';
import { NavItem } from '../../src/ui/NavItem';
import { uiLog } from '../../lib/ui-log';

const nav = [
  { label: 'Dashboard', href: '/console' },
  { label: 'Chat', href: '/console/chat' },
  { label: 'Documents', href: '/console/documents' },
  { label: 'Prompt Builder', href: '/console/prompt-builder' },
  { label: 'Observabilité', href: '/console/observabilite' },
];

function LayoutShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole } = useRole();

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      uiLog('guard_redirect', { to: '/login', role });
      router.replace('/login');
    }
  }, [router, role]);

  return (
    <div className="flex min-h-screen text-white" style={{ backgroundColor: '#0C1319' }}>
      <aside className="w-48 bg-[#151F27] p-4 space-y-2">
        {nav.map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            active={pathname === item.href}
            aria-current={pathname === item.href ? 'page' : undefined}
            onClick={() => {
              uiLog('nav', { to: item.href, role });
              router.push(item.href);
            }}
          />
        ))}
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-700 p-4">
          <span className="bg-gradient-to-r from-[#FAB652] via-[#F25636] to-[#E0026D] bg-clip-text text-xl font-bold text-transparent">
            Arka Labs
          </span>
          <div className="flex items-center gap-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="rounded-md bg-slate-800 px-2 py-1 text-sm"
            >
              <option value="viewer">viewer</option>
              <option value="operator">operator</option>
              <option value="owner">owner</option>
            </select>
            <button
              aria-label="Déconnexion"
              onClick={() => {
                localStorage.removeItem('token');
                uiLog('logout', { role });
                router.replace('/login');
              }}
              className="rounded-md bg-slate-700 px-2 py-1 text-sm"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <LayoutShell>{children}</LayoutShell>
    </RoleProvider>
  );
}
