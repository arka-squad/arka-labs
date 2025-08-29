'use client';
import { useEffect, useMemo, useState } from 'react';
import ProjectCard, { Project } from '../../components/ui/ProjectCard';
import EmptyState from '../../components/ui/EmptyState';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/projects', { credentials: 'include' })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setProjects(d.projects || []))
      .catch(() => {
        setErr('Erreur de récupération');
        setProjects([]);
      });
  }, []);

  const content = useMemo(() => {
    if (projects === null) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4" />
          ))}
        </div>
      );
    }
    if (!projects.length) {
      return <EmptyState onCreate={() => alert('POST /api/projects (à brancher)')} />;
    }
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
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
        <span className="text-xs text-emerald-400">{err ? 'API status: error' : 'API status: ok'}</span>
      </header>
      {err && (
        <div className="mb-4 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-2 text-sm text-rose-200">
          {err}
        </div>
      )}
      {content}
    </main>
  );
}
