import { TOKENS } from '../landing/tokens';

export default function BetaPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-200">
      <h1 className="mb-4 text-2xl font-bold text-white">Programme bêta</h1>
      <p className="mb-6">Rejoignez la version bêta pour accéder à la console en avant-première.</p>
      <a
        href="/console"
        className="inline-block rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg"
        style={{ background: TOKENS.gradCTA }}
      >
        Accéder à la console
      </a>
    </main>
  );
}
