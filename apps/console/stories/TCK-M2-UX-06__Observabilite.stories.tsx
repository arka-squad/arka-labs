import type { Meta, StoryObj } from "@storybook/react";
import { KpiMiniCard } from "../../../src/ui/KpiMiniCard";
import { ObsTable, type ObsRow } from "../../../src/ui/ObsTable";

export default { title: "Observabilité/MVP" } as Meta;

export const KPISet: StoryObj = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <KpiMiniCard label="TTFT" value={680} unit="ms" background="var(--arka-grad-ttft)" />
      <KpiMiniCard label="RTT" value={1450} unit="ms" background="var(--arka-grad-rtt)" />
      <KpiMiniCard label="% Err" value={1.2} unit="%" background="var(--arka-grad-err)" />
    </div>
  ),
};

const rows: ObsRow[] = [
  { axe: 'Conformité contractuelle', kpi: '% endpoints YAML 1er jet', objectif: '>80%' },
  { axe: 'Cycles correctifs', kpi: 'Itérations QA avant PASS', objectif: '≤2' },
  { axe: 'Performance', kpi: 'P95 login/projects/health', objectif: '≤2s / ≤2s / ≤1.5s' },
  { axe: 'Sécurité', kpi: '% routes JSON Schema + RBAC', objectif: '100%' },
  { axe: 'Logs', kpi: '% routes logguées', objectif: '100%' },
  { axe: 'Ratelimits', kpi: 'Respect codes 200/202 vs 429', objectif: '100%' },
];

export const TableLotM1: StoryObj = { render: () => <ObsTable rows={rows} /> };
