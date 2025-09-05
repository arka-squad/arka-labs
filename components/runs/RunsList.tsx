"use client";

import * as React from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowUpDown, Filter, GitCommit } from 'lucide-react';

export type RunRow = {
  run_id: string;
  status: 'PASS'|'FAIL'|'WARN';
  p95_ms: number;
  error_pct: number;
  sprint: string;
  trace_id: string;
  created_at?: string;
};

const ORDER: Record<RunRow['status'], number> = { FAIL: 0, WARN: 1, PASS: 2 };

const sortStable = (by: keyof RunRow, dir: 'asc'|'desc') => (a: RunRow, b: RunRow) => {
  const m = dir === 'asc' ? 1 : -1;
  if (by === 'status') {
    if (ORDER[a.status] !== ORDER[b.status]) return (ORDER[a.status] - ORDER[b.status]) * m;
    return a.run_id.localeCompare(b.run_id);
  }
  if (by === 'sprint') {
    const na = parseInt(a.sprint.replace(/\D+/g,'')) || 0;
    const nb = parseInt(b.sprint.replace(/\D+/g,'')) || 0;
    if (na !== nb) return (na - nb) * m;
    return a.run_id.localeCompare(b.run_id);
  }
  const va = (a as any)[by]; const vb = (b as any)[by];
  if (va < vb) return -1 * m; if (va > vb) return 1 * m; return a.run_id.localeCompare(b.run_id);
};

const SortIcon: React.FC<{ active: boolean; dir: 'asc'|'desc' }> = ({ active, dir }) =>
  active ? (dir === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ArrowUpDown className="w-3 h-3"/>;

const StatusPill: React.FC<{ s: RunRow['status'] }> = ({ s }) => {
  const map = { PASS: 'bg-emerald-600', FAIL: 'bg-rose-600', WARN: 'bg-amber-500' } as const;
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs text-white ${map[s]}`}>{s}</span>;
};

export const RunsList: React.FC<{ data?: RunRow[] }> = ({ data }) => {
  const PAGE_SIZE = 20;
  const base = (data && data.length ? data : []) as RunRow[];

  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<{ by: keyof RunRow; dir: 'asc'|'desc' }>({ by: 'run_id', dir: 'desc' });
  const [copied, setCopied] = React.useState<string|null>(null);

  const total = base.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageRows = React.useMemo(() => {
    const sorted = [...base].sort(sortStable(sort.by, sort.dir));
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [base, page, sort]);

  const setSortCol = (by: keyof RunRow) =>
    setSort(s => ({ by, dir: s.by === by ? (s.dir === 'asc' ? 'desc' : 'asc') : 'desc' }));

  const onCopy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); setCopied(t); setTimeout(() => setCopied(null), 1200); } catch {}
  };

  return (
    <div className="rounded-xl border border-soft elevated p-3 h-full overflow-hidden"
      onKeyDown={(e)=>{ if((e as any).altKey && e.key==='ArrowLeft'){ e.preventDefault(); setPage(p=>Math.max(1,p-1)); }
                        if((e as any).altKey && e.key==='ArrowRight'){ e.preventDefault(); setPage(p=>Math.min(pages,p+1)); } }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <GitCommit className="w-4 h-4"/>
          <span>DERNIERS RUNS (20/L)</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1" title="Filtres">
            <Filter className="w-3 h-3"/> Filtres
          </button>
        </div>
      </div>

      <div className="h-full min-h-0 overflow-auto scroller pb-3">
        <table className="w-full text-sm" role="table">
          <thead className="sticky top-0 bg-[var(--surface)] text-[var(--fgdim)]" role="rowgroup">
            <tr className="text-left" role="row">
              {([
                ['run_id','run_id'],
                ['status','status'],
                ['p95_ms','p95 (ms)'],
                ['error_pct','error %'],
                ['sprint','sprint'],
                ['trace_id','trace_id'],
              ] as [keyof RunRow, string][]).map(([key, label]) => (
                <th key={key as string} scope="col" className="px-3 py-2 select-none">
                  <button onClick={() => key!=='trace_id' && setSortCol(key)}
                          className="inline-flex items-center gap-1 text-[var(--fgdim)] hover:text-[var(--fg)]">
                    <span>{label}</span>
                    {key!=='trace_id' && <SortIcon active={sort.by === key} dir={sort.dir}/>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {pageRows.map(r => (
              <tr key={r.run_id} className="border-t border-[var(--border)]/60 hover:bg-white/5" role="row">
                <td className="px-3 py-2 font-mono text-[var(--fg)]/90" role="cell">#{r.run_id}</td>
                <td className="px-3 py-2" role="cell"><StatusPill s={r.status as any}/></td>
                <td className="px-3 py-2 tabular-nums" role="cell">{r.p95_ms}</td>
                <td className="px-3 py-2 tabular-nums" role="cell">{r.error_pct}</td>
                <td className="px-3 py-2" role="cell">{r.sprint}</td>
                <td className="px-3 py-2" role="cell">
                  <button onClick={()=>onCopy(r.trace_id)} className="text-[var(--primary)] hover:underline"
                          aria-label={`Copier le trace_id ${r.trace_id}`} title="Copier le trace_id">
                    {r.trace_id}
                  </button>
                  {copied===r.trace_id && <span className="ml-2 text-[10px] text-[var(--fgdim)]">Copié</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button aria-label="Page précédente" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
                className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] disabled:opacity-50">
          <ChevronLeft className="w-3 h-3"/>
        </button>
        <span className="text-xs text-[var(--fgdim)]">page {page} / {pages}</span>
        <button aria-label="Page suivante" onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page>=pages}
                className="px-2 py-1 rounded bg-white/5 border border-[var(--border)] disabled:opacity-50">
          <ChevronRight className="w-3 h-3"/>
        </button>
      </div>
    </div>
  );
};

export default RunsList;
