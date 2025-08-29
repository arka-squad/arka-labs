'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uiLog } from '../../lib/ui-log';
import { KpiMiniCard } from '../../src/ui/KpiMiniCard';
import { useRole } from '../../src/role-context';

export default function ConsoleDashboard() {
  const router = useRouter();
  const { role } = useRole();
  useEffect(() => {
    uiLog('mount', { role });
  }, [role]);
  const kpis = [
    { label: 'TTFT', value: 680, unit: 'ms', background: 'var(--arka-grad-ttft)' },
    { label: 'RTT', value: 1200, unit: 'ms', background: 'var(--arka-grad-rtt)' },
    { label: '% Err', value: 5, unit: '%', background: 'var(--arka-grad-err)' },
  ];
  const projects = [{ name: 'Projet Alpha', last: 'hier', agents: 3 }];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k) => (
          <KpiMiniCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p.name}
            className="flex min-h-[180px] flex-col rounded-xl border p-4"
            style={{ backgroundColor: 'var(--arka-card)', borderColor: 'var(--arka-border)' }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-sm text-slate-300">
                Dernière activité: {p.last} · {p.agents} agents
              </p>
            </div>
            <div className="mt-auto flex gap-4">
              <button
                aria-label="Ouvrir chat"
                onClick={() => {
                  uiLog('cta_card', { to: '/console/chat', role });
                  router.push('/console/chat');
                }}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
              >
                Chat
              </button>
              <button
                aria-label="Documents"
                onClick={() => {
                  uiLog('cta_card', { to: '/console/documents', role });
                  router.push('/console/documents');
                }}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
              >
                Docs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

