/* eslint-disable @next/next/no-img-element */
'use client';

import type { SVGProps } from 'react';

function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
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
          <a href="#features" className="hover:text-white" data-codex-id="link_fonctionnalites">Fonctionnalit&eacute;s</a>
          <a href="/beta" className="hover:text-white" data-codex-id="link_beta">B&ecirc;ta</a>
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
            <span className="block leading-tight sm:text-[32px] md:text-[34px] lg:text-[36px]">la <span className="font-extrabold">puissance</span> des grandes &eacute;quipes,</span>
            <span className={`${TOKENS.gradTextClass} bg-clip-text font-semibold leading-tight text-transparent block sm:text-[32px] md:text-[34px] lg:text-[34px]`}>mise entre les mains des petites</span>
          </h1>
          <p className="mt-6 max-w-xl text-slate-300">Cockpit multi-agents, prompt builder et observabilit&eacute; &mdash; pens&eacute; pour les &eacute;quipes de 2 &agrave; 30 personnes.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/cockpit" className="rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg" style={{ background: TOKENS.gradCTA }}>
              Inscrivez-vous &agrave; la b&ecirc;ta
            </a>
            <a href="/fonctionnalites" className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft}`}>
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
          { icon: '⚡', k: 'Chat SSE', v: 'TTFT 680ms', d: 'Streaming fluide, agents disponibles instantan&eacute;ment.' },
          { icon: '🧩', k: 'Prompt Builder', v: '+30% rapidit&eacute;', d: 'Composer, tester et r&eacute;utiliser vos prompts facilement.' },
          { icon: '📊', k: 'Observabilit&eacute;', v: '100% flux trac&eacute;s', d: 'KPIs clairs : TTFT, RTT, erreurs, objectifs sprint.' },
          { icon: '🚀', k: 'V&eacute;locit&eacute;', v: '+30%', d: 'Des performances accrues pour vos &eacute;quipes, sans lourdeur.' },
        ].map((i) => (
          <div key={i.k} className={`rounded-2xl p-5 text-center shadow-sm ring-1 ${TOKENS.ringSoft} flex flex-col justify-between`} style={{ backgroundColor: '#151F27', borderColor: '#1F2A33', minHeight: '200px' }}>
            <div>
              <div className="text-3xl mb-2">{i.icon}</div>
              <h3 className="text-base font-bold text-white">{i.k}</h3>
              <p className="text-xl font-extrabold text-white mt-1">{i.v}</p>
            </div>
            <p className="text-slate-400 text-sm mt-2">{i.d}</p>
          </div>
        ))}
      </div>

      {/* Cockpit Section */}
      <section id="console" className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Un cockpit con&ccedil;u pour vos agents</h2>
          <p className="text-slate-400 mb-6">
            Arka R1 r&eacute;unit en une seule interface trois briques essentielles : <b>Prompt Builder</b>, <b>gestion documentaire</b> et <b>observabilit&eacute; en temps r&eacute;el</b>.
            Cette int&eacute;gration unique fait d&rsquo;Arka un cockpit multi-agents pr&ecirc;t &agrave; l&rsquo;emploi. Id&eacute;ale pour des petites &eacute;quipes qui veulent livrer plus vite,
            avec plus de rigueur et un niveau de qualit&eacute; sup&eacute;rieur.
          </p>
          <a href="/cockpit" className="rounded-xl px-5 py-2 text-sm font-semibold text-white" style={{ background: TOKENS.gradCTA }}>
            Inscrivez-vous &agrave; la b&ecirc;ta
          </a>
        </div>
        <div className="bg-[#151F27] h-72 rounded-xl flex items-center justify-center border border-[#1F2A33]">
          <img src={ASSETS.SCREENSHOT_CONSOLE} alt="Screenshot anim&eacute; du cockpit" className="h-full object-contain rounded-lg" />
        </div>
      </section>
    </div>
  );
}
