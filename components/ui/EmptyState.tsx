'use client';

export default function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8">
        <h3 className="mb-2 text-lg font-semibold">Aucun projet</h3>
        <p className="mb-4 text-sm text-slate-400">Créez votre premier projet pour commencer.</p>
        <button
          className="rounded-xl px-4 py-2 text-white"
          style={{ background: 'linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)' }}
          onClick={onCreate}
        >
          Créer un projet
        </button>
      </div>
    </div>
  );
}
