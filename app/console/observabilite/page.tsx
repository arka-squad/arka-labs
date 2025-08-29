'use client';
import { useState, useEffect } from 'react';
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
        headers: { 'X-Trace-Id': traceId },
      });
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
        { headers: { 'X-Trace-Id': traceId } }
      );
      const data = await res.json();
      setRows(data.runs);
      setTotal(data.total);
    };
    loadRuns();
  }, [lot, sprint, page]);

  const cards = [
    {
      label: 'TTFT',
      value: kpis.ttft_ms.toFixed(1),
      unit: 'ms',
      gradient: 'var(--arka-grad-ttft)',
    },
    {
      label: 'RTT',
      value: kpis.rtt_ms.toFixed(1),
      unit: 'ms',
      gradient: 'var(--arka-grad-rtt)',
    },
    {
      label: '% Err',
      value: kpis.error_rate_percent.toFixed(1),
      unit: '%',
      gradient: 'var(--arka-grad-err)',
    },
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

      <ObsRunsTable rows={rows} page={page} total={total} onPage={setPage} />
    </div>
  );
}
