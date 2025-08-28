'use client';

import { useEffect, useRef, useState } from 'react';
import { MAX_ITEMS, useAgentEvents } from '../hooks/useAgentEvents';

type AgentEventsPanelProps = {
  agentId: string;
};

type Toast = { id: number; message: string };

export function AgentEventsPanel({ agentId }: AgentEventsPanelProps) {
  const { events, status, error, errorId, clear } = useAgentEvents(agentId);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!error) return;
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message: error }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
    return () => clearTimeout(timer);
  }, [errorId, error]);

  useEffect(() => {
    if (!autoScroll) return;
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [events.length, autoScroll]);

  const statusLabel =
    status === 'connected' ? 'Connected' : status === 'reconnecting' ? 'Reconnecting…' : 'Error';

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="rounded bg-red-600 px-3 py-2 text-sm text-white shadow"
          >
            {t.message}
          </div>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm">Status: {statusLabel}</span>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          <button
            onClick={clear}
            className="rounded bg-slate-700 px-2 py-1 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className="h-64 overflow-auto rounded border p-2 text-xs"
        style={{ borderColor: 'var(--arka-border)' }}
        role="log"
        aria-live="polite"
      >
        {events.map((evt) => (
          <pre key={evt.id} className="mb-1 whitespace-pre-wrap break-words">
            {JSON.stringify(evt.data, null, 2)}
          </pre>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Showing up to {MAX_ITEMS} recent events.
      </p>
    </div>
  );
}

