import React, { useMemo, useState } from "react";

import { Activity, BadgeCheck, ChevronDown, ChevronRight, FileText, Gauge, GitCommit, Menu, MessageSquare, Play, Save, Share2, Shield, SquareDashedMousePointer, Users, ZoomIn, ZoomOut, Plus, Search, Filter, Settings, Layers, Link2, FileSearch, Eye, UploadCloud, XCircle, CheckCircle2, AlertTriangle, Circle, ArrowUp } from "lucide-react";
// fix: Inbox icon missing
import { Inbox } from "lucide-react";
import { CalendarRange } from "lucide-react";

// --- Demo data injected from user -----------------------------------------
const DEMO = {"meta":{"env":"DEMO_MODE","tz":"UTC+01","role":"OWNER","trace_id":"tr_demo_9fz2","hud":"TTFT 0.68s · trace_id tr_demo_9fz2 · DEMO"},"topbar":{"search_placeholder":"Rechercher (⌘K)","brand":"arka","buttons":[{"id":"open_console","label":"Ouvrir la console"},{"id":"connect","label":"Se connecter"}],"role_badge":{"label":"OWNER"}},"sidebar":{"sections":[{"id":"chat","label":"Chat"},{"id":"home","label":"KPIs"},{"id":"roadmap","label":"Roadmap"},{"id":"runs","label":"Runs"},{"id":"roster","label":"Agents"}]},"chat":{"thread_title":"Chat · Arka 2.6 – AGP | Actif · Alpha","agent_header":{"agent":"AGP – Arka v2.5","role":"AGP","tz":"UTC+01","charge_pct":65,"chips":["EPIC-42","EPIC-7","⚠ perf","POL-12"],"mini_kpis":"TTFT 1,2j · Gate 92% · 8/sem"},"messages":[{"from":"System","at":"09:41","text":"Crafting a structured plan"},{"from":"AGP","at":"09:42","text":"2 files generated: Livrable-AGP_Objectifs-Fonctionnels-Prioritaires-Arka.md (x2)."},{"from":"AGP","at":"09:44","text":"It seems like we’re about to start implementing the scaffold. Although they didn’t directly ask for an update to the change request (CR), they do want to start restructuring based on previous knowledge. I propose we implement the Vague 1 PR by creating directories with README placeholders, copying scripts to infra/ci, and adding test and documentation placeholders as well. We’ll summarize our changes in a CR."},{"from":"AGP","at":"09:46","text":"✓ Je crée l’ossature cible non destructive (dossiers + README) et duplique les scripts CI sous infra/ci/ sans toucher aux imports."},{"from":"QA-ARC","at":"09:49","text":"Monsieur, Reco: prise de connaissance faite — 9 fichiers lus, contenu cohérent; quelques artefacts d’encodage FR mineurs visibles. Action: souhaitez-vous que je normalise l’UTF-8 (sans BOM) sur ces docs ou que je passe au lot suivant « Socle OPS/Repo » ?"},{"from":"QA-ARC","at":"09:50","text":"Action: j’ouvre local/100-repo-map-audit.md pour poursuivre le lot OPS/Repo."}],"composer_placeholder":"Message à squad alpha…"},"kpis":{"tiles":[{"id":"ttft_p95","label":"TTFT (p95)","value":1.5,"unit":"ms","trend":[1.6,1.7,1.5,1.6,1.5,1.5]},{"id":"rtt_p95","label":"RTT (p95)","value":3.2,"unit":"ms","trend":[3.4,3.1,3.3,3.3,3.2,3.2]},{"id":"errors_p95","label":"Errors (p95)","value":0.8,"unit":"%","trend":[0.9,0.8,0.8,0.9,0.8,0.8]}]},"roadmap":{"title":"ROADMAP (12 MOIS)","months":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"lanes":[{"id":"RM-1","name":"Console core","tags":[],"start":"Jan","end":"Mar","chip":"EPIC-42"},{"id":"RM-2","name":"Builder v1","tags":["EPIC-7"],"start":"Feb","end":"May"},{"id":"RM-3","name":"Policies","tags":["POL-12"],"start":"May","end":"Jun"},{"id":"RM-4","name":"ADR set","tags":["ADR-9"],"start":"Jun","end":"Jul"},{"id":"RM-5","name":"Process lib","tags":["PRC-7"],"start":"May","end":"Sep"},{"id":"RM-6","name":"Observabilité","tags":["OBS-2"],"start":"Mar","end":"Aug"}]},"runs":{"title":"DERNIERS RUNS (20/L)","headers":["run_id","status","p95 (ms)","error %","sprint","trace_id"],"rows":[{"run_id":"R-1824","status":"FAIL","p95_ms":3100,"error_pct":2.1,"sprint":"S-14","trace_id":"adm14xk7"},{"run_id":"R-1825","status":"PASS","p95_ms":1480,"error_pct":0.8,"sprint":"S-15","trace_id":"ox1iizx0"},{"run_id":"R-1826","status":"PASS","p95_ms":1510,"error_pct":0.8,"sprint":"S-14","trace_id":"7zxf9qm"},{"run_id":"R-1827","status":"PASS","p95_ms":1540,"error_pct":0.8,"sprint":"S-15","trace_id":"annn7e3"},{"run_id":"R-1828","status":"PASS","p95_ms":1570,"error_pct":0.8,"sprint":"S-14","trace_id":"qn15aey"},{"run_id":"R-1829","status":"PASS","p95_ms":1450,"error_pct":0.8,"sprint":"S-15","trace_id":"1chc09e"},{"run_id":"R-1830","status":"PASS","p95_ms":1480,"error_pct":0.8,"sprint":"S-14","trace_id":"sg4via9y"},{"run_id":"R-1831","status":"FAIL","p95_ms":3100,"error_pct":2.1,"sprint":"S-15","trace_id":"06a2qcc1"},{"run_id":"R-1832","status":"PASS","p95_ms":1540,"error_pct":0.8,"sprint":"S-14","trace_id":"l9h1f0b"},{"run_id":"R-1833","status":"PASS","p95_ms":1570,"error_pct":0.8,"sprint":"S-15","trace_id":"tto1zms"},{"run_id":"R-1834","status":"PASS","p95_ms":1450,"error_pct":0.8,"sprint":"S-14","trace_id":"ygz87l0"},{"run_id":"R-1835","status":"PASS","p95_ms":1480,"error_pct":0.8,"sprint":"S-15","trace_id":"t19e4leh"},{"run_id":"R-1836","status":"PASS","p95_ms":1540,"error_pct":0.8,"sprint":"S-14","trace_id":"jry34vp7"},{"run_id":"R-1837","status":"PASS","p95_ms":1540,"error_pct":0.8,"sprint":"S-15","trace_id":"p23d2p1"},{"run_id":"R-1838","status":"FAIL","p95_ms":3100,"error_pct":2.1,"sprint":"S-14","trace_id":"yxqh8145"},{"run_id":"R-1839","status":"PASS","p95_ms":1450,"error_pct":0.8,"sprint":"S-15","trace_id":"68km56lr"},{"run_id":"R-1840","status":"PASS","p95_ms":1480,"error_pct":0.8,"sprint":"S-14","trace_id":"oo5lwzie"},{"run_id":"R-1841","status":"PASS","p95_ms":1570,"error_pct":0.8,"sprint":"S-15","trace_id":"0e8cc9d"},{"run_id":"R-1842","status":"PASS","p95_ms":1500,"error_pct":0.8,"sprint":"S-14","trace_id":"b14m9x"},{"run_id":"R-1843","status":"PASS","p95_ms":1490,"error_pct":0.8,"sprint":"S-15","trace_id":"f9a7m2"}]},"roster":{"title":"ROSTER — À RISQUE","cards":[{"id":"AGP","title":"AGP – Arka v2.5","role":"AGP","tz":"UTC+01","charge_pct":65,"dispo":"3j","oncall":"oui","skills":["perf","codex"],"confiance":"A · RBAC OW","chips":["EPIC-42","EPIC-7","⚠ perf","POL-12"],"mini_kpis":"TTFT 1,2j · Gate 92% · 8/sem"},{"id":"QA-ARC","title":"QA-ARC – R2.5","role":"QA-ARC","tz":"UTC+01","charge_pct":80,"dispo":"1j","oncall":"non","skills":["qa","a11y"],"confiance":"B · RBAC 0","chips":["EPIC-13"],"mini_kpis":"TTFT 1,6j · Gate 88% · 5/sem"},{"id":"PMO","title":"PMO – Console","role":"PMO","tz":"UTC+01","charge_pct":55,"dispo":"2j","oncall":"non","skills":["planning","risk"],"confiance":"A · RBAC OW","chips":["EPIC-31","PROC-7"],"mini_kpis":"TTFT 1,1j · Gate 95% · 3/sem"},{"id":"UX/UI","title":"UX/UI – v12","role":"UX/UI","tz":"UTC+01","charge_pct":40,"dispo":"4j","oncall":"non","skills":["design","a11y"],"confiance":"A · RBAC 0","chips":["EPIC-55","EPIC-60","⚠ perf","ADR-9"],"mini_kpis":"TTFT 1,0j · Gate 97% · 6/sem"}]},"alerts":[{"icon":"warn","text":"Gate « Contracts »","state":"WARN"},{"icon":"fail","text":"Gate « Security »","state":"FAIL"},{"icon":"pass","text":"Gate « Perf »","state":"PASS"}],"strings":{"pill_pass":"PASS","pill_fail":"FAIL","pill_warn":"WARN","aria_health_ok":"Santé: OK","aria_health_down":"Hors service","tooltip_copy_trace":"Copier le trace_id","tooltip_filters":"Filtres","btn_view_all":"Voir tout","pager_prev":"Prev","pager_next":"Next"}} as const;


