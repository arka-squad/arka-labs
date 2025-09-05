# Arka Console — UI Kit v12 (files)

> Découpage en fichiers prêt à coller dans le dépôt. **React + Tailwind** uniquement (UI/Front, pas d’API). Chaque composant exporte **par défaut**.

---

## `/design-system/tokens.css`
```css
:root {
  --bg:#0C1117; --surface:#10161D; --elevated:#141B23; --border:#1F2A33;
  --ring-soft: 51 65 85 / 0.60;
  --fg:#FFFFFF; --fg2:#CBD5E1; --fgdim:#94A3B8;
  --success:#10B981; --danger:#E11D48; --warn:#F59E0B;
  --grad-start:#FAB652; --grad-mid:#F25636; --grad-end:#E0026D;
  --bubble:#18212B; --r-xs:6px; --r-md:12px; --r-xl:16px;
}

html,body,#root{height:100%;}
body { background: var(--bg); color: var(--fg); }

/* Brand gradient */
.brand-grad { background-image: linear-gradient(135deg,var(--grad-start),var(--grad-mid) 50%,var(--grad-end)); }

/* Scrollbars — masquées, visibles au hover */
.scroller { scrollbar-width: thin; scrollbar-color: var(--bubble) transparent; }
.scroller:hover { scrollbar-color: var(--bubble) transparent; }
.scroller::-webkit-scrollbar { width: 8px; height: 8px; }
.scroller::-webkit-scrollbar-thumb { background: var(--bubble); border-radius: 8px; }
.scroller::-webkit-scrollbar-track { background: transparent; }
```

---

## `/components/topbar.tsx`
```tsx
import React from 'react';
import { Search, Share2, Play } from 'lucide-react';

const cn = (...c: (string|false|undefined)[]) => c.filter(Boolean).join(' ');

export type TopbarProps = {
  role?: 'viewer'|'operator'|'owner';
  onSearch?: (q:string)=>void;
  onShare?: ()=>void;
  onRun?: ()=>void;
};

export default function Topbar({ role='owner', onSearch, onShare, onRun }: TopbarProps){
  return (
    <header className="h-14 box-border border-b border-[var(--border)] bg-[var(--surface)] grid grid-cols-[auto_1fr_auto] items-center px-4 gap-4">
      {/* Logo */}
      <img src="https://arka-squad.app/assets/logo/arka-logo-blanc.svg" alt="Arka" className="h-5 opacity-90"/>

      {/* Search centré */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-[var(--fgdim)] bg-[var(--elevated)] border border-[var(--border)] rounded-full px-3 py-1 w-full max-w-xl">
          <Search className="w-4 h-4"/>
          <input
            aria-label="Rechercher"
            placeholder="Rechercher (⌘K)"
            onKeyDown={e=>{ if(e.key==='Enter'){ onSearch?.((e.target as HTMLInputElement).value);} }}
            className="bg-transparent outline-none text-[var(--fg)] placeholder:text-[var(--fgdim)]/70 w-full"/>
        </div>
      </div>

      {/* Rôle & actions */}
      <div className="flex items-center gap-3 justify-end">
        <span className="text-xs text-[var(--fgdim)]">Role:</span>
        <span className={cn(
          'px-2 py-1 rounded text-xs border',
          role==='owner' && 'border-[var(--grad-start)] text-[var(--grad-start)]',
          role==='operator' && 'border-[var(--success)] text-[var(--success)]',
          role==='viewer' && 'border-[var(--fgdim)] text-[var(--fgdim)]'
        )}>{role.toUpperCase()}</span>
        <button onClick={onShare} className="h-8 px-3 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1"><Share2 className="w-3 h-3"/>Share</button>
        <button onClick={onRun} className="h-8 px-3 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1"><Play className="w-3 h-3"/>Run</button>
      </div>
    </header>
  );
}
```

---

