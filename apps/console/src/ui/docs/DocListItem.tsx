import React from "react"; import { COLOR } from "../tokens";
export const DocListItem: React.FC<{ name:string; type:string; size:number; tags?:string[]; onDelete?:()=>void }> = ({ name, type, size, tags=[], onDelete }) => (
  <li className="flex items-center justify-between gap-2 px-4 py-3 text-sm" style={{ background: '#151F27', borderBottom: `1px solid ${COLOR.border}` }}>
    <div className="flex flex-col overflow-hidden">
      <span className="truncate text-white">{name}</span>
      <span className="text-xs" style={{ color: COLOR.textMuted }}>{type} · {(size/1024).toFixed(1)}KB</span>
    </div>
    <div className="flex items-center gap-2">
      {tags.map(t=> <span key={t} className="rounded-full px-3 py-1 text-xs" style={{ background: '#151F27', border:`1px solid ${COLOR.border}`, color:'#E5E7EB' }}>{t}</span>)}
      {onDelete && <button onClick={onDelete} className="rounded-lg px-2 py-1 text-xs text-white" style={{ background: COLOR.border }}>Supprimer</button>}
    </div>
  </li>
);
