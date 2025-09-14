'use client';

import { useEffect, useState } from 'react';

export type OfflineState = { online: boolean; health: 'ok' | 'degraded' | 'down' };

export function useOfflineState(): OfflineState {
  const [state, setState] = useState<OfflineState>({ online: true, health: 'ok' });
  useEffect(() => {
    const onOnline = () => setState((s) => ({ ...s, online: true }));
    const onOffline = () => setState((s) => ({ ...s, online: false }));
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const ping = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        setState((s) => ({ ...s, health: res.ok ? 'ok' : 'down' }));
      } catch {
        setState((s) => ({ ...s, health: 'down' }));
      }
    };
    ping();
    timer = setInterval(ping, 20000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);
  return state;
}

