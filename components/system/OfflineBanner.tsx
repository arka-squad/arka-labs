'use client';

import { useEffect, useState } from 'react';

type Health = 'ok' | 'degraded' | 'down';

export default function OfflineBanner() {
  const [health, setHealth] = useState<Health>('ok');

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const ping = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        setHealth(res.ok ? 'ok' : 'down');
      } catch {
        setHealth('down');
      }
    };
    ping();
    timer = setInterval(ping, 15000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  if (health === 'ok') return null;

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-50 w-full bg-rose-700/90 text-white">
      <div className="mx-auto max-w-7xl px-4 py-2 text-sm">
        Environnement indisponible — mode lecture‑seule (actions désactivées)
      </div>
    </div>
  );
}

