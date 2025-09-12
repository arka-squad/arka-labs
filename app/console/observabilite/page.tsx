'use client';
import { useState, useEffect, useMemo } from 'react';
import { ObsKpiCard } from '../../../src/ui/ObsKpiCard';
import { ObsRunsTable, type RunRow } from '../../../src/ui/ObsRunsTable';
import { uiLog } from '../../../lib/ui-log';
import { useRole } from '../../../src/role-context';

export default function ObservabilitePage() {
  const [lot, setLot] = useState<'M1' | 'M2'>('M1');
  const [sprint, setSprint] = useState<'S1' | 'S2'>('S1');
  const [kpis, setKpis] = useState({ ttft_ms: 0, rtt_ms: 0, error_rate_percent: 0 });
  const [rows, setRows] = useState<RunRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const { role } = useRole();

  useEffect(() => {
    uiLog('mount', { role });
  }, [role]);

  useEffect(() => {
    uiLog('filter', { lot, sprint, role, page });
  }, [lot, sprint, role, page]);

  useEffect(() => {
    const loadKpis = async () => {
      const traceId = crypto.randomUUID();
      const res = await fetch(`/api/metrics/kpis?lot=${lot}&sprint=${sprint}`, {
        headers: { 'X-Trace-Id': traceId ,
        credentials: 'include'}});
      const data = await res.json();
      setKpis(data);
    };
    loadKpis();
  }, [lot, sprint]);

  useEffect(() => {
    const loadRuns = async () => {
      const traceId = crypto.randomUUID();
      const res = await fetch(
        `/api/metrics/runs?lot=${lot}&sprint=${sprint}&page=${page}&limit=${limit}`,
        { headers: { 'X-Trace-Id': traceId ,
        credentials: 'include'} }
      );
      const data = await res.json();
      setRows(data.runs);
      setTotal(data.total);
    };
    loadRuns();
  }, [lot, sprint, page]);

  const spark = useMemo(() => {
    const values = rows.map((r) => r.ttft_ms);
    const w = 300, h = 72, pad = 4;
    if (values.length === 0) return { w, h, d: '' };
    const min = Math.min(...values), max = Math.max(...values) || 1;
    const norm = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    const step = values.length === 1 ? 0 : (w - pad * 2) / (values.length - 1);
    const pts = values.map((v, i) => `${pad + i * step},${norm(v)}`).join(' ');
    return { w, h, d: pts };
  }, [rows]);

  const cards = [
    {
      label: 'TTFT',
      value: kpis.ttft_ms.toFixed(1),
      unit: 'ms',
      gradient: 'var(--arka-grad-ttft)'},
    {
      label: 'RTT',
      value: kpis.rtt_ms.toFixed(1),
      unit: 'ms',
      gradient: 'var(--arka-grad-rtt)'},
    {
      label: '% Err',
      value: kpis.error_rate_percent.toFixed(1),
      unit: '%',
      gradient: 'var(--arka-grad-err)'},
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <label className="text-sm">
          Lot
          <select
            value={lot}
            onChange={(e) => {
              setLot(e.target.value as 'M1' | 'M2');
              setPage(1);
            }}
            className="ml-2 rounded-md bg-slate-800 px-2 py-1 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
          >
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>
        </label>
        <label className="text-sm">
          Sprint
          <select
            value={sprint}
            onChange={(e) => {
              setSprint(e.target.value as 'S1' | 'S2');
              setPage(1);
            }}
            className="ml-2 rounded-md bg-slate-800 px-2 py-1 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
          >
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((k) => (
          <ObsKpiCard key={k.label} {...k} />
        ))}
      </div>

      <section className="rounded-xl border p-4" style={{ borderColor: 'var(--arka-border)', background: 'var(--arka-card)' }}>
        <h3 className="mb-2 text-sm font-semibold">TTFT (ms) — sparkline</h3>
        {rows.length === 0 ? (
          <div className="text-xs text-slate-400">Aucune donnée à afficher.</div>
        ) : (
          <svg width={spark.w} height={spark.h} role="img" aria-label="Graphe TTFT">
            <polyline fill="none" stroke="#FAB652" strokeWidth="2" points={spark.d} />
          </svg>
        )}
      </section>

      <ObsRunsTable rows={rows} page={page} total={total} onPage={setPage} />
    </div>
  );
}
