/* eslint-disable @next/next/no-img-element */
'use client';

import type { SVGProps } from 'react';
// Use relative asset paths to avoid CDN cache and force refresh via query

function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const TOKENS = {
  bgBody: '#0C1319',
  ringSoft: 'ring-slate-700/60',
  gradCTA: 'linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)',
  gradTextClass: 'bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600',
};

const ASSETS = {
  LOGO_WHITE: '/assets/logo/arka-logo-blanc.svg',
  LOGO_GRAD: '/assets/logo/arka-logo-blanc-radient.svg',
  HERO_VISUAL: '/assets/hero/arkabox-board.png?v=20250904',
  SCREENSHOT_CONSOLE: '/assets/hero/arkabox-board.png?v=20250904',
  SCHEMA_AGENTS: '/assets/hero/schema-agents.png',
};

export default function ArkaLanding() {
  return (
    <div className="min-h-screen text-white font-[Poppins]" style={{ backgroundColor: TOKENS.bgBody }}>
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <img src={ASSETS.LOGO_WHITE} alt="Arka logo" className="h-8 w-auto" />
        <nav className="hidden gap-4 text-sm text-slate-300 sm:flex">
          <a href="#features" className="hover:text-white" data-codex-id="link_Fonctionnalités
          <a href="/Bêta" className="hover:text-white" data-codex-id="link_Bêta</a>
          <a href="#pricing" className="hover:text-white" data-codex-id="link_tarification">Tarification</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="/login" className={`rounded-full px-4 py-2 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft}`}>Se connecter</a>
          <a href="/cockpit" className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg" style={{ background: TOKENS.gradCTA }} data-codex-id="cta_open_console">Ouvrir le cockpit</a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-6 lg:col-span-7">
          <img src={ASSETS.LOGO_GRAD} alt="Arka" className="h-auto w-[133px]" />
          <h1 className="mt-8 text-white">
            <span className="block leading-tight sm:text-[32px] md:text-[34px] lg:text-[36px]">la <span className="font-extrabold">puissance</span> des grandes équipes,</span>
            <span className={`${TOKENS.gradTextClass} bg-clip-text font-semibold leading-tight text-transparent block sm:text-[32px] md:text-[34px] lg:text-[34px]`}>mise entre les mains des petites</span>
          </h1>
          <p className="mt-6 max-w-xl text-slate-300">Cockpit multi‑agents, prompt builder et observabilité — pensé pour les équipes de 2 à 30 personnes.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/cockpit" className="rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg" style={{ background: TOKENS.gradCTA }}>
              Inscrivez‑vous à la bêta</a>
            <a href="/Fonctionnalités className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft}`}>
              Voir les features <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="relative md:col-span-6 lg:col-span-5 flex justify-center">
          <img src={ASSETS.HERO_VISUAL} alt="Arka visuel produit" className="w-[150%] max-w-none drop-shadow-2xl" />
        </div>
      </section>

      {/* Under-hero KPIs */}
      <div className="mx-auto mt-16 grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4 px-6">
        {[
          { icon: 'âš¡', k: 'Chat SSE', v: 'TTFT 680ms', d: 'Streaming fluide, agents disponibles instantanÃ©ment.' },
          { icon: 'ðŸ§©', k: 'Prompt Builder', v: '+30% rapiditÃ©', d: 'Composer, tester et rÃ©utiliser vos prompts facilement.' },
          { icon: 'ðŸ“Š', k: 'ObservabilitÃ©', v: '100% flux tracÃ©s', d: 'KPIs clairs : TTFT, RTT, erreurs, objectifs sprint.' },
          { icon: 'ðŸš€', k: 'VÃ©locitÃ©', v: '+30%', d: 'Des performances accrues pour vos Ã©quipes, sans lourdeur.' },
        ].map((i) => (
          <div
            key={i.k}
            className={`rounded-2xl p-5 text-center shadow-sm ring-1 ${TOKENS.ringSoft} flex flex-col justify-between`}
            style={{ backgroundColor: '#151F27', borderColor: '#1F2A33', minHeight: '200px' }}
          >
            <div>
              <div className="text-3xl mb-2">{i.icon}</div>
              <h3 className="text-base font-bold text-white">{i.k}</h3>
              <p className="text-xl font-extrabold text-white mt-1">{i.v}</p>
            </div>
            <p className="text-slate-400 text-sm mt-2">{i.d}</p>
          </div>
        ))}
      </div>

      {/* Console Section */}
      <section id="console" className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Un cockpit conÃ§ue pour vos agents</h2>
          <p className="text-slate-400 mb-6">
            Arka R1 rÃ©unit en une seule interface trois briques essentielles : <b>Prompt Builder</b>, <b>gestion documentaire</b> et <b>observabilitÃ© en temps rÃ©el</b>.
            Cette intÃ©gration unique fait dâ€™Arka Un cockpit multiâ€‘agents prÃªte Ã  lâ€™emploi. IdÃ©ale pour des petites Ã©quipes qui veulent livrer plus vite,
            avec plus de rigueur et un niveau de qualitÃ© supÃ©rieur.
          </p>
          <a href="/cockpit" className="rounded-xl px-5 py-2 text-sm font-semibold text-white" style={{ background: TOKENS.gradCTA }}>
            Inscrivez‑vous à la bêta</a>
        </div>
        <div className="bg-[#151F27] h-72 rounded-xl flex items-center justify-center border border-[#1F2A33]">
          <img src={ASSETS.SCREENSHOT_CONSOLE} alt="Screenshot animÃ© console" className="h-full oBêtain rounded-lg" />
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Arka, pensÃ©e pour les petites Ã©quipes</h2>
          <p className="text-slate-400 mb-6">
            Arka nâ€™a pas vocation Ã  remplacer des ERP lourds. Elle est volontairement <b>lÃ©gÃ¨re</b>, rapide Ã  mettre en place et orientÃ©e <b>valeur immÃ©diate</b>.
            Cible idÃ©ale : Ã©quipes de 2 Ã  30 personnes, qui veulent renforcer leurs capacitÃ©s sans recruter massivement.
          </p>
          <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
            <li>Optimisation des flux de production</li>
            <li>AmÃ©lioration des marges</li>
            <li>Hausse du niveau de qualitÃ©</li>
          </ul>
        </div>
        <div className="bg-[#151F27] h-72 rounded-xl flex items-center justify-center border border-[#1F2A33]">
          <img src={ASSETS.SCHEMA_AGENTS} alt="SchÃ©ma agent central reliÃ© Ã  documents, prompts et observabilitÃ©" className="h-full oBêtain rounded-lg" />
        </div>
      </section>

      {/* CTA finale */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Rejoignez les premiÃ¨res Ã©quipes qui utilisent Arka R1</h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Arka est dÃ©jÃ  adoptÃ©e par des PME, agences et startups ambitieuses qui veulent transformer leur delivery. Avec une architecture <b>multiâ€‘agents</b>
          encadrÃ©e et des outils intÃ©grÃ©s (<b>chat SSE</b>, <b>prompt builder</b>, <b>observabilitÃ©</b>), le cockpit met la puissance des grandes équipes, agences et PME.</div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-slate-500" style={{ borderColor: '#1F2A33' }}>
        Â© {new Date().getFullYear()} Arka â€” R1 â€” Localâ€‘first â€” ConfidentialitÃ© â€” SobriÃ©tÃ©
      </footer>
    </div>
  );
}




