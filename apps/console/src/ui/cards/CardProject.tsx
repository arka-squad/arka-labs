import React from "react"; import { COLOR } from "../tokens";
export const CardProject: React.FC<{ name:string; last:string; agents:number; right?:React.ReactNode }>=({name,last,agents,right})=> (
  <div className="rounded-2xl border p-4" style={{ background: COLOR.block, borderColor: COLOR.border }}>
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-base font-bold text-white">{name}</h4>
        <p className="text-xs" style={{ color: COLOR.textMuted }}>Dernière activité {last}</p>
      </div>
      <span className="rounded-full px-3 py-1 text-xs" style={{ background: COLOR.block, border:`1px solid ${COLOR.border}`, color: COLOR.text }}>{agents} agents</span>
    </div>
    {right && <div className="mt-3 flex gap-2">{right}</div>}
  </div>
);
