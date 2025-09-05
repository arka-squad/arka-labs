"use client";

import { ArrowUpRight, Bell, ExternalLink, Share, Shuffle, UserPlus } from 'lucide-react';

export type Agent = {
  id: string;
  name: string;       // ex: "AGP – Arka v2.5"
  role: string;       // ex: "AGP"
  tz?: string;        // ex: "+01" or "UTC+01"
  status?: 'green'|'orange'|'red';
  load: number;       // 0..1 (fraction)
  missions?: string[];
  risk?: 'perf'|null;
  doc?: string|null;
  kpis?: { ttft: number; pass: number; commits: number };
  meta?: { dispo?: string; oncall?: boolean; conf?: 'A'|'B'|'C'; rbac?: 'V'|'O'|'OW' };
};

export type AgentCardProps = {
  a?: Agent;                     // preferred
  agent?: { id: string; name: string; role?: string; load?: number; status?: string }; // back-compat (legacy)
  dense?: boolean;
  selectable?: boolean;
  onAssign?: (id:string)=>void;
  onPing?: (id:string)=>void;
  onDelegate?: (id:string)=>void;
  onEscalate?: (id:string)=>void;
  onSubstitute?: (id:string)=>void;
  onOpen?: (id:string)=>void;
};

export default function AgentCard(props: AgentCardProps) {
  const a = normalize(props);
  const pct = Math.max(0, Math.min(100, Math.round(a.load * 100)));
  const statusCls = a.status === 'orange' ? 'bg-[var(--warn)]' : a.status === 'red' ? 'bg-[var(--danger)]' : 'bg-[var(--success)]';

  return (
    <div role="group" aria-label={`${a.name} — ${a.role}`} className="rounded-xl border border-soft elevated p-3 relative group">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[10px]">{(a.name || '?').at(0)}</div>
          <div className="truncate text-[var(--fg)]">{a.name}</div>
          <div className="text-xs text-[var(--fgdim)] whitespace-nowrap">· {a.role}</div>
        </div>
        <span className={`w-2 h-2 rounded-full ${statusCls}`} aria-label={`status ${a.status || 'green'}`} />
      </div>

      {/* Load bar */}
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
          <div className="h-2" style={{ backgroundImage: 'var(--brand-grad)', width: `${pct}%` }} />
        </div>
        <span className="tabular-nums text-[var(--fg)]/90 text-xs">{pct}%</span>
      </div>

      {/* Chips */}
      <div className="mt-1.5 flex items-center gap-1.5 text-xs flex-wrap">
        {(a.missions || []).slice(0,2).map((m) => (
          <span key={m} className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90 font-mono">{m}</span>
        ))}
        {a.risk && <span className="px-1.5 py-0.5 rounded bg-[var(--warn)]/10 text-[var(--warn)]">⚠ perf</span>}
        {a.doc && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90">📄 {a.doc}</span>}
      </div>

      {/* Mini KPIs */}
      <div className="mt-1.5 text-xs text-[var(--fgdim)] tabular-nums">
        TTFT {a.kpis?.ttft ?? 1.2}j · Gate {a.kpis?.pass ?? 92}% · {a.kpis?.commits ?? 8}/sem
      </div>

      {/* Actions (hover) */}
      <div className="mt-1.5 flex items-center gap-2">
        <button title="Assigner" aria-label="Assigner" onClick={() => props.onAssign?.(a.id)} className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]"><UserPlus className="w-3 h-3"/></button>
        <button title="Ping" aria-label="Ping" onClick={() => props.onPing?.(a.id)} className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]"><Bell className="w-3 h-3"/></button>
        <button title="Déléguer" aria-label="Déléguer" onClick={() => props.onDelegate?.(a.id)} className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]"><Share className="w-3 h-3"/></button>
        <button title="Escalader" aria-label="Escalader" onClick={() => props.onEscalate?.(a.id)} className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]"><ArrowUpRight className="w-3 h-3"/></button>
        <button title="Substituer" aria-label="Substituer" onClick={() => props.onSubstitute?.(a.id)} className="w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]"><Shuffle className="w-3 h-3"/></button>
        <button title="Ouvrir" aria-label="Ouvrir" onClick={() => props.onOpen?.(a.id)} className="ml-auto w-6 h-6 grid place-items-center rounded bg-white/5 border border-[var(--border)] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]"><ExternalLink className="w-3 h-3"/></button>
      </div>
    </div>
  );
}

function normalize(props: AgentCardProps): Agent {
  if (props.a) return { status: 'green', missions: [], kpis: { ttft:1.2, pass:92, commits:8 }, ...props.a } as Agent;
  const g = props.agent || { id: 'n/a', name: 'Agent', role: 'AGENT', load: 50 };
  const baseLoad = g.load ?? 50;
  const load = baseLoad > 1 ? baseLoad / 100 : baseLoad; // accept % or fraction
  return {
    id: g.id,
    name: g.name,
    role: (g as any).role || 'Agent',
    load,
    status: (g.status as any) || 'green',
    missions: [],
    kpis: { ttft: 1.2, pass: 92, commits: 8 },
  } as Agent;
}
