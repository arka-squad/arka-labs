function Sparkline({ values = [], id, unit }: { values: number[]; id: string; unit: 'ms'|'%' }) {
  // Spec: W=300, H=60, inner margin 5
  const W = 300, H = 60, M = 5;
  const safeValues = values.length ? values.slice(0) : [0];
  // Clamp according to unit
  const clamped = safeValues.map(v => {
    if (unit === '%') return Math.max(0, Math.min(100, v));
    return Math.max(0, v);
  });
  const min0 = Math.min(...clamped);
  const max0 = Math.max(...clamped);
  const same = min0 === max0;
  const min = same ? min0 * 0.995 : min0;
  const max = same ? max0 * 1.005 : max0;
  const range = max - min || 1;
  const n = Math.max(1, clamped.length - 1);
  const points = clamped.map((v, i) => {
    const x = M + (i * (W - 2 * M)) / n;
    const y = M + (H - 2 * M) - ((v - min) / range) * (H - 2 * M);
    return `${x},${y}`;
  });
  const line = `M ${points[0] || `${M},${H - M}`}` + (points.slice(1).length ? ` L ${points.slice(1).join(' ')}` : '');
  const area = `${line} L ${W - M} ${H - M} L ${M} ${H - M} Z`;
  const idBase = id.replace(/[^A-Za-z0-9]/g, '');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-16" aria-hidden>
      <defs>
        <linearGradient id={`line-${idBase}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FAB652" />
          <stop offset="50%" stopColor="#F25636" />
          <stop offset="100%" stopColor="#E0026D" />
        </linearGradient>
        <linearGradient id={`area-${idBase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAB652" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#E0026D" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#E0026D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#area-${idBase})`} stroke="none" />
      <path d={line} fill="none" stroke={`url(#line-${idBase})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function format1(n: number) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
}

function KpiBlock({ label, value, unit, series }: { label: string; value: number; unit: 'ms'|'%'; series: number[] }) {
  const s = series && series.length ? series : [value];
  const min = Math.min(...s);
  const max = Math.max(...s);
  const nbsp = '\u00A0';
  return (
    <div className="relative bg-white ring-1 ring-black/5 shadow-[0_8px_24px_rgba(15,23,42,.06)] rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="uppercase text-xs" style={{ color: '#64748B' }}>{label}</div>
          <div className="mt-1 text-2xl font-semibold [font-variant-numeric:tabular-nums]" style={{ color: '#0F172A' }}>
            {format1(value)}<span className="ml-1" style={{ color: '#64748B' }}>{nbsp}{unit}</span>
          </div>
        </div>
        {s.length > 0 && (
          <div className="text-xs" style={{ color: '#64748B' }}>Min {format1(min)} • Max {format1(max)}</div>
        )}
      </div>
      <div className="mt-3">
        <Sparkline id={label} values={s} unit={unit} />
      </div>
    </div>
  );
}

export default function KPIStrip({
  ttft_ms = 1.5,
  rtt_ms = 3.2,
  error_rate_percent = 0.8,
}: { ttft_ms?: number; rtt_ms?: number; error_rate_percent?: number }) {
  return (
    <section aria-label="Indicateurs clés" className="mx-auto mt-10 max-w-[1440px] px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiBlock label="TTFT p95" value={ttft_ms} unit="ms" series={[1.9,1.7,1.6,1.5,1.6,1.5]} />
        <KpiBlock label="RTT p95" value={rtt_ms} unit="ms" series={[3.4,3.3,3.2,3.2,3.3,3.2]} />
        <KpiBlock label="Erreurs p95" value={error_rate_percent} unit="%" series={[0.9,0.8,0.8,0.9,0.8,0.8]} />
      </div>
    </section>
  );
}
