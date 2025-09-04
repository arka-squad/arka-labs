'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/http';
import { generateTraceId, TRACE_HEADER } from '../../lib/trace';

export default function DashboardPage() {
  const [health, setHealth] = useState<'ok' | 'ko' | 'loading'>('loading');
  const [kpis, setKpis] = useState<{ p95_ttft_ms?: number; p95_rtt_ms?: number; error_rate_percent?: number } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const trace_id = generateTraceId();
    apiFetch('/api/health')
      .then((r) => setHealth(r.ok ? 'ok' : 'ko'))
      .catch(() => setHealth('ko'));

    apiFetch('/api/metrics/kpis', { headers: { [TRACE_HEADER]: trace_id } })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => setKpis(d || {}))
      .catch(() => setKpis({}));
  }, []);

  const content = useMemo(() => {
    // FAKE_DATA: dashboard placeholders until B13 rollout
    const fakeTrend = {
      ttft: [1.6, 1.5, 1.7, 1.55, 1.48, 1.52, 1.5],
      rtt: [3.4, 3.2, 3.5, 3.3, 3.1, 3.25, 3.2],
      err: [0.9, 0.8, 1.0, 0.7, 0.8, 0.9, 0.8],
    };
    const fakeRoadmap = [
      { id: 'R1-1', label: 'Console core', from: 1, to: 3, color: '#6EE7B7' },
      { id: 'OBS-2', label: 'Observabilité', from: 2, to: 4, color: '#93C5FD' },
      { id: 'EPIC-7', label: 'Builder v1', from: 4, to: 6, color: '#FDE68A' },
      { id: 'POL-12', label: 'Policies', from: 5, to: 7, color: '#FCA5A5' },
      { id: 'ADR-9', label: 'ADR set', from: 6, to: 8, color: '#F0ABFC' },
      { id: 'PRC-7', label: 'Process lib', from: 7, to: 9, color: '#FDBA74' },
    ];
    const fakeRoster = [
      { id: 'AGP', role: 'A', name: 'AGP - Arka v2.5', pct: 65, tags: ['EPIC-42', 'EPIC-7', 'perf', 'POL-12'] },
      { id: 'QA-ARC', role: 'Q', name: 'QA-ARC â€“ R2.5', pct: 80, tags: ['EPIC-13'] },
      { id: 'PMO', role: 'P', name: 'PMO â€“ Console', pct: 55, tags: ['EPIC-31', 'PROC-7'] },
      { id: 'UX', role: 'U', name: 'UX/UI â€“ v12', pct: 40, tags: ['EPIC-55', 'EPIC-68', 'perf', 'ADR-9'] },
    ];
    const fakeRuns = Array.from({ length: 12 }).map((_, i) => {
      const id = 1833 - i;
      const pass = i % 5 !== 0;
      const p95 = pass ? 1500 + (i % 7) * 40 : 3100;
      const err = pass ? 0.8 : 2.1;
      const sprint = `S-${14 + (i % 3)}`;
      const trace = Math.random().toString(36).slice(2, 7);
      return { run_id: `#R-${id}`, status: (pass ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL', p95_ms: p95, error_pct: err, sprint, trace_id: trace };
    });

    return (
      <div className="space-y-6" data-codex-fake="dashboard_v1">
        {/* KPI cards with sparklines */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard label="ttft_p95" value={kpis?.p95_ttft_ms ?? 1500} unit="ms">
            <Sparkline values={fakeTrend.ttft} color="#22D3EE" minLabel="Min 1.5ms" maxLabel="Max 1.7ms" />
          </KpiCard>
          <KpiCard label="rtt_p95" value={kpis?.p95_rtt_ms ?? 3200} unit="ms">
            <Sparkline values={fakeTrend.rtt} color="#A78BFA" minLabel="Min 3.1ms" maxLabel="Max 3.4ms" />
          </KpiCard>
          <KpiCard label="errors_p95" value={kpis?.error_rate_percent ?? 0.8} unit="%">
            <Sparkline values={fakeTrend.err} color="#34D399" minLabel="Min 0.7%" maxLabel="Max 1.0%" />
          </KpiCard>
        </section>

        {/* Timeline + Roster */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-200">Roadmap</div>
            <Timeline items={fakeRoadmap} />
          </div>
          <div className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-200">Roster à risque</div>
            <RosterList items={fakeRoster} />
          </div>
        </section>

        {/* Runs table */}
        <section className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Derniers runs (20/l)</div>
            <button className="rounded-xl border px-3 py-1 text-xs text-slate-200" style={{ borderColor: '#1F2A33' }}>Filtres</button>
          </div>
          <RunsTable rows={fakeRuns} />
        </section>
      </div>
    );
  }, [kpis]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-slate-200">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 bg-clip-text text-2xl font-bold text-transparent">Dashboard</h1>
        <HealthChip state={health} />
      </header>
      {err && <div className="mb-4 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-2 text-sm text-rose-200">{err}</div>}

      {content}
    </main>
  );
}

function KpiCard({ label, value, unit, children }: { label: string; value: number | string; unit?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
      <div className="text-xs text-slate-300">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">
        {value}
        {typeof value !== 'string' && unit ? <span className="ml-1 text-sm font-medium text-slate-300">{unit}</span> : null}
      </div>
      {children ? <div className="mt-2">{children}</div> : null}
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

function Sparkline({ values, color, minLabel, maxLabel }: { values: number[]; color: string; minLabel?: string; maxLabel?: string }) {
  const w = 220, h = 56, pad = 6;
  const min = Math.min(...values), max = Math.max(...values);
  const dx = (w - pad * 2) / Math.max(1, values.length - 1);
  const toY = (v: number) => pad + (h - pad * 2) * (1 - (v - min) / Math.max(0.0001, max - min));
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + dx * i} ${toY(v)}`).join(' ');
  return (
    <div className="flex items-center justify-between gap-2">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <path d={d} fill="none" stroke={color} strokeWidth={2} />
      </svg>
      <div className="text-[10px] text-slate-400">
        {minLabel && <div>{minLabel}</div>}
        {maxLabel && <div className="mt-0.5">{maxLabel}</div>}
      </div>
    </div>
  );
}

function Timeline({ items }: { items: Array<{ id: string; label: string; from: number; to: number; color: string }> }) {
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-3 text-xs">
          <span className="w-28 truncate text-slate-300">{it.label}</span>
          <div className="relative h-2 flex-1 rounded bg-slate-700/40">
            <div className="absolute top-0 h-2 rounded" style={{ left: `${it.from * 8}%`, width: `${Math.max(2, (it.to - it.from) * 8)}%`, background: it.color }} />
          </div>
          <span className="w-10 text-right text-slate-400">{it.id}</span>
        </div>
      ))}
    </div>
  );
}

function RosterList({ items }: { items: Array<{ id: string; role: string; name: string; pct: number; tags: string[] }> }) {
  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.id} className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-700/60 text-[10px] text-white">{m.role}</span>
              <span className="font-medium text-slate-200">{m.name}</span>
            </div>
            <span className="text-slate-300">{m.pct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full" style={{ width: `${m.pct}%`, background: 'linear-gradient(135deg,#FAB652 0%,#F25636 50%,#E0026D 100%)' }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-300">
            {m.tags.map((t) => (
              <span key={t} className="rounded-full border border-slate-700/50 px-2 py-0.5">{t}</span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function RunsTable({ rows }: { rows: Array<{ run_id: string; status: 'PASS' | 'FAIL'; p95_ms: number; error_pct: number; sprint: string; trace_id: string }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-slate-300">
          <tr>
            <th className="px-2 py-2">run_id</th>
            <th className="px-2 py-2">status</th>
            <th className="px-2 py-2">p95 (ms)</th>
            <th className="px-2 py-2">error %</th>
            <th className="px-2 py-2">sprint</th>
            <th className="px-2 py-2">trace_id</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.run_id} className="border-t border-slate-700/30">
              <td className="px-2 py-2 font-mono text-slate-200">{r.run_id}</td>
              <td className="px-2 py-2">
                <span className={`rounded px-2 py-0.5 text-xs ${r.status === 'PASS' ? 'bg-emerald-600/30 text-emerald-300' : 'bg-rose-700/30 text-rose-300'}`}>{r.status}</span>
              </td>
              <td className="px-2 py-2 text-slate-200">{r.p95_ms}</td>
              <td className="px-2 py-2 text-slate-200">{r.error_pct}</td>
              <td className="px-2 py-2 text-slate-300">{r.sprint}</td>
              <td className="px-2 py-2 font-mono"><a className="text-sky-300 hover:underline" href="#">{r.trace_id}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}




