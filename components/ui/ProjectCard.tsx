export type Project = { id: string; name: string; description: string; last_activity: string };

function since(ts: string) {
  const d = Math.max(0, Date.now() - new Date(ts).getTime());
  const m = Math.floor(d / 60000), h = Math.floor(m / 60), dd = Math.floor(h / 24);
  if (dd) return `il y a ${dd} j`;
  if (h) return `il y a ${h} h`;
  if (m) return `il y a ${m} min`;
  return 'à l’instant';
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4">
      <div className="mb-1 text-base font-semibold">{project.name}</div>
      <div className="mb-3 text-sm text-slate-300">{project.description || '—'}</div>
      <div className="text-xs text-slate-400">Dernière activité • {since(project.last_activity)}</div>
    </div>
  );
}
