"use client";
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { TOKENS } from "./tokens";
import { uiLog } from "./uiLog";
import { assetUrl } from "../../lib/urls";

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

// === ASSETS (liens absolus, car dépôt privé) ===
const ASSETS = {
  LOGO_GRAD: assetUrl('/assets/logo/arka-logo-blanc-radient.svg'),
  HERO_VISUAL: assetUrl('/assets/hero/arkabox-board.png'),
};

// ---------------- Hero ----------------
export default function HeroLanding() {
  React.useEffect(() => {
    uiLog("mount", { section: "landing_hero" });
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10" id="hero" aria-label="Section héro">
      <div className="grid items-center gap-12 md:grid-cols-12">
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
              la <span className="font-extrabold">puissance</span> des grandes équipes,{" "}
            </span>
            {/* ligne 2 : “entre les mains des petites” → gradient texte + taille un cran en dessous de la maquette finale */}
            <span
              className={`block ${TOKENS.gradTextClass} bg-clip-text font-semibold leading-tight text-transparent sm:text-[32px] md:text-[34px] lg:text-[34px]`}
              aria-label="Tagline produit"
            >
              entre les mains des petites
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-slate-300">
            Console multi-agents, prompt builder et observabilité — pensée pour les équipes de 2 à 30 personnes.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/console"
              className="rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              style={{ background: TOKENS.gradCTA }}
              aria-label="Essayer la bêta"
              onClick={() => uiLog("cta_click", { id: "try_beta" })}
            >
              Essayer la bêta
            </a>

            <a
              href="/fonctionnalites"
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft} hover:ring-slate-500 focus-visible:outline-none focus-visible:ring-2`}
              aria-label="Voir les fonctionnalités"
              onClick={() => uiLog("cta_click", { id: "see_features" })}
            >
              Voir les features <ArrowRight className="h-4 w-4" />
            </a>
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
    </section>
  );
}
