'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsoleGuard() {
  const router = useRouter();
  useEffect(() => {
    try {
      const has =
        (typeof window !== 'undefined' &&
          (localStorage.getItem('RBAC_TOKEN') || localStorage.getItem('token'))) ||
        (typeof document !== 'undefined' && /(arka_access_token|arka_auth)=/.test(document.cookie));
      if (!has) router.replace('/login');
    } catch {
      router.replace('/login');
    }
  }, [router]);
  return null;
}

