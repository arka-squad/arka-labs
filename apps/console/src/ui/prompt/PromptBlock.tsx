import React from "react"; import { COLOR, GRADIENT } from "../tokens";
export const PromptBlock: React.FC<{ titre:string; valeur:string; declencheur:string; role?:'viewer'|'operator'|'owner'; onRemove?:()=>void }>=({titre,valeur,declencheur,role='owner',onRemove})=> (
  <li className="rounded-2xl border p-4" style={{ background: COLOR.block, borderColor: COLOR.border }}>
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="rounded-full px-3 py-1 text-xs" style={{ background: COLOR.block, border:`1px solid ${COLOR.border}`, color: COLOR.text }}>{titre}</span>
      <span className="rounded-full px-3 py-1 text-xs text-white" style={{ background: GRADIENT }}>versionné</span>
      {role==='viewer' && <span className="rounded-full px-2 py-1 text-[10px]" style={{ background: COLOR.body, border:`1px solid ${COLOR.border}`, color: COLOR.textMuted }}>lecture seule</span>}
    </div>
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="text-xs font-medium text-white">Valeur
        <textarea disabled={role==='viewer'} className="mt-1 w-full resize-y rounded-xl border px-2 py-2 text-sm outline-none focus:ring-1" style={{ background: COLOR.body, borderColor: COLOR.border }} defaultValue={valeur} rows={3} />
      </label>
      <label className="text-xs font-medium text-white">Déclencheur
        <input disabled={role==='viewer'} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-1" style={{ background: COLOR.body, borderColor: COLOR.border }} defaultValue={declencheur} />
      </label>
    </div>
    {role!=='viewer' && onRemove && (
      <div className="mt-2 text-right">
        <button
          onClick={onRemove}
          aria-label="Supprimer"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white"
          style={{ background: COLOR.border }}
        >
          <span aria-hidden="true">×</span>Supprimer
        </button>
      </div>
    )}
  </li>
);