## `/components/leftbar.tsx`
```tsx
import React from 'react';
import { Menu, Activity, CalendarRange, Layers, FileText, Gauge, Users, Inbox } from 'lucide-react';

const cn = (...c:(string|false|undefined)[])=>c.filter(Boolean).join(' ');

export type LeftbarProps = {
  view: string;
  setView: (v:string)=>void;
};

export default function Leftbar({ view, setView }: LeftbarProps){
  const items = [
    { id:'dashboard', label:'Dashboard', icon: <Activity className="w-5 h-5"/> },
    { id:'roadmap', label:'Roadmap', icon: <CalendarRange className="w-5 h-5"/> },
    { id:'builder', label:'Gouvernance', icon: <Layers className="w-5 h-5"/> },
    { id:'docdesk', label:'DocDesk', icon: <FileText className="w-5 h-5"/> },
    { id:'observa', label:'Observabilité', icon: <Gauge className="w-5 h-5"/> },
    { id:'roster', label:'Roster', icon: <Users className="w-5 h-5"/> },
  ];
  return (
    <aside className="h-full w-[72px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
      <div className="h-14 grid place-items-center border-b border-[var(--border)]"><Menu className="w-5 h-5"/></div>
      {items.map(i=> (
        <button key={i.id} title={i.label} aria-label={i.label}
          onClick={()=>setView(i.id)}
          className={cn('h-12 w-full grid place-items-center border-b border-[var(--border)] hover:bg-white/5', view===i.id && 'bg-white/10')}>{i.icon}</button>
      ))}
      {/* Messages + Avatar stack (messages au-dessus) */}
      <div className="mt-auto p-2 flex flex-col items-center gap-2 border-t border-[var(--border)]">
        <button title="Messages" className="h-12 w-full rounded-[12px] border border-[var(--border)] grid place-items-center hover:bg-white/5">
          <Inbox className="w-5 h-5"/>
        </button>
        <div className="relative w-12 h-12 rounded-full bg-white/10 grid place-items-center border border-[var(--border)]">
          <span className="text-sm">O</span>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--success)] border-2 border-[var(--surface)]"/>
        </div>
      </div>
    </aside>
  );
}
```

---

## `/components/chat/ChatPanel.tsx`
```tsx
import React, { useMemo, useState } from 'react';
import { Paperclip, Send, ChevronDown } from 'lucide-react';

export type ChatThread = { id:string; title:string; squad:string; };
export type ChatMsg = { id:string; from:'Owner'|'AGP'|'QA-ARC'|'PMO'|'UX/UI'|string; text:string; at:string };
export type ChatAgent = { id:string; name:string; role:string; tz:string; load:number; missions:string[]; risk?:boolean; doc?:string; kpis:{ ttft:string; pass:number; commits:number } };

export type ChatPanelProps = {
  threads: ChatThread[]; messages: ChatMsg[]; agents: ChatAgent[];
  onSend?: (payload:{threadId:string; text:string})=>void;
};

export default function ChatPanel({ threads, messages, agents, onSend }: ChatPanelProps){
  const [active, setActive] = useState(threads[0]?.id ?? 't1');
  const [agentId, setAgentId] = useState(agents[0]?.id ?? 'agp');
  const [text, setText] = useState('');

  const a = useMemo(()=> agents.find(x=>x.id===agentId) ?? agents[0], [agentId, agents]);

  return (
    <aside className="h-full w-[380px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] grid grid-rows-[auto_1fr_auto]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-sm mb-2"><span className="w-4 h-4 rounded border border-[var(--border)] grid place-items-center">💬</span> Chat</div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select value={active} onChange={(e)=>setActive(e.target.value)} aria-label="Sélection du fil"
              className="bg-transparent text-[var(--fg)] border border-[var(--border)] rounded px-2 py-1 text-xs max-w-full whitespace-normal leading-tight w-full">
              {threads.map(t=> <option key={t.id} value={t.id}>{t.title} · {t.squad}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1.5 pointer-events-none opacity-60"/>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-[var(--border)]">Squad</span>
        </div>
        {/* Agent compact */}
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2 items-start">
          <div>
            <select value={agentId} onChange={(e)=>setAgentId(e.target.value)} aria-label="Sélection de l'agent"
              className="bg-transparent text-[var(--fg)] border border-[var(--border)] rounded px-2 py-1 text-xs max-w-full whitespace-normal leading-tight w-full">
              {agents.map(ag=> <option key={ag.id} value={ag.id}>{ag.name} · {ag.role}</option>)}
            </select>
            <div className="mt-1 text-[10px] leading-4 text-[var(--fgdim)] break-words max-w-full">{a.name} · {a.role}</div>
          </div>
          <div className="text-[10px] text-right text-[var(--fgdim)]">
            TTFT {a.kpis.ttft} · Gate {a.kpis.pass}% · {a.kpis.commits}/sem
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="scroller overflow-auto p-3 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={m.from==='Owner' ? 'text-right' : ''}>
            {m.from==='Owner' ? (
              <div className="inline-block max-w-[85%] bg-[var(--bubble)] text-[var(--fg)] rounded-[14px] px-3 py-2">
                <p className="text-sm whitespace-pre-wrap">{highlight(m.text)}</p>
                <div className="text-[10px] text-[var(--fgdim)] mt-1">{m.at}</div>
              </div>
            ) : (
              <div className="inline-block max-w-[85%] text-left border-l border-[var(--border)] pl-3">
                <div className="text-[11px] text-[var(--fgdim)] mb-0.5">{m.from} · {m.at}</div>
                <p className="text-sm whitespace-pre-wrap">{highlight(m.text)}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-[var(--border)] p-2">
        <div className="bg-[var(--elevated)] border border-[var(--border)] rounded-[14px] p-2">
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}
            placeholder="Message à squad alpha…"
            className="w-full bg-transparent outline-none resize-none placeholder:text-[var(--fgdim)] text-sm"/>
          <div className="flex items-center justify-between mt-2">
            <button className="h-8 w-8 rounded-full border border-[var(--border)] grid place-items-center"><Paperclip className="w-4 h-4"/></button>
            <button onClick={()=>{ onSend?.({threadId:active, text}); setText(''); }}
              className="h-8 w-8 rounded-full bg-white/10 border border-[var(--border)] grid place-items-center"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mise en évidence "Action:" et "9 fichiers lus" en bleu
function highlight(t:string){
  const marks = [/Action:/g, /9 fichiers lus/gi];
  let out = t; marks.forEach(rx=> out = out.replace(rx, (m)=>`<span style=\"color:#60A5FA\">${m}</span>`));
  return <span dangerouslySetInnerHTML={{__html: out}}/>;
}
```

---

## `/components/kpis/KpiCard.tsx`
```tsx
import React from 'react';

