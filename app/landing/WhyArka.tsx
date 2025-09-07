"use client";

import React from "react";

export default function WhyArka() {
  return (
    <section id="features" className="mx-auto mt-24 max-w-3xl px-6 text-slate-300">
      <h2 className="text-2xl font-semibold text-white">Pourquoi choisir Arka ?</h2>
      <p className="mt-4">
        Arka rassemble en une seule interface les briques essentielles pour prototyper, tester et
        déployer des agents intelligents. Nos workflows réduisent la charge cognitive et permettent
        aux petites équipes d'itérer aussi vite que les grands groupes. Chaque module est pensé
        pour être pris en main en quelques minutes et documenté de manière exhaustive.
      </p>
      <p className="mt-4">
        La plateforme s'appuie sur un moteur en temps réel qui surveille l'état de vos agents,
        trace les requêtes et met en évidence les goulots d'étranglement. Les métriques clés sont
        disponibles en permanence afin d'alimenter vos décisions produit et de garantir des
        déploiements sûrs. Les contrôles d'accès et journaux d'activité répondent aux exigences
        de conformité les plus strictes.
      </p>
      <p className="mt-4">
        Concrètement, Arka se distingue par une gouvernance codifiée, une mémoire auditable et un
        outillage d'observabilité intégré. Vous disposez d'un <strong>Prompt Builder</strong> versionné,
        d'un <strong>Chat</strong> retraçant les échanges avec vos agents, d'un module <strong>Documents</strong> pour
        centraliser vos ressources, et d'un tableau de bord qui visualise la <em>TTFT</em>, la latence et le
        taux d'erreur. Le tout fonctionne avec des <strong>rôles</strong> clairs (viewer, operator, owner) afin de
        sécuriser les opérations sensibles et d'éviter les erreurs humaines.
      </p>
      <p className="mt-4">
        Nos bonnes pratiques de performance et d'accessibilité sont appliquées par défaut :
        budgets web mesurables (LCP, TTI, CLS), contrastes conformes WCAG 2.1 AA, navigation
        entièrement au clavier et composants testés visuellement. Cette discipline réduit les
        régressions et alimente votre SEO grâce à des temps de chargement maîtrisés et un contenu
        structuré (un H1 unique, des H2 pour chaque section, métadonnées complètes).
      </p>
      <p className="mt-4">
        Enfin, Arka épouse votre environnement : intégrations API standardisées, export des données
        en CSV, et une feuille de route publique permettant d'anticiper les évolutions fonctionnelles.
        Vous avancez vite, sans lock-in, en capitalisant sur une organisation numérique prête à
        l'emploi et orchestrée par une IA au service de vos objectifs.
      </p>
    </section>
  );
}

