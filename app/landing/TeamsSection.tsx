
"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";

const ASSETS = {
  SCHEMA: "https://arka-liard.vercel.app/assets/hero/schema-agents.png",
};

export default function TeamsSection() {
  return (
    <section id="teams" className="mx-auto mt-24 max-w-6xl px-6 text-slate-300">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <img
          src={ASSETS.SCHEMA}
          alt="Schéma illustrant la collaboration entre agents"
          className="w-full max-w-md rounded-xl shadow-lg"
          loading="lazy"
          decoding="async"
        />
        <div>
          <h2 className="text-2xl font-semibold text-white">Une console conçue pour vos équipes</h2>
          <p className="mt-4">
            Arka facilite la collaboration entre développeurs, product managers et profils métier. Le
            schéma central rend visible la place de chaque agent et les liens qui les relient. En
            quelques instants, tout le monde comprend le rôle des composants et peut proposer des
            améliorations sans passer des heures dans la documentation.
          </p>
          <p className="mt-4">
            Les permissions granulaires permettent de distribuer les responsabilités tout en gardant
            le contrôle. Les membres de l&apos;équipe voient uniquement ce qui les concerne et les
            changements sont tracés pour garantir une traçabilité parfaite. Cette approche réduit les
            frictions et encourage des cycles d&apos;itération courts.
          </p>
        </div>
      </div>
    </section>
  );
}
