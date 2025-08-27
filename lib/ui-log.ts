'use client';
export function uiLog(event: string, fields: Record<string, any> = {}): void {
  const ts = Date.now();
  const route = typeof window !== 'undefined' ? window.location.pathname : '';
  const duration_ms = Math.round(performance.now());
  const payload = { ts, route, status: 'ok', duration_ms, cat: 'ui', event, ...fields };
  console.info(JSON.stringify(payload));
}
