'use client';

let cachedSession = '';
function getSessionId() {
  if (typeof window === 'undefined') return '';
  if (!cachedSession) {
    cachedSession = sessionStorage.getItem('session_id') || '';
    if (!cachedSession) {
      cachedSession = crypto.randomUUID();
      sessionStorage.setItem('session_id', cachedSession);
    }
  }
  return cachedSession;
}

export function uiLog(event: string, fields: Record<string, any> = {}): void {
  const ts = Date.now();
  const route = typeof window !== 'undefined' ? window.location.pathname : '';
  const duration_ms = Math.round(performance.now());
  const session_id = getSessionId();
  const payload = {
    ts,
    route,
    status: 'ok',
    duration_ms,
    cat: 'ui',
    event,
    session_id,
    ...fields,
  };
  console.info(JSON.stringify(payload));
}
