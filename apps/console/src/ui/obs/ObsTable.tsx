import React from "react";
import { COLOR, GRADIENT, RAD } from "../tokens";

export type ObsRow = { axe: string; kpi: string; objectif: string };

export const ObsTable: React.FC<{ rows: ObsRow[] }> = ({ rows }) => (
  <div
    className="overflow-hidden border"
    style={{
      borderColor: COLOR.border,
      background: COLOR.body,
      borderRadius: RAD.xl,
    }}
  >
    <div
      className="grid grid-cols-12 border-b px-3 py-2 text-xs font-semibold"
      style={{ borderColor: COLOR.border, background: COLOR.block }}
    >
      <div className="col-span-3">Axe</div>
      <div className="col-span-6">KPI recommandé</div>
      <div className="col-span-3 text-right">Seuil / objectif</div>
    </div>
    {rows.map((row, i) => (
      <div
        key={row.axe + i}
        className="grid grid-cols-12 px-3 py-3 text-sm"
        style={{
          background: i % 2 ? COLOR.bodyAlt : COLOR.body,
          borderTop: `1px solid ${COLOR.border}`,
        }}
      >
        <div className="col-span-3 pr-2" style={{ color: COLOR.text }}>
          {row.axe}
        </div>
        <div className="col-span-6 pr-2" style={{ color: COLOR.textMuted }}>
          {row.kpi}
        </div>
        <div className="col-span-3 text-right">
          <span
            className="inline-flex items-center px-2 py-1 text-xs font-semibold"
            style={{ background: GRADIENT, borderRadius: RAD.xl, color: COLOR.text }}
          >
            {row.objectif}
          </span>
        </div>
      </div>
    ))}
  </div>
);

