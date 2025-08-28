/* eslint-disable @next/next/no-img-element */
import React from "react";
// minimal ArrowRight icon (Lucide path) to avoid external dependency
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
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

// === TOKENS (UI) ===
const TOKENS = {
  bgBody: "#0C1319", // fond global
  ringSoft: "ring-slate-700/60", // bordures des blocs (identique au bouton "Voir les features")
  gradCTA: "linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)",
  gradTextClass: "bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600",
};

// === ASSETS (liens absolus, car dépôt privé) ===
const ASSETS = {
  LOGO_WHITE: "https://arka-liard.vercel.app/assets/logo/arka-logo-blanc.svg",
  LOGO_GRAD: "https://arka-liard.vercel.app/assets/logo/arka-logo-blanc-radient.svg",
  HERO_VISUAL: "https://arka-liard.vercel.app/assets/hero/arkabox-board.png",
};

// ---------------- Topbar ----------------
export function Topbar() {
  return (
    <header className="flex items-center justify-between py-4">
      <img
        src={ASSETS.LOGO_WHITE}
        alt="Arka logo"
        className="h-8 w-auto"
        loading="eager"
        decoding="async"
      />

      <nav className="hidden items-center gap-6 md:flex">
        <a className="text-sm text-slate-300 hover:text-white" href="#features">Fonctionnalités</a>
        <a className="text-sm text-slate-300 hover:text-white" href="#security">Sécurité</a>
        <a className="text-sm text-slate-300 hover:text-white" href="#pricing">Tarification</a>

        <button
          className={`rounded-full px-4 py-2 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft} hover:ring-slate-500`}
        >
          Se connecter
        </button>

        <button
          className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ background: TOKENS.gradCTA }}
        >
          Ouvrir la console
        </button>
      </nav>
    </header>
  );
}

// ---------------- Hero ----------------
export default function HeroLanding() {
  return (
    <main style={{ background: TOKENS.bgBody }} className="min-h-screen w-full">
      <section className="mx-auto max-w-7xl px-6">
        <Topbar />

        {/* HERO GRID */}
        <div className="mt-10 grid items-center gap-12 md:grid-cols-12">
          {/* Colonne gauche — Logo + Titre + Accroche + CTA */}
          <div className="md:col-span-6 lg:col-span-7">
            <img
              src={ASSETS.LOGO_GRAD}
              alt="Arka"
              className="h-auto w-[300px]"
              loading="eager"
              decoding="async"
            />

            <h1 className="mt-8 text-white">
              {/* ligne 1 : “la puissance … équipes,” → “puissance” en extra-bold */}
              <span className="block leading-tight sm:text-[32px] md:text-[34px] lg:text-[36px]">
                la <span className="font-extrabold">puissance</span> des grandes équipes,
              </span>
              {/* ligne 2 : “entre les mains des petites” → gradient texte + taille un cran en dessous de la maquette finale */}
              <span
                className={`block ${TOKENS.gradTextClass} bg-clip-text font-semibold leading-tight text-transparent sm:text-[32px] md:text-[34px] lg:text-[34px]`}
              >
                entre les mains des petites
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-slate-300">
              Console multi-agents, prompt builder et observabilité — pensée pour les équipes de 2 à 30 personnes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg"
                style={{ background: TOKENS.gradCTA }}
              >
                Essayer la démo
              </button>

              <button
                className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft} hover:ring-slate-500`}
              >
                Voir les features <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Colonne droite — visuel produit (Arka.box + board) */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[980px]">
              <img
                src={ASSETS.HERO_VISUAL}
                alt="Arka.box et Arka.board"
                className="mx-auto w-full drop-shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
                style={{ filter: "saturate(105%) contrast(102%)" }}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* Under-hero — 4 KPI (bordure = ring-slate-700/60, chiffres en gradient sur l’ensemble) */}
        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { k: "TTFT", v: "680ms" },
            { k: "RTT", v: "1380ms" },
            { k: "% erreurs", v: "0%" },
            { k: "Vélocité", v: "+30%" },
          ].map((i) => (
            <div
              key={i.k}
              className={`group relative overflow-hidden rounded-xl bg-slate-900/30 px-5 py-6 text-center shadow-sm ring-1 ${TOKENS.ringSoft} hover:ring-slate-500`}
            >
              <div className="text-xs uppercase tracking-wide text-slate-400">{i.k}</div>
              <div className={`mt-2 text-xl font-extrabold bg-clip-text text-transparent ${TOKENS.gradTextClass}`}>
                {i.v}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

