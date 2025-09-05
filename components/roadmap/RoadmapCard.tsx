type RoadmapLane = {
  id: string;
  name: string;
  tags: string[];
  start: string; // month label, e.g. 'Jan'
  end: string;   // month label, e.g. 'Mar'
  chip?: string;
  owner?: string;
  state?: 'Planned'|'Active'|'Gated'|'Review'|'Done';
  risk?: 'low'|'med'|'high';
};

export default function RoadmapCard({ months = [], lanes = [] as RoadmapLane[] }: { months?: string[]; lanes?: RoadmapLane[] }) {
  const m = months.length ? months : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const toIdx = (mm: string) => Math.max(0, m.findIndex((x) => x.toLowerCase().startsWith(mm.toLowerCase())));
  const palette = ['#22D3EE','#38BDF8','#14B8A6','#A78BFA','#F472B6','#34D399'];

  return (
    <div className="rounded-xl border border-soft elevated p-3 h-full overflow-hidden flex flex-col">
      {/* Section header (48px) */}
      <div className="h-12 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Roadmap — 12 mois</h3>
        <div className="flex items-center gap-2 text-xs">
          <button className="px-2 py-1 rounded border border-soft hover:bg-white/5">3m</button>
          <button className="px-2 py-1 rounded border border-soft hover:bg-white/5">6m</button>
          <button className="px-2 py-1 rounded border border-soft hover:bg-white/5">12m</button>
          <div className="mx-1" />
          <button className="px-2 py-1 rounded border border-soft hover:bg-white/5">Zoom −</button>
          <button className="px-2 py-1 rounded border border-soft hover:bg-white/5">Zoom +</button>
        </div>
      </div>

      {/* Scroll container for grid (vertical scroll only here) */}
      <div className="flex-1 min-h-0 overflow-auto scroller">
        <div className="grid grid-cols-[180px_1fr] gap-3 h-full min-h-0">
          {/* Left meta column (align with lanes; pad for months header height) */}
          <div className="pt-6 pr-2 text-xs">
            <div className="space-y-2">
              {lanes.map((l) => (
                <div key={l.id} className="h-8 flex items-center gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--fg)]/90 truncate" title={l.name}>{l.name}</div>
                  </div>
                  {/* chips: epic id + owner */}
                  {(l.chip || l.tags?.[0]) && (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-[var(--border)] text-[10px] text-[var(--fgdim)] font-mono whitespace-nowrap">
                      {l.chip || l.tags?.[0]}
                    </span>
                  )}
                  {l.owner && (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-[var(--border)] text-[10px] text-[var(--fgdim)] whitespace-nowrap">
                      {l.owner}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline (right) with sticky months header and lanes */}
          <div className="relative min-w-[720px]">
            {/* Months header sticky */}
            <div role="row" className="grid grid-cols-12 gap-1 sticky top-0 z-[1] bg-[var(--surface)] py-1 text-[10px] text-muted">
              {m.map((mm) => (
                <div role="columnheader" key={mm} className="text-center">{mm}</div>
              ))}
            </div>
            {/* Lanes */}
            <div role="table" aria-label="Roadmap timeline" className="mt-2 space-y-2">
              {lanes.map((l, i) => {
                const s = toIdx(l.start);
                const e = toIdx(l.end) + 1;
                const span = Math.max(1, e - s);
                const color = palette[i % palette.length];
                const rgba = (hex: string, a: number) => {
                  const h = hex.replace('#','');
                  const r = parseInt(h.substring(0,2),16);
                  const g = parseInt(h.substring(2,4),16);
                  const b = parseInt(h.substring(4,6),16);
                  return `rgba(${r}, ${g}, ${b}, ${a})`;
                };
                return (
                  <div key={l.id} role="row" className="relative grid grid-cols-12 gap-1 h-8">
                    {/* Lane backdrop (no border, only subtle fill) */}
                    <div className="pointer-events-none absolute inset-0 rounded bg-white/5" />
                    {/* Item bar */}
                    <div
                      role="gridcell"
                      tabIndex={0}
                      aria-colspan={span}
                      className="relative rounded-full border px-3 flex items-center justify-between text-xs text-[var(--fg)]/90"
                      style={{
                        gridColumn: `${s + 1} / span ${span}`,
                        backgroundColor: rgba(color, 0.20),
                        borderColor: rgba(color, 0.45),
                      }}
                      title={`${l.name} — ${m[s]} → ${m[e-1]}`}
                    >
                      {/* Epic name inside bar */}
                      <span className="truncate" title={l.name}>{l.name}</span>
                      {/* Right-aligned chip (epic id) inside bar */}
                      {(l.chip || (l.tags && l.tags[0])) && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-white/10 border border-[var(--border)] text-[10px] font-mono text-[var(--fgdim)]">
                          {l.chip || (l.tags && l.tags[0])}
                        </span>
                      )}
                      <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
