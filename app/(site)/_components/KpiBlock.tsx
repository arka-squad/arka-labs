import React from 'react';

export type KpiProps = {
  label: 'TTFT P95' | 'RTT P95' | 'Erreurs P95' | string;
  value: number;
  unit: 'ms' | '%';
  series: number[];
};

const formatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function Sparkline({ series = [], id, unit }: { series: number[]; id: string; unit: 'ms' | '%' }) {
  const W = 300, H = 60, M = 5;
  let values = series.length ? [...series] : [0];
  if (values.length > 240) values = values.filter((_, i) => i % 10 === 0);
  const clamped = values.map((v) => {
    if (unit === '%') {
      if (v < 0 || v > 100) console.warn('Percent out of range', v);
      return Math.min(100, Math.max(0, v));
    }
    if (v < 0) console.warn('Negative metric', v);
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
  const line = `M ${points[0] || `${M},${H - M}`}` + (points.length > 1 ? ` L ${points.slice(1).join(' ')}` : '');
  const area = `${line} L ${W - M} ${H - M} L ${M} ${H - M} Z`;
  const idBase = id.replace(/[^A-Za-z0-9]/g, '');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-16" aria-hidden="true">
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

export default function KpiBlock({ label, value, unit, series }: KpiProps) {
  const fallback = !series || series.length === 0;
  const s = fallback ? [value] : series;
  const min = Math.min(...s);
  const max = Math.max(...s);
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_8px_24px_rgba(15,23,42,.06)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="uppercase text-xs text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold [font-variant-numeric:tabular-nums] text-slate-900">
            {formatter.format(value)}
            <span className="ml-1 text-slate-500">{"\u00A0"}{unit}</span>
          </div>
        </div>
        {!fallback && (
          <div className="text-xs text-slate-500">
            Min {formatter.format(min)} • Max {formatter.format(max)}
          </div>
        )}
      </div>
      <div className="mt-3">
        <Sparkline id={label} series={s} unit={unit} />
      </div>
    </div>
  );
}

