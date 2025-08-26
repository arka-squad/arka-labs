import type { Meta, StoryObj } from "@storybook/react";
import { ObsTable, type ObsRow } from "../../../../src/ui/ObsTable";

export default { title: "Observabilité/Table Lot", component: ObsTable } as Meta<typeof ObsTable>;
type Story = StoryObj<typeof ObsTable>;

const rows: ObsRow[] = [
  { axe: "Conformité contractuelle", kpi: "% endpoints YAML 1er jet", objectif: ">80%" },
  { axe: "Cycles correctifs", kpi: "Itérations QA avant PASS", objectif: "≤2" },
  { axe: "Performance", kpi: "P95 login/projects/health", objectif: "≤2s / ≤2s / ≤1.5s" },
  { axe: "Sécurité", kpi: "% routes JSON Schema + RBAC", objectif: "100%" },
  { axe: "Logs", kpi: "% routes logguées", objectif: "100%" },
  { axe: "Ratelimits", kpi: "Respect codes 200/202 vs 429", objectif: "100%" },
];

export const LotM1: Story = { args: { rows } };
