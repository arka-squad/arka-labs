import React from "react"; import { COLOR, GRADIENT } from "../tokens";
export const ChatMessage: React.FC<{ role:'user'|'agent'|'system'; content:string; streaming?:boolean }> = ({ role, content, streaming }) => (
  <li className="flex items-start gap-3">
    <div className={`mt-1 grid h-8 w-8 place-items-center rounded-lg ${role==='user'?'bg-slate-600 text-white': role==='agent'?'text-white':'bg-slate-800 text-white'}`} style={role==='agent'?{ background: GRADIENT }:undefined}>
      {role==='user'? 'U' : role==='agent'? 'A' : 'S'}
    </div>
    <div className="flex-1">
      <div className="rounded-2xl border p-3 text-sm" style={{ borderColor: COLOR.border, background: COLOR.block }}>
        <p className="whitespace-pre-wrap leading-relaxed">{content}{streaming && <span className="ml-0.5 inline-block animate-pulse">▌</span>}</p>
      </div>
    </div>
  </li>
);
