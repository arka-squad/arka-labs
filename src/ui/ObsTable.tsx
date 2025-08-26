import React from "react";

export type ObsRow = { axe: string; kpi: string; objectif: string };
export const ObsTable: React.FC<{ rows: ObsRow[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-400">
          <th className="px-2 py-1">Axe</th>
          <th className="px-2 py-1">KPI</th>
          <th className="px-2 py-1">Objectif</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.axe + i} className="border-t border-slate-700/40">
            <td className="px-2 py-1">{r.axe}</td>
            <td className="px-2 py-1 text-slate-300">{r.kpi}</td>
            <td className="px-2 py-1 font-semibold text-white">{r.objectif}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
