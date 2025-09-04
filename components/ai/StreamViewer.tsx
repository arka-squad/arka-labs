'use client';
import React, { useRef, useState } from 'react';

export default function StreamViewer() {
  const [output, setOutput] = useState('');
  const [ttft, setTtft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  async function start() {
    setOutput('');
    setTtft(null);
    setLoading(true);
    const traceId = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    ctrl.current = new AbortController();
    const t0 = Date.now();
    try {
      const res = await fetch('/api/ai/stream?format=txt', {
        headers: { 'X-Trace-Id': traceId },
        signal: ctrl.current.signal,
      });
      if (!res.ok || !res.body) throw new Error('bad_response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let first = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        if (first) { setTtft(Date.now() - t0); first = false; }
        setOutput((s) => s + chunk);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: '#1F2A33', background: '#151F27' }}>
      <div className="flex items-center gap-3">
        <button onClick={start} disabled={loading} className="rounded-md border px-3 py-1 disabled:opacity-50" style={{ borderColor: '#1F2A33', background: '#0C1319' }}>Lancer</button>
        <span className="text-sm text-slate-300">TTFT: {ttft == null ? '—' : `${ttft} ms`}</span>
      </div>
      <pre className="max-h-48 overflow-auto rounded-md bg-black/60 p-3 text-xs text-white" aria-live="polite">{output || '…'}</pre>
    </div>
  );
}

