import React from "react";

export type ObsRow = { axe: string; kpi: string; objectif: string };
export const ObsTable: React.FC<{ rows: ObsRow[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm" style={{ color: "var(--arka-text)" }}>
      <thead>
        <tr className="text-left" style={{ color: "var(--arka-text-muted)" }}>
          <th className="px-2 py-1">Axe</th>
          <th className="px-2 py-1">KPI</th>
          <th className="px-2 py-1">Objectif</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={r.axe + i}
            className="border-t"
            style={{ borderColor: "var(--arka-border)" }}
          >
            <td className="px-2 py-1">{r.axe}</td>
            <td
              className="px-2 py-1"
              style={{ color: "var(--arka-text-muted)" }}
            >
              {r.kpi}
            </td>
            <td
              className="px-2 py-1 font-semibold"
              style={{ color: "var(--arka-text)" }}
            >
              {r.objectif}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
