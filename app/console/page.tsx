'use client';


import { redirect } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import { apiFetch } from '../../lib/http';
import { generateTraceId, TRACE_HEADER } from '../../lib/trace';

type Project = {
  id: string;
  name: string;
  description: string;
  last_activity: string;
};
function since(ts: string) {
  const d = Math.max(0, Date.now() - new Date(ts).getTime());
  const m = Math.floor(d / 60000),
    h = Math.floor(m / 60),
    dd = Math.floor(h / 24);
  if (dd) return `il y a ${dd} j`;
  if (h) return `il y a ${h} h`;
  if (m) return `il y a ${m} min`;
  return 'à l’instant';
}
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [err, setErr] = useState('');
  const [threads, setThreads] = useState<{ id: string; title: string; last_msg_at: string }[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const trace_id = generateTraceId();
        const res = await apiFetch('/api/projects', { credentials: 'include', headers: { [TRACE_HEADER]: trace_id } });
        const data = await (res.ok
          ? res.json()
          : Promise.reject(new Error(String(res.status))));
        const delay =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              '--motion-skeleton-duration',
            ),
          ) || 200;
        setTimeout(() => {
          if (active) setProjects(data.projects || []);
        }, delay);
      } catch {
        if (active) {
          setErr('Erreur de récupération');
          setProjects([]);
        }
      }
    };
    load();
    // Threads récents (max 5)
    const loadThreads = async () => {
      try {
        const trace_id = generateTraceId();
        const res = await apiFetch('/api/chat/threads', { headers: { [TRACE_HEADER]: trace_id } });
        const data = await (res.ok ? res.json() : { items: [] });
        setThreads(Array.isArray(data.items) ? data.items.slice(0, 5) : []);
      } catch {
        setThreads([]);
      }
    };
    loadThreads();
    return () => {
      active = false;
    };
  }, []);

  const content = useMemo(() => {
    if (projects === null) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4"
            />
          ))}
        </div>
      );
    }
    if (!projects.length) {
      return (
        <div className="mx-auto max-w-md text-center">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8">
            <h3 className="mb-2 text-lg font-semibold">Aucun projet</h3>
            <p className="mb-4 text-sm text-slate-400">
              Créez votre premier projet pour commencer.
            </p>
            <button
              className="rounded-xl px-4 py-2 text-white"
              style={{
                background:
                  'linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)',
              }}
              onClick={() => alert('POST /api/projects (à brancher)')}
            >
              Créer un projet
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <div
            key={p.id}
            style={{ animationDelay: `calc(var(--motion-stagger) * ${i})` }}
            className="animate-fade-in-up opacity-0 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4"
          >
            <div className="mb-1 text-base font-semibold">{p.name}</div>
            <div className="mb-3 text-sm text-slate-300">
              {p.description || '—'}
            </div>
            <div className="text-xs text-slate-400">
              Dernière activité • {since(p.last_activity)}
            </div>
          </div>
        ))}
      </div>
    );
  }, [projects]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-slate-200">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 bg-clip-text text-2xl font-bold text-transparent">
          Projects
        </h1>
        <span className="text-xs text-emerald-400">
          {err ? 'API status: error' : 'API status: ok'}
        </span>
      </header>
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-300">Threads récents</h2>
        {threads.length === 0 ? (
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3 text-xs text-slate-400">Aucun thread récent.</div>
        ) : (
          <ul className="divide-y divide-slate-700/40 rounded-xl border border-slate-700/40 bg-slate-800/30">
            {threads.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="truncate pr-3 text-slate-200">{t.title || '(sans titre)'}</span>
                <span className="text-xs text-slate-400">{since(t.last_msg_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {err && (
        <div className="mb-4 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-2 text-sm text-rose-200">
          {err}
        </div>
      )}

      {content}
    </main>
  );
}
