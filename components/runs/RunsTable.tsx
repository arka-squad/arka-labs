type RunRow = { run_id: string; status: 'PASS'|'FAIL'|'WARN'; p95_ms: number; error_pct: number; sprint: string; trace_id: string };

export default function RunsTable({ items = [] as RunRow[] }: { items?: RunRow[] }) {
  return (
    <div className="rounded-xl border border-soft elevated h-full overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-soft text-sm font-semibold flex items-center justify-between">
        <span>DERNIERS RUNS (20/L)</span>
        <button className="px-2 py-1 rounded border border-soft text-xs text-[var(--text-primary)] hover:bg-white/5">Filtres</button>
      </div>
      <div className="flex-1 overflow-auto scroller pb-3">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--surface)]">
            <tr className="text-left text-secondary">
              <th className="px-4 py-2">run_id</th>
              <th className="px-4 py-2">status</th>
              <th className="px-4 py-2">p95 (ms)</th>
              <th className="px-4 py-2">error %</th>
              <th className="px-4 py-2">sprint</th>
              <th className="px-4 py-2">trace_id</th>
            </tr>
          </thead>
          <tbody>
            {(items.length ? items : demo()).slice(0, 20).map((r) => (
              <tr key={r.run_id} className="border-t border-soft">
                <td className="px-4 py-2">{r.run_id}</td>
                <td className="px-4 py-2">{badge(r.status)}</td>
                <td className="px-4 py-2">{r.p95_ms}</td>
                <td className="px-4 py-2">{r.error_pct}</td>
                <td className="px-4 py-2 text-muted">{r.sprint}</td>
                <td className="px-4 py-2"><a className="text-sky-400" href={`#${r.trace_id}`}>{r.trace_id}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function badge(s: RunRow['status']) {
  const map = { PASS: 'bg-emerald-600', FAIL: 'bg-rose-600', WARN: 'bg-amber-500' } as const;
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs text-white ${map[s]}`}>{s}</span>;
}

function demo(): RunRow[] { return []; }