// --- Design tokens (dark) ----------------------------------------------------
const Tokens: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const style = {
    ['--bg' as any]: '#0C1117',
    ['--surface' as any]: '#10161D',
    ['--elevated' as any]: '#141B23',
    ['--border' as any]: '#1F2A33', // border.soft
    ['--ring-soft' as any]: 'rgb(51 65 85 / 0.60)',
    ['--muted' as any]: '#94A3B8', // text.muted
    ['--fg' as any]: '#FFFFFF',    // text.primary
    ['--fgdim' as any]: '#CBD5E1', // text.secondary
    ['--primary' as any]: '#22D3EE',
    ['--danger' as any]: '#E11D48',
    ['--warn' as any]: '#F59E0B',
    ['--success' as any]: '#10B981',
    ['--grad-start' as any]: '#FAB652',
    ['--grad-mid' as any]: '#F25636',
    ['--grad-end' as any]: '#E0026D',
    ['--brand-grad' as any]: 'linear-gradient(135deg, var(--grad-start) 0%, var(--grad-mid) 50%, var(--grad-end) 100%)',
    ['--bubble' as any]: '#18212B',
    ['--r-xs' as any]: '6px',
    ['--r-md' as any]: '12px',
    ['--r-xl' as any]: '16px',
  } as React.CSSProperties;
  return (
    <div className="h-dvh w-full overflow-hidden" style={style}>
      <style>{`
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: transparent; border-radius: 8px; border: 2px solid transparent; }
        *:hover::-webkit-scrollbar-thumb { background: var(--bubble); }
        .scroller { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .scroller:hover { scrollbar-color: var(--bubble) transparent; }
        .scroller::-webkit-scrollbar-thumb { background: transparent; }
        .scroller:hover::-webkit-scrollbar-thumb { background: var(--bubble); }
        html, body { height: 100%; overflow: hidden; }
      `}</style>
      {children}
    </div>
  );
};

