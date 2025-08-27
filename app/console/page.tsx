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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k) => (
          <KpiMiniCard key={k.label} {...k} />
        ))}
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: 'var(--arka-card)', borderColor: 'var(--arka-border)' }}
      >

        <h2 className="mb-4 text-lg font-semibold">Projet Alpha</h2>
        <p className="mb-4 text-sm text-slate-300">Dernière activité: hier · 3 agents</p>
        <div className="flex gap-4">
          <button
            aria-label="Ouvrir chat"
            onClick={() => {
              uiLog('cta_card', { to: '/console/chat', role });
              router.push('/console/chat');
            }}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"

          >
            Ouvrir chat
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
    </div>
  );
}
