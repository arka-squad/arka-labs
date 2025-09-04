'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/http';
import { generateTraceId, TRACE_HEADER } from '../../../lib/trace';

type Project = { id: string; name: string; description: string; last_activity: string };

function since(ts: string) {
  const d = Math.max(0, Date.now() - new Date(ts).getTime());
  const m = Math.floor(d / 60000), h = Math.floor(m / 60), dd = Math.floor(h / 24);
  if (dd) return `il y a ${dd} j`;
  if (h) return `il y a ${h} h`;
  if (m) return `il y a ${m} min`;
  return "à l'instant";
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [err, setErr] = useState('');
  const [health, setHealth] = useState<'ok' | 'ko' | 'loading'>('loading');
  const [kpis, setKpis] = useState<{ p95_ttft_ms?: number; p95_rtt_ms?: number; error_rate_percent?: number } | null>(null);

  useEffect(() => {
    const trace_id = generateTraceId();
    apiFetch('/api/projects', { credentials: 'include', headers: { [TRACE_HEADER]: trace_id } })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setProjects(d.projects || []))
      .catch(() => { setErr('Erreur de récupération'); setProjects([]); });

    apiFetch('/api/health')
      .then((r) => setHealth(r.ok ? 'ok' : 'ko'))
      .catch(() => setHealth('ko'));

    apiFetch('/api/metrics/kpis', { headers: { [TRACE_HEADER]: trace_id } })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => setKpis(d || {}))
      .catch(() => setKpis({}));
  }, []);

  const content = useMemo(() => {
    if (projects === null) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4" />
          ))}
        </div>
      );
    }
    if (!projects.length) {
      return (
        <div className="mx-auto max-w-md text-center">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8">
            <h3 className="mb-2 text-lg font-semibold">Aucun projet</h3>
            <p className="mb-4 text-sm text-slate-400">Créez votre premier projet pour commencer.</p>
            <button
              className="rounded-xl px-4 py-2 text-white"
              style={{ background: 'linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)' }}
              onClick={() => alert('POST /api/projects (à brancher)')}
            >
              Créer un projet
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
            <div className="mb-1 text-base font-semibold">{p.name}</div>
            <div className="mb-3 text-sm text-slate-300">{p.description || '-'}</div>
            <div className="text-xs text-slate-400">Dernière activité · {since(p.last_activity)}</div>
          </div>
        ))}
      </div>
    );
  }, [projects]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-slate-200">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 bg-clip-text text-2xl font-bold text-transparent">Dashboard</h1>
        <HealthChip state={health} />
      </header>
      {err && <div className="mb-4 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-2 text-sm text-rose-200">{err}</div>}

      {/* KPIs cards */}
      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="p95 TTFT" value={kpis?.p95_ttft_ms ?? '-'} unit="ms" />
        <KpiCard label="p95 RTT" value={kpis?.p95_rtt_ms ?? '-'} unit="ms" />
        <KpiCard label="Erreur" value={kpis?.error_rate_percent ?? '-'} unit="%" />
      </section>

      {content}
    </main>
  );
}

function KpiCard({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
      <div className="text-xs text-slate-300">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">
        {value}
        {typeof value !== 'string' && unit ? <span className="ml-1 text-sm font-medium text-slate-300">{unit}</span> : null}
      </div>
    </div>
  );
}

function HealthChip({ state }: { state: 'ok' | 'ko' | 'loading' }) {
  const color = state === 'ok' ? 'bg-emerald-600' : state === 'ko' ? 'bg-rose-600' : 'bg-slate-600';
  const label = state === 'ok' ? 'Healthy' : state === 'ko' ? 'Down' : 'Loading';
  return (
    <span aria-live="polite" className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${color}`}>
      <span className="h-2 w-2 rounded-full bg-white" />
      {label}
    </span>
  );
}

