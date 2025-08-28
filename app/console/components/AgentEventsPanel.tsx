'use client';
import { useEffect, useState } from 'react';
import { useAgentEvents, AgentEvent } from '../hooks/useAgentEvents';
import { Pill } from '../../../src/ui/Pill';

const TYPE_CLASSES: Record<string, string> = {
  message: 'bg-green-600 text-white',
  ping: 'bg-blue-600 text-white',
  error: 'bg-red-600 text-white',
};

function relativeTime(ts?: string) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  const sec = Math.round(diff / 1000);
  if (sec < 60) return rtf.format(-sec, 'second');
  const min = Math.round(sec / 60);
  if (min < 60) return rtf.format(-min, 'minute');
  const hr = Math.round(min / 60);
  return rtf.format(-hr, 'hour');
}

export default function AgentEventsPanel({ agentId }: { agentId: string }) {
  const events = useAgentEvents(agentId);
  const [paused, setPaused] = useState(false);
  const [displayed, setDisplayed] = useState<AgentEvent[]>([]);

  useEffect(() => {
    if (!paused) setDisplayed(events);
  }, [events, paused]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          aria-label={paused ? 'Reprendre' : 'Pause'}
          onClick={() => setPaused((p) => !p)}
          className="rounded-lg bg-slate-700 px-3 py-1 text-xs focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      {displayed.length === 0 ? (
        <p className="text-sm text-slate-400">Aucun événement pour le moment</p>
      ) : (
        <ul role="log" tabIndex={0} className="flex max-h-96 flex-col gap-2 overflow-auto">
          {displayed.map((ev, i) => (
            <li key={i} className="flex items-center gap-3">
              <Pill className={TYPE_CLASSES[ev.event] || 'bg-slate-600 text-white'}>{ev.event}</Pill>
              <div className="flex-1">
                {ev.title && <p className="text-sm font-medium">{ev.title}</p>}
                {ev.summary && <p className="text-xs text-slate-300">{ev.summary}</p>}
              </div>
              <time className="text-xs text-slate-400">{relativeTime(ev.ts)}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
