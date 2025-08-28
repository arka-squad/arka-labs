'use client';
import { useState, useEffect } from 'react';
import { ObsKpiCard } from '../../../src/ui/ObsKpiCard';
import { ObsTable, type ObsRow } from '../../../src/ui/ObsTable';
import { uiLog } from '../../../lib/ui-log';
import { useRole } from '../../../src/role-context';

const data: Record<'M1' | 'M2', Record<'S1' | 'S2', ObsRow[]>> = {
  M1: {
    S1: [
      { axe: 'Conformité contractuelle', kpi: '% endpoints YAML 1er jet', objectif: '>80%' },
      { axe: 'Cycles correctifs', kpi: 'Itérations QA avant PASS', objectif: '≤2' },
      { axe: 'Performance', kpi: 'P95 login/projects/health', objectif: '≤2s / ≤2s / ≤1.5s' },
      { axe: 'Sécurité', kpi: '% routes JSON Schema + RBAC', objectif: '100%' },
      { axe: 'Logs', kpi: '% routes logguées', objectif: '100%' },
      { axe: 'Ratelimits', kpi: 'Respect codes 200/202 vs 429', objectif: '100%' },
    ],
    S2: [
      { axe: 'Refactoring', kpi: 'Dette résorbée', objectif: '80%' },
      { axe: 'Qualité', kpi: 'Couverture tests', objectif: '90%' },
    ],
  },
  M2: {
    S1: [
      { axe: 'Performance', kpi: 'P95 génération', objectif: '<1s' },
      { axe: 'Stabilité', kpi: 'Incidents majeurs', objectif: '0' },
    ],
    S2: [],
  },
};

export default function ObservabilitePage() {
  const [lot, setLot] = useState<'M1' | 'M2'>('M1');
  const [sprint, setSprint] = useState<'S1' | 'S2'>('S1');
  const { role } = useRole();

  useEffect(() => {
    uiLog('mount', { role });
  }, [role]);

  useEffect(() => {
    uiLog('filter', { lot, sprint, role });
  }, [lot, sprint, role]);

  const kpis = [
    { label: 'TTFT', value: 680, unit: 'ms', gradient: 'var(--arka-grad-ttft)' },
    { label: 'RTT', value: 1200, unit: 'ms', gradient: 'var(--arka-grad-rtt)' },
    { label: '% Err', value: 5, unit: '%', gradient: 'var(--arka-grad-err)' },
  ];

  const rows = data[lot][sprint] || [];

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <label className="text-sm">
          Lot
          <select
            value={lot}
            onChange={(e) => setLot(e.target.value as 'M1' | 'M2')}
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
            onChange={(e) => setSprint(e.target.value as 'S1' | 'S2')}
            className="ml-2 rounded-md bg-slate-800 px-2 py-1 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
          >
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k) => (
          <ObsKpiCard key={k.label} {...k} />
        ))}
      </div>
      <ObsTable rows={rows} />
    </div>
  );
}
