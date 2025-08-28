import type { Meta, StoryObj } from "@storybook/react";
import { ObsTable, type ObsRow } from "../../src/ui/obs/ObsTable";

export default { title: "Observabilité/Table Lot", component: ObsTable } as Meta<typeof ObsTable>;
type Story = StoryObj<typeof ObsTable>;

const rowsM1: ObsRow[] = [
  { axe: "Conformité contractuelle", kpi: "% endpoints YAML 1er jet", objectif: ">80%" },
  { axe: "Cycles correctifs", kpi: "Itérations QA avant PASS", objectif: "≤2" },
  { axe: "Performance", kpi: "P95 login/projects/health", objectif: "≤2s / ≤2s / ≤1.5s" },
  { axe: "Sécurité", kpi: "% routes JSON Schema + RBAC", objectif: "100%" },
  { axe: "Logs", kpi: "% routes logguées", objectif: "100%" },
  { axe: "Ratelimits", kpi: "Respect codes 200/202 vs 429", objectif: "100%" },
];

const rowsM2: ObsRow[] = [
  { axe: "Performance", kpi: "P95 génération", objectif: "<1s" },
  { axe: "Stabilité", kpi: "Incidents majeurs", objectif: "0" },
];

export const LotM1: Story = { args: { rows: rowsM1 } };
export const LotM2: Story = { args: { rows: rowsM2 } };
