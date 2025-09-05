/* eslint-disable @next/next/no-img-element */
'use client';

export default function MarketingLanding() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" role="banner" aria-label="En-tête">
        <a href="/" className="text-2xl font-extrabold lowercase tracking-tight text-white">arka</a>
        <nav className="hidden items-center gap-6 md:flex" role="navigation" aria-label="Navigation principale">
          <a href="/#features" className="text-sm text-slate-300 hover:text-white">Fonctionnalités</a>
          <a href="/#how" className="text-sm text-slate-300 hover:text-white">Démo</a>
          <a href="/#pricing" className="text-sm text-slate-300 hover:text-white">Tarifs</a>
          <a href="/#faq" className="text-sm text-slate-300 hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="/cockpit" className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg" style={{ background: 'var(--site-grad)' }}>Ouvrir le cockpit</a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-12">
        <div className="md:col-span-6 lg:col-span-7">
          <h1 className="text-white">
            <span className="block leading-tight sm:text-[32px] md:text-[34px] lg:text-[36px]">Le cockpit pour piloter vos projets</span>
            <span className="block bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 bg-clip-text font-semibold leading-tight text-transparent sm:text-[32px] md:text-[34px] lg:text-[34px]">avec des assistants IA.</span>
          </h1>
          <p className="mt-6 max-w-xl text-slate-300">Parlez normalement, le cockpit agit. Recettes prêtes à l’emploi et preuves simples à partager.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/cockpit" className="rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg" style={{ background: 'var(--site-grad)' }}>
              Ouvrir le cockpit
            </a>
            <a href="/#how" className="rounded-full px-5 py-3 text-sm text-slate-200 ring-1" style={{ borderColor: 'var(--site-border)' }}>
              Voir la démo 90s
            </a>
          </div>
        </div>
        <div className="relative md:col-span-6 lg:col-span-5 flex justify-center">
          <img src="/assets/hero/arkabox-board.png" alt="Aperçu du cockpit" className="w-[150%] max-w-none drop-shadow-2xl" />
        </div>
      </section>

      {/* Placeholders sections */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {["Parlez normalement, le cockpit agit (assigner, vérifier, lier).","Des recettes prêtes pour démarrer et valider chaque sprint.","Des preuves simples à partager (texte + empreintes)."].map((t,i)=> (
            <div key={i} className="site-card p-6">
              <p className="text-white">{t}</p>
              <p className="site-muted text-sm mt-2">Placeholder</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-12 text-sm text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <a href="/legal/mentions" className="hover:text-white">Mentions</a>
          <a href="/legal/privacy" className="hover:text-white">Confidentialité</a>
          <a href="/contact" className="hover:text-white">Contact</a>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Arka</p>
      </footer>
    </main>
  );
}

