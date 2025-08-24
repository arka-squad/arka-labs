const latencies: number[] = [];

export function recordLatency(ms: number) {
  latencies.push(ms);
  if (latencies.length > 100) latencies.shift();
}

export function gatherMetrics() {
  const count = latencies.length;
  const avg = count ? latencies.reduce((a, b) => a + b, 0) / count : 0;
  return { count, avg };
}
