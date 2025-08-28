'use client';
import { useEffect, useState } from 'react';

export type AgentEvent = {
  id?: string;
  ts?: string;
  agent: string;
  event: 'message' | 'ping' | 'error' | string;
  title?: string;
  summary?: string;
  labels?: string[];
};

export function useAgentEvents(agentId: string) {
  const [events, setEvents] = useState<AgentEvent[]>([]);

  useEffect(() => {
    if (!agentId) return;
    const src = new EventSource(`/api/agents/events?agent=${encodeURIComponent(agentId)}`);

    src.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as AgentEvent;
        setEvents((prev) => [data, ...prev]);
      } catch (err) {
        console.error('Invalid event payload', err);
      }
    };

    src.onerror = (e) => {
      console.error('EventSource error', e);
    };

    return () => {
      src.close();
    };
  }, [agentId]);

  return events;
}
