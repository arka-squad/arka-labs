"use client";
import React from "react";
import { TOKENS } from "./tokens";

export default function CTASection() {
  return (
    <section id="cta" className="mx-auto mt-24 max-w-4xl px-6 text-center text-slate-300">
      <p className="text-sm uppercase tracking-wide text-slate-400">15+ équipes déjà utilisatrices</p>
      <h2 className="mt-4 text-2xl font-semibold text-white">Inscrivez-vous à la démo</h2>
      <button
        className="mt-6 rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg"
        style={{ background: TOKENS.gradCTA }}
      >
        Inscrivez-vous à la démo
      </button>
    </section>
  );
}
