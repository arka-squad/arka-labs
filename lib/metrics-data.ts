export type MetricRun = {
  id: number;
  lot: 'M1' | 'M2';
  sprint: 'S1' | 'S2';
  ttft_ms: number;
  rtt_ms: number;
  error_rate_percent: number;
};

export const mockRuns: MetricRun[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  lot: i < 25 ? 'M1' : 'M2',
  sprint: i % 2 === 0 ? 'S1' : 'S2',
  ttft_ms: Number((500 + i * 1.7).toFixed(1)),
  rtt_ms: Number((900 + i * 2.3).toFixed(1)),
  error_rate_percent: Number(((i % 5) * 0.5 + 0.1).toFixed(1)),
}));

export const p95 = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(0.95 * (sorted.length - 1));
  return sorted[idx];
};

export const avg = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};