// --- Utilities ---------------------------------------------------------------
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--surface)] ${className}`}>{children}</div>
);

const SectionTitle: React.FC<{ icon?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }> = ({ icon, children, right }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2 text-[var(--fg)]/90">
      {icon}
      <h3 className="text-sm font-medium tracking-wide uppercase">{children}</h3>
    </div>
    {right}
  </div>
);

function cn(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(" "); }

// --- Sample fixtures ---------------------------------------------------------
const kpis = DEMO.kpis.tiles.map(t => ({ key: t.id || t.label.split(' ')[0], value: t.value, unit: t.unit }));

const runs = DEMO.runs.rows.map(r => ({ run_id: r.run_id, status: r.status, p95_ms: r.p95_ms, error_pct: r.error_pct, sprint: r.sprint, trace_id: r.trace_id }));

const agents = DEMO.roster.cards.map((c:any) => ({ id: String(c.id||'').toLowerCase().replace(/[^a-z]/g,''), name: c.title, role: c.role, tz: (c.tz||'UTC+00').replace('UTC',''), status: 'green', load: (c.charge_pct||0)/100, dispoDays: parseInt((c.dispo||'0j'),10)||0, oncall: c.oncall==='oui', skills: c.skills||[], conf: (c.confiance||'A').split(' ')[0], rbac: (c.confiance||'').includes('OW')?'OW':'O', missions: (c.chips||[]).filter((x:string)=>{ const parts = x.split('-'); return parts.length===2 && /^[A-Z]+$/.test(parts[0]) && !Number.isNaN(Number(parts[1])); }), risk: (c.chips||[]).includes('⚠ perf')?'perf':null, doc: (c.chips||[]).find((x:string)=> x.startsWith('POL-')||x.startsWith('ADR-')||x.startsWith('PROC-'))||null, kpis: { ttft: 1.2, pass: 92, commits: 8 } }));

// --- KPI Card ----------------------------------------------------------------
const KpiCard: React.FC<{ label: string; value: number; unit?: string; trend?: number[]; colorIdx?: number }>
= ({ label, value, unit = "", trend = [3,4,2,5,3,6,4], colorIdx = 0 }) => {
  const palette = [
    { stroke: 'var(--primary)' },
    { stroke: '#60A5FA' }, // blue-400
    { stroke: '#34D399' }, // emerald-400
  ];
  const color = palette[colorIdx % palette.length].stroke;

  const { smoothPath, area, gid, min, max } = useMemo(() => {
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const pts = trend.map((v, i) => {
      const x = (i / (trend.length - 1)) * 100;
      const y = 36 - ((v - Math.min(min, 0)) / (max - Math.min(min, 0) || 1)) * 30; // padding
      return { x, y };
    });
    // Smooth path using quadratic curves between midpoints (rounded, no "pics")
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;
      d += ` Q ${p0.x},${p0.y} ${mx},${my}`;
    }
    const smoothPath = d;
    const area = `M 0,36 L ${pts.map(p=>`${p.x},${p.y}`).join(' L ')} L 100,36 Z`;
    const gid = `g${Math.abs(label.split('').reduce((a,c)=>a+c.charCodeAt(0),0))}`;
    return { smoothPath, area, gid, min, max };
  }, [trend, label]);
  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-start justify-between">
        <div className="text-sm text-[var(--fgdim)]">{label}</div>
        <div className="text-right text-[10px] leading-4 text-[var(--fgdim)]">
          <div>Min <span className="ml-1 text-[var(--fg)]/90">{min.toFixed(1)}{unit}</span></div>
          <div>Max <span className="ml-1 text-[var(--fg)]/90">{max.toFixed(1)}{unit}</span></div>
        </div>
      </div>
      <div className="mt-1 text-4xl font-semibold tracking-tight text-[var(--fg)] text-center">
        {value.toFixed(1)} <span className="text-xl font-normal text-[var(--fgdim)]">{unit}</span>
      </div>
      <svg viewBox="0 0 100 36" className="mt-3 w-full h-[96px]" aria-hidden>
        <defs>
          <linearGradient id={`${gid}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--grad-start)" stopOpacity="0.35"/>
            <stop offset="60%" stopColor="var(--grad-mid)" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="var(--grad-end)" stopOpacity="0.06"/>
          </linearGradient>
        </defs>
        <rect x="0" y="24" width="100" height="12" fill={`url(#${gid}-fill)`} opacity="0.25"/>
        <path d={area} fill={`url(#${gid}-fill)`} stroke="none"/>
        <path d={smoothPath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Card>
  );
};

