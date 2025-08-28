import type { Meta, StoryObj } from "@storybook/react";
import { ObsKpiCard } from "../src/ui/obs/ObsKpiCard";
import { ObsTable, type ObsRow } from "../src/ui/obs/ObsTable";

export default { title: "Observabilité/MVP" } as Meta;

export const KPISet: StoryObj = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <ObsKpiCard label="TTFT chat" value={680} unit="ms" />
      <ObsKpiCard
        label="RTT voix"
        value={1450}
        unit="ms"
        gradient="linear-gradient(135deg,#F25636 0%,#E0026D 100%)"
      />
      <ObsKpiCard
        label="% erreurs"
        value={1.2}
        unit="%"
        gradient="linear-gradient(135deg,#E0026D 0%,#E0026D 100%)"
      />
    </div>
  ),
};

const rowsM1: ObsRow[] = [
  { axe: 'Conformité contractuelle', kpi: "% d’endpoints conformes YAML au 1er jet", objectif: '>80%' },
  { axe: 'Cycles correctifs', kpi: "Nombre d’itérations QA avant PASS", objectif: '≤2' },
  { axe: 'Performance', kpi: 'P95 login / projects / health', objectif: '≤2s / ≤2s / ≤1.5s' },
  { axe: 'Sécurité', kpi: '% de routes avec validation stricte (JSON Schema + RBAC)', objectif: '100%' },
  { axe: 'Logs', kpi: '% de routes logguées avec champs obligatoires', objectif: '100%' },
  { axe: 'Ratelimits', kpi: 'Respect codes (200/202 vs 429)', objectif: '100%' },
];

const rowsM2: ObsRow[] = [
  { axe: 'Performance', kpi: 'P95 génération', objectif: '<1s' },
  { axe: 'Stabilité', kpi: 'Incidents majeurs', objectif: '0' },
];

export const TableLotM1: StoryObj = { render: () => <ObsTable rows={rowsM1} /> };
export const TableLotM2: StoryObj = { render: () => <ObsTable rows={rowsM2} /> };
