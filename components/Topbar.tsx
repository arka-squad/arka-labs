'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uiLog } from '../lib/ui-log';
import { apiFetch } from '../lib/http';

export default function Topbar() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const hasToken =
      typeof window !== 'undefined' &&
      (localStorage.getItem('token') || /(arka_access_token|arka_auth)=/.test(document.cookie));
    setAuthed(Boolean(hasToken));
  }, []);

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    try {
      localStorage.removeItem('token');
    } catch {}
    uiLog('logout');
    router.replace('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3" style={{backgroundColor: 'var(--arka-bg)'}}>
      <div className="flex items-center gap-4">
        <a href="/" data-codex-id="topbar_logo" className="text-lg font-bold">Arka</a>
        <span className="text-lg font-semibold">Console</span>
        <select
          data-codex-id="project_selector"
          defaultValue=""
          className="rounded-md bg-slate-800 px-2 py-1 text-sm"
        >
          <option value="" disabled>
            Aucun projet — créez-en un
          </option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button data-codex-id="btn_theme" className="rounded bg-slate-700 px-2 py-1 text-sm" onClick={() => {}}>
          Thème
        </button>
        <button data-codex-id="btn_settings" className="rounded bg-slate-700 px-2 py-1 text-sm" onClick={() => {}}>
          Paramètres
        </button>
        {authed && (
          <button
            data-codex-id="topbar_logout"
            onClick={logout}
            className="rounded bg-slate-700 px-2 py-1 text-sm"
          >
            Déconnexion
          </button>
        )}
      </div>
    </header>
  );
}

