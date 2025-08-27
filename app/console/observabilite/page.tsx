'use client';
import { useState, useEffect } from 'react';
import { KpiMiniCard } from '../../../src/ui/KpiMiniCard';
import { ObsTable, ObsRow } from '../../../src/ui/ObsTable';
import { uiLog } from '../../../lib/ui-log';

const data: Record<string, ObsRow[]> = {
  M1: [
    { axe: 'Conformité contractuelle', kpi: '% endpoints YAML 1er jet', objectif: '>80%' },
    { axe: 'Cycles correctifs', kpi: 'Itérations QA avant PASS', objectif: '≤2' },
    { axe: 'Performance', kpi: 'P95 login/projects/health', objectif: '≤2s / ≤2s / ≤1.5s' },
    { axe: 'Sécurité', kpi: '% routes JSON Schema + RBAC', objectif: '100%' },
    { axe: 'Logs', kpi: '% routes logguées', objectif: '100%' },
    { axe: 'Ratelimits', kpi: 'Respect codes 200/202 vs 429', objectif: '100%' },
  ],
  M2: [],
};

export default function ObservabilitePage() {
  const [lot, setLot] = useState<'M1' | 'M2'>('M1');
  const [sprint, setSprint] = useState('S1');
  useEffect(() => {
    uiLog('mount');
  }, []);
  useEffect(() => {
    uiLog('filter', { lot, sprint });
  }, [lot, sprint]);
  const kpis = [
    { label: 'TTFT', value: 680, unit: 'ms', background: 'linear-gradient(135deg,#FAB652 0%,#F25636 50%)' },
    { label: 'RTT', value: 1200, unit: 'ms', background: 'linear-gradient(135deg,#F25636 0%,#E0026D 100%)' },
    { label: '% Err', value: 5, unit: '%', background: 'linear-gradient(135deg,#E0026D 0%,#E0026D 100%)' },
  ];
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <label className="text-sm">
          Lot
          <select value={lot} onChange={(e) => setLot(e.target.value as any)} className="ml-2 rounded-md bg-slate-800 px-2 py-1">
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>
        </label>
        <label className="text-sm">
          Sprint
          <select value={sprint} onChange={(e) => setSprint(e.target.value)} className="ml-2 rounded-md bg-slate-800 px-2 py-1">
            <option>S1</option>
            <option>S2</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k) => (
          <KpiMiniCard key={k.label} {...k} />
        ))}
      </div>
      <ObsTable rows={data[lot]} />
    </div>
  );
}
