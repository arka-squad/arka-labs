export default function KpiCard({ label, value, unit, trend = [] }: { label: string; value: number | string; unit?: string; trend?: number[] }) {
  return (
    <div className="rounded-xl border border-soft elevated p-4 relative">
      <div className="text-xs text-muted">{label}</div>
      <div className="absolute right-3 top-2 text-[10px] text-muted">
        {miniMax(trend)}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <div className="text-3xl font-bold text-primary">{value}</div>
        {unit ? <div className="text-sm text-secondary">{unit}</div> : null}
      </div>
      <div className="mt-3 h-10 w-full overflow-hidden rounded-md" aria-hidden>
        <Sparkline data={trend} />
      </div>
    </div>
  );
}

function Sparkline({ data = [] as number[] }) {
  if (!data.length) data = [4, 5, 6, 7, 6, 5, 6, 7, 8];
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--grad-start)" />
          <stop offset="50%" stopColor="var(--grad-mid)" />
          <stop offset="100%" stopColor="var(--grad-end)" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="url(#grad)" strokeWidth="2" points={pts} strokeLinejoin="round" strokeLinecap="round" />
      <polygon fill="url(#grad)" opacity="0.15" points={`0,100 ${pts} 100,100`} />
    </svg>
  );
}

function miniMax(trend: number[] = []) {
  if (!trend.length) return null;
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  return (
    <span>
      Min {min} · Max {max}
    </span>
  );
}

