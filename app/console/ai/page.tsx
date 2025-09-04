'use client';
import StreamViewer from '../../../components/ai/StreamViewer';
import RoleBadge from '../../../components/RoleBadge';

export default function AIPilotPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-8 text-slate-200">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gateway IA (pilote)</h1>
        <RoleBadge />
      </header>
      <p className="mb-3 text-sm text-slate-300">Flux token‑par‑token (démo). Dev/Preview uniquement.</p>
      <StreamViewer />
    </main>
  );
}

