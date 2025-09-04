'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uiLog } from '../../lib/ui-log';
import { apiFetch } from '../../lib/http';
import { useRole } from '../../src/role-context';
import { generateTraceId, TRACE_HEADER } from '../../lib/trace';
import { loginCopy, resolveLoginError } from './messages';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const { role } = useRole();
  const [tokenPaste, setTokenPaste] = useState('');

  useEffect(() => {
    uiLog('mount', { role });
    const saved = localStorage.getItem('remember-email');
    if (saved) setEmail(saved);
    const hasToken =
      localStorage.getItem('RBAC_TOKEN') ||
      localStorage.getItem('token') ||
      /(arka_access_token|arka_auth)=/.test(document.cookie);
<<<<<<< HEAD
    if (hasToken) router.replace('/cockpit');
=======
    if (hasToken) router.replace('/cockpit');
>>>>>>> feat/b13-ui-cockpit-dashboard
  }, [role, router]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const trace_id = generateTraceId();
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json', [TRACE_HEADER]: trace_id },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        if (remember) localStorage.setItem('remember-email', email);
        uiLog('login_success', { role, trace_id });
<<<<<<< HEAD
        router.push('/cockpit');
=======
        router.push('/cockpit');
>>>>>>> feat/b13-ui-cockpit-dashboard
      } else {
        uiLog('login_fail', { status: res.status, role, trace_id });
        let code: string | undefined;
        if (res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json().catch(() => null);
          code = data?.code;
        }
        setError(resolveLoginError(code));
      }
    } catch {
      setError(resolveLoginError(undefined, true));
    }
  }

  async function sso() {
    const trace_id = generateTraceId();
    const res = await apiFetch('/api/auth/sso/start', { headers: { [TRACE_HEADER]: trace_id } });
    uiLog('sso_click', { status: res.status, role, trace_id });
    alert('501 Indisponible');
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 text-white">
      <div
        className="w-full max-w-sm rounded-xl border p-6"
        style={{ backgroundColor: 'var(--arka-card)', borderColor: 'var(--arka-border)' }}
      >
        <h1 className="mb-6 text-center text-2xl font-bold">Connexion</h1>
        <form onSubmit={submit} className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm">{loginCopy.email}</span>
            <input
              className="rounded-md px-3 py-2 text-black focus-visible:ring-2 focus-visible:ring-slate-700/60"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-codex-id="login_email"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{loginCopy.password}</span>
            <input
              className="rounded-md px-3 py-2 text-black focus-visible:ring-2 focus-visible:ring-slate-700/60"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-codex-id="login_password"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Se souvenir de moi
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {!error && (
            <a href="/reset" data-codex-id="link_reset" className="text-sm underline">
              {loginCopy.forgot}
            </a>

          )}
          <button
            type="submit"
            className="rounded-xl px-4 py-2 font-medium text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
            style={{ background: 'var(--arka-grad-cta)' }}
            data-codex-id="login_submit"
          >
            {loginCopy.submit}
          </button>
          <a
            href="/reset"
            className="text-center text-sm text-slate-300 hover:text-white"
            data-codex-id="link_reset"
          >
            Mot de passe oubliÃ© ?
          </a>
          <button
            type="button"
            onClick={sso}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
          >
            SSO
          </button>
        </form>
        <div className="mt-6 border-t border-slate-700/50 pt-4">
          <h2 className="mb-2 text-sm font-semibold">Coller un token (RBAC JWT)</h2>
          <textarea
            className="mb-2 h-20 w-full rounded-md px-3 py-2 text-black"
            placeholder="RBAC_TOKEN..."
            value={tokenPaste}
            onChange={(e) => setTokenPaste(e.target.value)}
          />
          <button
            type="button"
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              try {
                if (tokenPaste.trim()) {
                  localStorage.setItem('RBAC_TOKEN', tokenPaste.trim());
                  // compat: ancien wrapper
                  localStorage.setItem('access_token', tokenPaste.trim());
                  uiLog('login_token_paste');
<<<<<<< HEAD
                  router.push('/cockpit');
=======
                  router.push('/cockpit');
>>>>>>> feat/b13-ui-cockpit-dashboard
                }
              } catch {}
            }}
          >
            Se connecter avec un token
          </button>
        </div>
      </div>
      {toast && <div className="fixed bottom-4 right-4 rounded bg-black px-4 py-2 text-sm">{toast}</div>}
    </main>
  );
}