// Chat — threads + messages (squad context) + messages (squad context)
const chatThreads = [ { id:'t_demo', title: DEMO.chat.thread_title, squad: 'Alpha', last_msg_at: new Date().toISOString() } ];
const chatMessages: Record<string, { id: string; from: string; text: string; at: string }[]> = {
  t_demo: DEMO.chat.messages.map((m:any, i:number) => ({ id: 'm'+i, from: m.from, text: m.text, at: m.at }))
};
// auteur humain de la console (messages à droite)
const MY_SENDER = 'Owner';

// --- Roadmap --------------------------------------------------------------
const roadmapMonths = DEMO.roadmap.months;
const roadmapItems = DEMO.roadmap.lanes.map((l:any, idx:number) => { const s = Math.max(0, roadmapMonths.indexOf(l.start)); const e = Math.max(0, roadmapMonths.indexOf(l.end)) + 1; const palette = ['#22d3ee','#38bdf8','#14b8a6','#a78bfa','#f472b6','#34d399']; return { id: (l.tags?.[0]||l.id), title: l.name, row: (idx%5)+1, start: s, end: e, color: palette[idx%palette.length] }; });

const RoadmapCard: React.FC = () => {
  const rows = Array.from({length:5}, (_,i)=>i+1);
  const left = [
    {row:1, title:'Console App', tag:'EPIC-42', owner:'AGP', status:'Active'},
    {row:2, title:'Builder v1', tag:'EPIC-7', owner:'UX/UI', status:'Planned'},
    {row:3, title:'Policies', tag:'POL-12', owner:'PMO', status:'Gated'},
    {row:4, title:'ADR set', tag:'ADR-9', owner:'AGP', status:'Review'},
    {row:5, title:'Process lib', tag:'PROC-7', owner:'QA-ARC', status:'Draft'},
  ];
  return (
    <Card className="p-3 h-full overflow-hidden">
      <div className="grid grid-cols-[180px_1fr] gap-3 h-full min-h-0">
        {/* Left compact info */}
        <div className="pt-6 space-y-2">
          {left.map(l => (
            <div key={l.row} className="h-8 grid grid-cols-[1fr_auto_auto] items-center gap-2 px-2 rounded bg-white/5 border border-[var(--border)]/60">
              <div className="truncate text-[var(--fg)]/90 text-xs">{l.title}</div>
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[var(--fg)]/90">{l.tag}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[var(--fgdim)]">{l.owner}</span>
            </div>
          ))}
        </div>
        {/* Right timeline */}
        <div className="h-full min-h-0">
          {/* Months header */}
          <div className="grid grid-cols-12 gap-1">
            {roadmapMonths.map(m => (
              <div key={m} className="text-[10px] text-[var(--fgdim)] text-center select-none">{m}</div>
            ))}
          </div>
          <div className="mt-2 space-y-2">
            {rows.map(r => (
              <div key={r} className="relative grid grid-cols-12 gap-1 h-8">
                {/* lane background */}
                <div className="absolute inset-0 rounded border border-[var(--border)]/60 bg-white/\[0.02\] pointer-events-none"/>
                {roadmapItems.filter(it=>it.row===r).map(it => (
                  <div key={it.id}
                    className="relative rounded-full border px-3 flex items-center justify-between text-xs"
                    style={{ gridColumn: `${it.start+1} / span ${it.end - it.start}`, backgroundColor: `${it.color}33`, borderColor: `${it.color}77` }}
                  >
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
    </Card>
  );
};

// --- DocDesk Board (Kanban) -------------------------------------------------- (Kanban) -------------------------------------------------- (Kanban) -------------------------------------------------- (Kanban) -------------------------------------------------- (Kanban) -------------------------------------------------- (Kanban) --------------------------------------------------
const Board: React.FC = () => {
  const cols = ['Draft','Review','Gated','Approved','Released','Deprecated'];
  const items = [
    { id: 'POL-123', col: 'Draft', type:'Policy', risk:'perf' },
    { id: 'ADR-456', col: 'Review', type:'ADR' },
    { id: 'POL-789', col: 'Gated', type:'Policy' },
    { id: 'PROC-321', col: 'Approved', type:'Process' },
    { id: 'POL-654', col: 'Released', type:'Policy' },
  ];
  return (
    <div className="grid grid-cols-6 gap-3">
      {cols.map(c => (
        <Card key={c} className="p-2 min-h-[320px]">
          <div className="flex items-center justify-between mb-2"><div className="text-xs uppercase tracking-wide text-[var(--fgdim)]">{c}</div><button className="p-1 rounded bg-white/5"><Plus className="w-3 h-3"/></button></div>
          <div className="space-y-2">
            {items.filter(i => i.col===c).map(i => (
              <div key={i.id} className="p-2 rounded border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center justify-between text-sm text-[var(--fg)]"><span>{i.type}</span><span className="font-mono">#{i.id}</span></div>
                <div className="mt-1 flex items-center justify-between text-xs text-[var(--fgdim)]">
                  <div className="flex items-center gap-2"><Users className="w-3 h-3"/>A: PMO · R: QA</div>
                  {i.risk && <span className="px-1.5 py-0.5 rounded bg-[var(--warn)]/10 text-[var(--warn)]">⚠ {i.risk}</span>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button className="px-2 py-0.5 rounded bg-white/5 text-xs">Tester contrat</button>
                  <button className="px-2 py-0.5 rounded bg-white/5 text-xs">Assigner</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

// --- ChatPanel (persistent, left dock) --------------------------------------
const ChatPanel: React.FC = () => {
  const [active, setActive] = useState(chatThreads[0].id); // t3 par défaut
  const [squad, setSquad] = useState(chatThreads[0].squad);
  const [agentId, setAgentId] = useState(agents[0].id);
  const a = agents.find(x => x.id === agentId)!;
  return (
    <aside className="h-full min-h-0 w-[380px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
      {/* Header: sélecteurs */}
      <div className="h-14 px-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--fg)]">
          <MessageSquare className="w-4 h-4"/> Chat
          <select
            value={active}
            onChange={(e)=>{ const id=e.target.value; setActive(id); const t=chatThreads.find(x=>x.id===id); if(t) setSquad(t.squad); }}
            className="bg-transparent text-[var(--fg)] border border-[var(--border)] rounded px-2 py-1 text-xs max-w-[260px] whitespace-normal leading-tight"
            style={{whiteSpace:'normal'}}
            aria-label="Sélection du fil"
          >
            {chatThreads.map(t=> (
              <option key={t.id} value={t.id} className="bg-[var(--surface)]">{t.title} · {t.squad}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--fgdim)]">Squad</span>
          <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[var(--fg)]">{squad}</span>
        </div>
      </div>

      {/* Agent lié au fil */}
      <div className="p-3 border-b border-[var(--border)] bg-white/\[0.02\] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[var(--primary)]"/>
            <span className="text-xs text-[var(--fgdim)]">Agent du fil</span>
          </div>
          <select
            value={agentId}
            onChange={(e)=>setAgentId(e.target.value)}
            className="bg-transparent text-[var(--fg)] border border-[var(--border)] rounded px-2 py-1 text-xs max-w-[260px] whitespace-normal leading-tight"
            style={{whiteSpace:'normal'}}
            aria-label="Sélection de l'agent"
          >
            {agents.map(ag => <option key={ag.id} value={ag.id} className="bg-[var(--surface)]">{ag.name} · {ag.role}</option>)}
          </select>
        </div>
        <div className="mt-1 text-[10px] leading-4 text-[var(--fgdim)] break-words max-w-full">{a.name} · {a.role}</div>
        {/* Compact header visuel */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[10px]">{a.name.split(' ')[0][0]}</div>
            <div className="text-sm text-[var(--fg)]">{a.name}</div>
            <div className="text-xs text-[var(--fgdim)]">· {a.role}</div>
            <span className={cn("ml-auto w-2 h-2 rounded-full", a.status==='green' && 'bg-[var(--success)]', a.status==='orange' && 'bg-[var(--warn)]', a.status==='red' && 'bg-[var(--danger)]')} aria-label={`status ${a.status}`}/>
            <div className="text-xs text-[var(--fgdim)]">UTC{a.tz}</div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
              <div className="h-2" style={{ backgroundImage: 'var(--brand-grad)', width: `${Math.round(a.load*100)}%` }} />
            </div>
            <span className="tabular-nums text-[var(--fg)]/90 text-xs">{Math.round(a.load*100)}%</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {a.missions.slice(0,2).map(m => <span key={m} className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90 font-mono">{m}</span>)}
            {a.risk && <span className="px-1.5 py-0.5 rounded bg-[var(--warn)]/10 text-[var(--warn)]">⚠ perf</span>}
            {a.doc && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90">📄 {a.doc}</span>}
          </div>
          <div className="mt-1 text-xs text-[var(--fgdim)]">TTFT {a.kpis.ttft}j · Gate {a.kpis.pass}% · {a.kpis.commits}/sem</div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto scroller p-3 space-y-3">
          {(chatMessages[active]||[]).map(m => {
            const mine = m.from === MY_SENDER;
            return (
              <div key={m.id} className={cn('text-sm flex', mine ? 'justify-end' : 'justify-start')}>
                <div className="max-w-[75%]">
                  <div className={cn('mb-1 flex items-center gap-2 text-xs', mine ? 'justify-end' : 'justify-start')}>
                    {!mine && <div className="w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[10px]">{m.from[0]}</div>}
                    <span className={cn('font-medium', mine ? 'text-[var(--fg)]/90' : 'text-[var(--fg)]')}>{m.from}</span>
                    <span className="text-[var(--fgdim)]">{m.at}</span>
                  </div>
                  {mine ? (
                    <div className="px-3 py-2 rounded-[12px] text-[var(--fg)] shadow bg-[var(--bubble)]">
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-[var(--fg)]/90 border-l-2 border-[var(--border)] pl-3">
                      {(() => { const reg = /(Action:?|9 fichiers lus)/gi; const parts = m.text.split(reg); return parts.map((p,idx) => (/^(Action:?|9 fichiers lus)$/i).test(p) ? <span key={idx} className="text-[var(--primary)] font-medium">{p}</span> : <span key={idx}>{p}</span>); })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t border-[var(--border)]">
          <div className="relative rounded-[20px] bg-[var(--elevated)]/80 border border-[var(--border)] px-4 py-4 focus-within:ring-1 focus-within:ring-[var(--ring-soft)]">
            <textarea className="w-full h-24 resize-none bg-transparent outline-none text-sm leading-relaxed pr-16 text-[var(--fg)] placeholder:text-[var(--fgdim)]/70" placeholder={`Ask for follow-up changes`}></textarea>
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <button className="w-8 h-8 rounded-full bg-white/5 border border-[var(--border)] grid place-items-center" title="Ajouter"><Plus className="w-4 h-4"/></button>
              <button className="h-8 px-3 rounded-full bg-white/5 border border-[var(--border)] text-sm flex items-center gap-1" title="Auto">
                <SquareDashedMousePointer className="w-4 h-4"/>
                <span>Auto</span>
              </button>
            </div>
            <button className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-[var(--fgdim)]/20 grid place-items-center border border-[var(--border)] hover:bg-[var(--fgdim)]/30" title="Envoyer"><ArrowUp className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </aside>
  );
};


// --- Sidebar / AppShell ------------------------------------------------------
const Sidebar: React.FC<{ view: string; setView: (v: string) => void }> = ({ view, setView }) => (
  <aside className="h-full w-[72px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
    <div className="h-14 grid place-items-center border-b border-[var(--border)]">
      <Menu className="w-5 h-5" aria-label="Menu"/>
    </div>
    {[
      { id:'dashboard', label:'Dashboard', icon: <Activity className="w-5 h-5"/> },
      { id:'roadmap', label:'Roadmap', icon: <CalendarRange className="w-5 h-5"/> },
      { id:'builder', label:'Gouvernance', icon: <Layers className="w-5 h-5"/> },
      { id:'docdesk', label:'DocDesk', icon: <FileText className="w-5 h-5"/> },
      { id:'observa', label:'Observabilité', icon: <Gauge className="w-5 h-5"/> },
      { id:'roster', label:'Roster', icon: <Users className="w-5 h-5"/> },
    ].map(i => (
      <button
        key={i.id}
        onClick={()=>setView(i.id)}
        title={i.label}
        aria-label={i.label}
        className={cn("h-12 w-full grid place-items-center border-b border-[var(--border)] hover:bg-white/5", view===i.id && 'bg-white/10')}
      >
        {i.icon}
      </button>
    ))}
    {/* bottom: inbox + avatar */}
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


const Topbar: React.FC<{ role: 'viewer'|'operator'|'owner' }>
= ({ role }) => (
  <header className="h-14 box-border border-b border-[var(--border)] bg-[var(--surface)] grid grid-cols-[auto_1fr_auto] items-center px-4 gap-4">
    {/* Left: logo */}
    <div className="flex items-center gap-2">
      <img src="https://arka-squad.app/assets/logo/arka-logo-blanc.svg" alt="Arka" className="h-5 opacity-90"/>
    </div>
    {/* Center: search */}
    <div className="flex justify-center">
      <div className="flex items-center gap-2 text-[var(--fgdim)] bg-[var(--elevated)] border border-[var(--border)] rounded-full px-3 py-1 w-full max-w-xl">
        <Search className="w-4 h-4"/>
        <input aria-label="Rechercher" placeholder="Rechercher (⌘K)" className="bg-transparent outline-none text-[var(--fg)] placeholder:text-[var(--fgdim)]/70 w-full"/>
      </div>
    </div>
    {/* Right: role & actions */}
    <div className="flex items-center gap-3 justify-end">
      <span className="text-xs text-[var(--fgdim)]">Role:</span>
      <span className={cn(
        "px-2 py-1 rounded text-xs border",
        role==='owner' && 'border-[var(--primary)] text-[var(--primary)]',
        role==='operator' && 'border-[var(--success)] text-[var(--success)]',
        role==='viewer' && 'border-[var(--muted)] text-[var(--muted)]'
      )}>{role.toUpperCase()}</span>
      <button className="h-8 px-3 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1"><Share2 className="w-3 h-3"/>Share</button>
      <button className="h-8 px-3 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1"><Play className="w-3 h-3"/>Run</button>
    </div>
  </header>
);


// --- Small UI helpers -------------------------------------------------------
const StatusPill: React.FC<{ s: 'PASS'|'FAIL'|'WARN' }>=({s})=>{
  const cls = s==='PASS' ? 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30'
    : s==='FAIL' ? 'bg-[var(--danger)]/20 text-[var(--danger)] border-[var(--danger)]/30'
    : 'bg-[var(--warn)]/20 text-[var(--warn)] border-[var(--warn)]/30';
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${cls}`}>{s}</span>;
};

// --- Runs table -------------------------------------------------------------
const RunsTable: React.FC = () => (
  <Card className="p-3 h-full overflow-hidden">
    <div className="flex items-center justify-between mb-2">
      <SectionTitle icon={<GitCommit className="w-4 h-4"/>}>DERNIERS RUNS (20/L)</SectionTitle>
      <button className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1"><Filter className="w-3 h-3"/>Filtres</button>
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
          {runs.map(r => (
            <tr key={r.run_id} className="border-t border-[var(--border)]/60 hover:bg-white/5">
              <td className="px-3 py-2 font-mono text-[var(--fg)]/90">#{r.run_id}</td>
              <td className="px-3 py-2"><StatusPill s={r.status as any}/></td>
              <td className="px-3 py-2 tabular-nums">{r.p95_ms}</td>
              <td className="px-3 py-2 tabular-nums">{r.error_pct}</td>
              <td className="px-3 py-2">{r.sprint}</td>
              <td className="px-3 py-2"><a className="text-[var(--primary)] hover:underline" href="#" title="Copier le trace_id">{r.trace_id}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// --- Agent card -------------------------------------------------------------
const AgentCard: React.FC<{ a: typeof agents[number] }>=({a})=> (
  <Card className="p-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="relative w-6 h-6 rounded-full bg-white/10 grid place-items-center text-[10px]">{a.name.split(' ')[0][0]}</div>
        <div className="text-[var(--fg)]">{a.name}</div>
        <div className="text-xs text-[var(--fgdim)]">· {a.role}</div>
      </div>
      <span className={cn('w-2 h-2 rounded-full', a.status==='green' && 'bg-[var(--success)]', a.status==='orange' && 'bg-[var(--warn)]', a.status==='red' && 'bg-[var(--danger)]')} aria-label={`status ${a.status}`}/>
    </div>
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
        <div className="h-2" style={{ backgroundImage: 'var(--brand-grad)', width: `${Math.round(a.load*100)}%` }} />
      </div>
      <span className="tabular-nums text-[var(--fg)]/90 text-xs">{Math.round(a.load*100)}%</span>
    </div>
    <div className="mt-2 flex items-center gap-1 text-xs">
      {a.missions.slice(0,2).map(m => <span key={m} className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90 font-mono">{m}</span>)}
      {a.risk && <span className="px-1.5 py-0.5 rounded bg-[var(--warn)]/10 text-[var(--warn)]">⚠ perf</span>}
      {a.doc && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90">📄 {a.doc}</span>}
    </div>
    <div className="mt-1 text-xs text-[var(--fgdim)]">TTFT {a.kpis.ttft}j · Gate {a.kpis.pass}% · {a.kpis.commits}/sem</div>
  </Card>
);

// --- Views ------------------------------------------------------------------
const DashboardView: React.FC = () => (
  <div className="p-4 h-full min-h-0 overflow-hidden grid grid-rows-[auto_1fr] gap-4">
    <div className="grid grid-cols-3 gap-4">{kpis.map((k,i) => <KpiCard key={k.key} colorIdx={i} label={`${k.key} (p95)`} value={k.value} unit={k.unit} trend={DEMO.kpis.tiles[i]?.trend}/>)}
    </div>
    <div className="grid grid-cols-3 gap-4 min-h-0">
      {/* Centre: Roadmap (40%) au-dessus, Runs (60%) en dessous */}
      <div className="col-span-2 min-h-0 grid grid-rows-[4fr_6fr] gap-3">
        <div className="min-h-0"><RoadmapCard/></div>
        <div className="min-h-0"><RunsTable/></div>
      </div>
      {/* Droite: Roster scrollable */}
      <div className="min-h-0 overflow-auto scroller space-y-3">
        <SectionTitle icon={<Users className='w-4 h-4'/>}>ROSTER — À RISQUE</SectionTitle>
        {agents.map(a => <AgentCard key={a.id} a={a}/>) }
      </div>
    </div>
  </div>
);

const RoadmapView: React.FC = () => (
  <div className="p-4 h-full min-h-0 flex flex-col gap-3">
    <SectionTitle icon={<CalendarRange className="w-4 h-4"/>} right={<div className="flex items-center gap-2 text-xs">
      <button className="px-2 py-1 rounded bg-white/5 border border-[var(--border)]">3m</button>
      <button className="px-2 py-1 rounded bg-white/5 border border-[var(--border)]">6m</button>
      <button className="px-2 py-1 rounded bg-white/5 border border-[var(--border)]">12m</button>
      <span className="mx-1"/>
      <button className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] flex items-center gap-1" title="Zoom -"><ZoomOut className="w-3 h-3"/></button>
      <button className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] flex items-center gap-1" title="Zoom +"><ZoomIn className="w-3 h-3"/></button>
    </div>}>Roadmap — 12 mois</SectionTitle>
    <div className="flex-1 min-h-0"><RoadmapCard/></div>
  </div>
);

const DocDeskView: React.FC = () => (
  <div className="p-4 h-full min-h-0 overflow-auto scroller">
    <SectionTitle icon={<FileText className='w-4 h-4'/>}>DocDesk — Board</SectionTitle>
    <Board/>
  </div>
);

const BuilderView: React.FC = () => (
  <div className="p-4 h-full min-h-0">
    <SectionTitle icon={<Layers className='w-4 h-4'/>}>Gouvernance — Builder</SectionTitle>
    <Card className="p-8 text-[var(--fgdim)]">Palette de briques (DoR, Oracles, Perf, RBAC, Security, Observa, Memory...) — preview à venir.</Card>
  </div>
);

const ObservaView: React.FC = () => (
  <div className="p-4 h-full min-h-0 overflow-hidden grid grid-rows-[auto_1fr] gap-4">
    <div className="grid grid-cols-3 gap-4">{kpis.map((k,i) => <KpiCard key={k.key} colorIdx={i} label={`${k.key} (p95)`} value={k.value} unit={k.unit} trend={DEMO.kpis.tiles[i]?.trend}/>)}
    </div>
    <RunsTable/>
  </div>
);

const RosterView: React.FC = () => (
  <div className="p-4 h-full min-h-0 overflow-auto scroller space-y-3">
    <SectionTitle icon={<Users className='w-4 h-4'/>}>ROSTER — À RISQUE</SectionTitle>
    {agents.map(a => <AgentCard key={a.id} a={a}/>) }
  </div>
);

// --- App --------------------------------------------------------------------
const App: React.FC = () => {
  const [view, setView] = useState<'dashboard'|'roadmap'|'builder'|'docdesk'|'observa'|'roster'>('dashboard');
  return (
    <Tokens>
      <div className="h-dvh w-full flex bg-[var(--bg)] text-[var(--fg)]">
        <Sidebar view={view} setView={setView} />
        <div className="flex-1 min-h-0 flex flex-col">
          <Topbar role={'owner'} />
          <div className="flex-1 min-h-0 flex">
            <ChatPanel />
            <main className="flex-1 min-h-0 overflow-hidden bg-[var(--bg)]">
              {view==='dashboard' && <DashboardView/>}
              {view==='roadmap' && <RoadmapView/>}
              {view==='builder' && <BuilderView/>}
              {view==='docdesk' && <DocDeskView/>}
              {view==='observa' && <ObservaView/>}
              {view==='roster' && <RosterView/>}
            </main>
          </div>
        </div>
      </div>
    </Tokens>
  );
};

export default App;
