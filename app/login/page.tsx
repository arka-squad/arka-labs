'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uiLog } from '../../lib/ui-log';
import { useRole } from '../../src/role-context';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const { role } = useRole();

  useEffect(() => {
    uiLog('mount', { role });
    const saved = localStorage.getItem('remember-email');
    if (saved) setEmail(saved);
  }, [role]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      if (remember) localStorage.setItem('remember-email', email);
      uiLog('login_success', { role });
      router.push('/console');
    } else {
      uiLog('login_fail', { status: res.status, role });
      setError(res.status === 401 ? 'Identifiants invalides' : 'Requête incorrecte');
    }
  }

  async function sso() {
    const res = await fetch('/api/auth/sso/start');
    uiLog('sso_click', { status: res.status, role });
    alert('501 Indisponible');
  }

  return (
    <main className="mx-auto mt-16 max-w-md p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">Connexion</h1>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm">Email</span>
          <input
            className="rounded-md px-3 py-2 text-black"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Mot de passe</span>
          <input
            className="rounded-md px-3 py-2 text-black"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
        <button
          type="submit"
          className="rounded-xl px-4 py-2 font-medium text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
          style={{ background: 'var(--arka-grad-cta)' }}

        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={sso}
          className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"

        >
          SSO
        </button>
      </form>
    </main>
  );
}
