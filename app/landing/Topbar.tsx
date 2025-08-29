
"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import { TOKENS } from "./tokens";
import { uiLog } from "./uiLog";

const ASSETS = {
  LOGO_WHITE: "https://arka-liard.vercel.app/assets/logo/arka-logo-blanc.svg",
};

export default function Topbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <header
      className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
      role="banner"
      aria-label="En-tête de la page"
    >
      <img
        src={ASSETS.LOGO_WHITE}
        alt="Arka logo"
        className="h-8 w-auto"
        loading="eager"
        decoding="async"
      />

      {/* Nav desktop */}
      <nav className="hidden items-center gap-6 md:flex" role="navigation" aria-label="Navigation principale">
        <a
          className="text-sm text-slate-300 hover:text-white"
          href="#features"
          onClick={() => uiLog("nav_click", { target: "#features" })}
        >
          Fonctionnalités
        </a>
        <a
          className="text-sm text-slate-300 hover:text-white"
          href="#security"
          onClick={() => uiLog("nav_click", { target: "#security" })}
        >
          Sécurité
        </a>
        <a
          className="text-sm text-slate-300 hover:text-white"
          href="#pricing"
          onClick={() => uiLog("nav_click", { target: "#pricing" })}
        >
          Tarification
        </a>

        <button
          className={`rounded-full px-4 py-2 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft} hover:ring-slate-500`}
          aria-label="Se connecter"
          onClick={() => uiLog("cta_click", { id: "signin" })}
        >
          Se connecter
        </button>

        <button
          className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ background: TOKENS.gradCTA }}
          aria-label="Ouvrir la console"
          onClick={() => uiLog("cta_click", { id: "open_console" })}
        >
          Ouvrir la console
        </button>
      </nav>

      {/* Burger mobile */}
      <div className="md:hidden">
        <button
          className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ background: TOKENS.gradCTA }}
          aria-label="Ouvrir le menu"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => !v);
            uiLog("burger_toggle", { open: !open });
          }}
        >
          Menu
        </button>
      </div>
      {open && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-16 z-50 mx-4 rounded-xl border bg-[#151F27] p-4 text-slate-200"
          role="dialog"
          aria-label="Menu mobile"
        >
          <div className="grid gap-3">
            <a href="#features" onClick={() => uiLog("nav_click", { target: "#features", via: "mobile" })}>
              Fonctionnalités
            </a>
            <a href="#security" onClick={() => uiLog("nav_click", { target: "#security", via: "mobile" })}>
              Sécurité
            </a>
            <a href="#pricing" onClick={() => uiLog("nav_click", { target: "#pricing", via: "mobile" })}>
              Tarification
            </a>
            <button
              className={`mt-2 rounded-full px-4 py-2 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft} hover:ring-slate-500`}
              onClick={() => uiLog("cta_click", { id: "signin", via: "mobile" })}
            >
              Se connecter
            </button>
            <button
              className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
              style={{ background: TOKENS.gradCTA }}
              onClick={() => uiLog("cta_click", { id: "open_console", via: "mobile" })}
            >
              Ouvrir la console
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