export type KpiCardProps = { label:string; value:number|string; unit?:string; trend?: number[] };

export default function KpiCard({ label, value, unit, trend=[1,1,1,1,1,1] }: KpiCardProps){
  // sparkline lissée (courbe) — SVG simple
  const H=36, W=160; const pts = trend.map((v,i)=>[ (i/(trend.length-1))*W, H - (v/Math.max(...trend))*H ]);
  const path = pointsToSmoothPath(pts);
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="text-[var(--fgdim)] text-sm">{label}</div>
      <div className="mt-1 text-4xl font-semibold tracking-tight text-[var(--fg)] text-center">{value}{unit? <span className="text-2xl align-top ml-1">{unit}</span>:null}</div>
      <div className="mt-2 h-[48px] relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[36px]">
          <defs>
            <linearGradient id="kpiGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--grad-start)"/>
              <stop offset="50%" stopColor="var(--grad-mid)"/>
              <stop offset="100%" stopColor="var(--grad-end)"/>
            </linearGradient>
          </defs>
          <path d={path} fill="none" stroke="url(#kpiGrad)" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  );
}

function pointsToSmoothPath(pts:number[][]){
  if(pts.length<2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for(let i=1;i<pts.length;i++){
    const [x,y] = pts[i]; const [px,py] = pts[i-1];
    const cx = (px + x) / 2; const cy = (py + y) / 2;
    d += ` Q ${px} ${py}, ${cx} ${cy}`;
  }
  d += ` T ${pts[pts.length-1][0]} ${pts[pts.length-1][1]}`;
  return d;
}
```

---

## `/components/roadmap/RoadmapCard.tsx`
```tsx
import React from 'react';

export type RoadItem = { id:string; row:number; title:string; start:number; end:number; color:string };
export type RoadmapCardProps = { months: string[]; items: RoadItem[]; left: {row:number; title:string; tag:string; owner:string}[] };

export default function RoadmapCard({ months, items, left }: RoadmapCardProps){
  const rows = Array.from(new Set(left.map(l=>l.row))).sort();
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-3 h-full overflow-hidden">
      <div className="grid grid-cols-[180px_1fr] gap-3 h-full min-h-0">
        {/* Colonne gauche */}
        <div className="pt-6 space-y-2">
          {left.map(l => (
            <div key={l.row} className="h-8 grid grid-cols-[1fr_auto_auto] items-center gap-2 px-2 rounded bg-white/5 border border-[var(--border)]/60">
              <div className="truncate text-[var(--fg)]/90 text-xs">{l.title}</div>
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[var(--fg)]/90">{l.tag}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[var(--fgdim)]">{l.owner}</span>
            </div>
          ))}
        </div>
        {/* Timeline */}
        <div className="h-full min-h-0">
          <div className="grid grid-cols-12 gap-1">
            {months.map(m => <div key={m} className="text-[10px] text-[var(--fgdim)] text-center select-none">{m}</div>)}
          </div>
          <div className="mt-2 space-y-2">
            {rows.map(r => (
              <div key={r} className="relative grid grid-cols-12 gap-1 h-8">
                <div className="absolute inset-0 rounded border border-[var(--border)]/60 bg-white/5 pointer-events-none"/>
                {items.filter(it=>it.row===r).map(it => (
                  <div key={it.id}
                    className="relative rounded-full border px-3 flex items-center justify-between text-xs"
                    style={{ gridColumn: `${it.start+1} / span ${it.end - it.start}`, backgroundColor: `${it.color}33`, borderColor: `${it.color}77` }}>
                    <span className="truncate text-[var(--fg)]/90">{it.title}</span>
                    <span className="ml-2 text-[10px] text-[var(--fgdim)] font-mono">{it.id}</span>
                    <span className="absolute -right-2 w-4 h-4 rounded-full" style={{ backgroundColor: it.color }}/>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## `/components/runs/RunsTable.tsx`
```tsx
import React from 'react';

export type Run = { run_id:string; status:'PASS'|'FAIL'|'WARN'; p95_ms:number; error_pct:number; sprint:string; trace_id:string };
export type RunsTableProps = { rows: Run[] };

const Pill: React.FC<{s:Run['status']}> = ({s}) => {
  const cls = s==='PASS' ? 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30'
    : s==='FAIL' ? 'bg-[var(--danger)]/20 text-[var(--danger)] border-[var(--danger)]/30'
    : 'bg-[var(--warn)]/20 text-[var(--warn)] border-[var(--warn)]/30';
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${cls}`}>{s}</span>;
};

export default function RunsTable({ rows }: RunsTableProps){
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-3 h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[var(--fgdim)]">DERNIERS RUNS (20/L)</div>
      </div>
      <div className="h-full min-h-0 overflow-auto scroller">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--surface)] text-[var(--fgdim)]">
            <tr className="text-left">
              <th className="px-3 py-2">run_id</th>
              <th className="px-3 py-2">status</th>
              <th className="px-3 py-2">p95 (ms)</th>
              <th className="px-3 py-2">error %</th>
              <th className="px-3 py-2">sprint</th>
              <th className="px-3 py-2">trace_id</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.run_id} className="border-t border-[var(--border)]/60 hover:bg-white/5">
                <td className="px-3 py-2 font-mono text-[var(--fg)]/90">#{r.run_id}</td>
                <td className="px-3 py-2"><Pill s={r.status}/></td>
                <td className="px-3 py-2 tabular-nums">{r.p95_ms}</td>
                <td className="px-3 py-2 tabular-nums">{r.error_pct}</td>
                <td className="px-3 py-2">{r.sprint}</td>
                <td className="px-3 py-2"><a className="text-[#60A5FA] hover:underline" href="#">{r.trace_id}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## `/components/roster/AgentCard.tsx`
```tsx
import React from 'react';

export type Agent = {
  id:string; name:string; role:string; status:'green'|'orange'|'red';
  load:number; missions:string[]; risk?:boolean; doc?:string;
  kpis:{ ttft:string; pass:number; commits:number };
};

export default function AgentCard({ id, name, role, status, load, missions, risk, doc, kpis }: Agent){
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded-full bg-white/10 grid place-items-center text-[10px]">{name.split(' ')[0][0]}</div>
          <div className="text-[var(--fg)]">{name}</div>
          <div className="text-xs text-[var(--fgdim)]">· {role}</div>
        </div>
        <span className={
          'w-2 h-2 rounded-full ' + (status==='green' ? 'bg-[var(--success)]' : status==='orange' ? 'bg-[var(--warn)]' : 'bg-[var(--danger)]')
        } aria-label={`status ${status}`}/>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
          <div className="h-2 brand-grad" style={{ width: `${Math.round(load*100)}%` }} />
        </div>
        <span className="tabular-nums text-[var(--fg)]/90 text-xs">{Math.round(load*100)}%</span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs">
        {missions.slice(0,2).map(m => <span key={m} className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90 font-mono">{m}</span>)}
        {risk && <span className="px-1.5 py-0.5 rounded bg-[var(--warn)]/10 text-[var(--warn)]">⚠ perf</span>}
        {doc && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90">📄 {doc}</span>}
      </div>
      <div className="mt-1 text-xs text-[var(--fgdim)]">TTFT {kpis.ttft}j · Gate {kpis.pass}% · {kpis.commits}/sem</div>
    </div>
  );
}
```

---

## `/app/console/page.tsx`
```tsx
'use client';
import React, { useMemo } from 'react';
import Topbar from '@/components/topbar';
import Leftbar from '@/components/leftbar';
import ChatPanel from '@/components/chat/ChatPanel';
import KpiCard from '@/components/kpis/KpiCard';
import RoadmapCard from '@/components/roadmap/RoadmapCard';
import RunsTable from '@/components/runs/RunsTable';
import AgentCard from '@/components/roster/AgentCard';
import '@/design-system/tokens.css';

export default function ConsolePage(){
  // --- DEMO DATA (peut être remplacé par les endpoints réels) ---
  const kpis = [
    { label:'TTFT (p95)', value:1.5, unit:'ms', trend:[1.6,1.7,1.5,1.6,1.5,1.5] },
    { label:'RTT (p95)', value:3.2, unit:'ms', trend:[3.4,3.1,3.3,3.3,3.2,3.2] },
    { label:'Errors (p95)', value:0.8, unit:'%', trend:[0.9,0.8,0.8,0.9,0.8,0.8] },
  ];

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const left = [
    {row:1, title:'Console App', tag:'EPIC-42', owner:'AGP'},
    {row:2, title:'Builder v1', tag:'EPIC-7', owner:'UX/UI'},
    {row:3, title:'Policies', tag:'POL-12', owner:'PMO'},
    {row:4, title:'ADR set', tag:'ADR-9', owner:'AGP'},
    {row:5, title:'Process lib', tag:'PROC-7', owner:'QA-ARC'},
  ];
  const items = [
    { id:'E42A', row:1, title:'Intake→CR', start:0, end:4, color:'#4fd1c5' },
    { id:'E42B', row:1, title:'Console core', start:4, end:7, color:'#0ea5e9' },
    { id:'E7A', row:2, title:'Palette briques', start:1, end:5, color:'#60a5fa' },
    { id:'P12', row:3, title:'Policy set', start:4, end:6, color:'#34d399' },
    { id:'ADR', row:4, title:'ADR set', start:5, end:7, color:'#a78bfa' },
    { id:'PRC', row:5, title:'Process lib', start:7, end:11, color:'#c084fc' },
  ];

  const runs = Array.from({length:20},(_,i)=>({
    run_id:`R-${1824+i}`, status: (i%7===0?'FAIL':'PASS') as const, p95_ms: i%7===0?3100:1450+(i%5)*30,
    error_pct: i%7===0?2.1:0.8, sprint:`S-${14+(i%2)}`, trace_id: Math.random().toString(36).slice(2,9)
  }));

  const agents = [
    { id:'agp', name:'AGP – Arka v2.5', role:'AGP', status:'green', load:0.65, missions:['EPIC-42','EPIC-7'], risk:true, doc:'POL-12', kpis:{ttft:'1,2', pass:92, commits:8} },
    { id:'qa', name:'QA-ARC – R2.5', role:'QA-ARC', status:'orange', load:0.80, missions:['qa','a11y'], kpis:{ttft:'1,6', pass:88, commits:5} },
    { id:'pmo', name:'PMO – Console', role:'PMO', status:'green', load:0.55, missions:['planning','risk'], kpis:{ttft:'1,1', pass:95, commits:3} },
  ] as const;

  const threads = [
    { id:'t1', title:'Chat · Arka 2.6 – AGP | Actif · Alpha', squad:'Alpha' },
  ];
  const messages = [
    { id:'m1', from:'System', at:'09:41', text:'Crafting a structured plan' },
    { id:'m2', from:'AGP', at:'09:42', text:'2 files generated: Livrable-AGP_Objectifs-Fonctionnels-Prioritaires-Arka.md (x2).' },
    { id:'m3', from:'AGP', at:'09:44', text:'It seems like we’re about to start implementing the scaffold…' },
    { id:'m4', from:'AGP', at:'09:46', text:'✓ Je crée l’ossature cible non destructive (dossiers + README)…' },
    { id:'m5', from:'QA-ARC', at:'09:49', text:'Monsieur, Reco: prise de connaissance faite — **9 fichiers lus**, contenu cohérent… Action: souhaitez-vous que je normalise l’UTF-8 (sans BOM)…' },
    { id:'m6', from:'Owner', at:'09:52', text:'go fait B5 et B6 tu avances vite !' },
  ];

  return (
    <div className="h-dvh w-full flex bg-[var(--bg)] text-[var(--fg)]">
      <Leftbar view={'dashboard'} setView={()=>{}} />
      <div className="flex-1 min-h-0 flex flex-col">
        <Topbar role={'owner'} />
        <div className="flex-1 min-h-0 flex">
          <ChatPanel threads={threads} messages={messages as any} agents={agents as any}/>
          <main className="flex-1 min-h-0 overflow-hidden">
            {/* KPIs */}
            <div className="p-4 grid grid-cols-3 gap-4">
              {kpis.map(k => <KpiCard key={k.label} {...k} />)}
            </div>
            {/* Centre: Roadmap (40%) + Runs (60%), Droite: Roster */}
            <div className="px-4 pb-4 grid grid-cols-3 gap-4 min-h-[520px]">
              <div className="col-span-2 min-h-0 grid grid-rows-[4fr_6fr] gap-3">
                <RoadmapCard months={months} items={items as any} left={left as any}/>
                <RunsTable rows={runs as any}/>
              </div>
              <div className="min-h-0 overflow-auto scroller space-y-3">
                {agents.map(a => <AgentCard key={a.id} {...(a as any)} />)}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

---

## `/usage.md`
```md
# Arka Console — UI Kit v12 (usage)

1. Ajouter Tailwind + importer `/design-system/tokens.css` dans l’app.
2. Déposer les composants sous `/components/*` et la page sous `/app/console/page.tsx`.
3. Remplacer les **demo-data** par les réponses API:
   - `GET /api/metrics/kpis` → alimente les 3 KpiCard
   - `GET /api/metrics/runs?page=1&limit=20` → alimente RunsTable
   - `GET /api/documents?page=1&page_size=20` → pour DocDesk (écran suivant)
4. Le **ChatPanel** expose `onSend` pour brancher l’envoi.
5. Respecter le scroll **par section** : ajouter `.scroller` sur les conteneurs scrollables.
```

---

## `/props.json`
```json
{
  "Topbar": {"role":"owner"},
  "Leftbar": {"view":"dashboard"},
  "ChatPanel": {"threads":[{"id":"t1","title":"Chat · Arka 2.6 – AGP | Actif · Alpha","squad":"Alpha"}]},
  "KpiCard": {"label":"TTFT (p95)","value":1.5,"unit":"ms","trend":[1.6,1.7,1.5,1.6,1.5,1.5]},
  "RoadmapCard": {"months":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"left":[{"row":1,"title":"Console App","tag":"EPIC-42","owner":"AGP"}],"items":[{"id":"E42A","row":1,"title":"Intake→CR","start":0,"end":4,"color":"#4fd1c5"}]},
  "RunsTable": {"rows":[{"run_id":"R-1824","status":"FAIL","p95_ms":3100,"error_pct":2.1,"sprint":"S-14","trace_id":"adm14xk7"}]},
  "AgentCard": {"id":"agp","name":"AGP – Arka v2.5","role":"AGP","status":"green","load":0.65,"missions":["EPIC-42","EPIC-7"],"kpis":{"ttft":"1,2","pass":92,"commits":8}}
}
```

