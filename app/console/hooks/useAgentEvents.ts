'use client';

import { useEffect, useRef, useState } from 'react';

export const MAX_ITEMS = 500;

export type AgentEventStatus = 'connected' | 'reconnecting' | 'error';

export type AgentEvent<T = unknown> = {
  id: number;
  data: T;
};

export function useAgentEvents<T = unknown>(agentId: string) {
  const [events, setEvents] = useState<AgentEvent<T>[]>([]);
  const [status, setStatus] = useState<AgentEventStatus>('reconnecting');
  const [error, setError] = useState<string | null>(null);
  const [errorId, setErrorId] = useState(0);
  const queueRef = useRef<AgentEvent<T>[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const queue = queueRef.current;
    const flush = () => {
      if (queue.length) {
        setEvents((prev) => {
          const next = prev.concat(queue);
          if (next.length > MAX_ITEMS) {
            next.splice(0, next.length - MAX_ITEMS);
          }
          return next;
        });
        queue.length = 0;
      }
    };

    const interval = window.setInterval(() => {
      requestAnimationFrame(flush);
    }, 50);

    const es = new EventSource(`/api/agents/events?agent=${agentId}`);

    es.onopen = () => {
      setStatus('connected');
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as T;
        queue.push({ id: idRef.current++, data });
      } catch {
        setError('Event parse error');
        setErrorId((id) => id + 1);
      }
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setStatus('error');
      } else {
        setStatus('reconnecting');
      }
      setError('Connection error');
      setErrorId((id) => id + 1);
    };

    return () => {
      es.close();
      clearInterval(interval);
    };
  }, [agentId]);

  const clear = () => {
    setEvents([]);
    queueRef.current = [];
  };

  return { events, status, error, errorId, clear };
}

