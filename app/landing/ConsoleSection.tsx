
"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useRouter } from "next/navigation";
import { TOKENS } from "./tokens";

const ASSETS = {
  CONSOLE: "https://arka-liard.vercel.app/assets/hero/console-demo.gif",
};

export default function ConsoleSection() {
  const router = useRouter();
  return (
    <section id="console" className="mx-auto mt-24 max-w-6xl px-6 text-slate-300">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-white">Une console conçue pour vos agents</h2>
          <p className="mt-4">
            La console Arka centralise la configuration de vos modèles, prompts et clés d&apos;API.
            Chaque modification est historisée afin de comprendre l&apos;impact d&apos;un changement et de
            restaurer un état précédent en un clic. L&apos;éditeur intégré simplifie la rédaction des
            prompts et propose des suggestions contextualisées pour accélérer la mise au point de vos
            scénarios.
          </p>
          <p className="mt-4">
            Les tableaux de bord animés offrent une vision claire des performances en temps réel.
            Vous identifiez immédiatement les latences, les erreurs et les zones à optimiser. Grâce
            aux exports CSV et à l&apos;API publique, les données peuvent être réinjectées dans vos outils
            décisionnels sans effort. Toutes ces fonctionnalités sont réunies dans une interface
            réactive, accessible au clavier et optimisée pour les écrans retina.
          </p>
          <button
            className={`mt-6 rounded-full px-5 py-3 text-sm text-slate-200 ring-1 ${TOKENS.ringSoft} hover:ring-slate-500`}
            onClick={() => router.push("/projects")}
          >
            Voir la console
          </button>
        </div>
        <img
          src={ASSETS.CONSOLE}
          alt="Démonstration de la console Arka"
          className="w-full rounded-xl shadow-lg"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
