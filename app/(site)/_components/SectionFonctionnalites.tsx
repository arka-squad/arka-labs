/* eslint-disable @next/next/no-img-element */
import { Users, ListChecks, Database, FileCheck2, CheckCircle2, Link2, Share2 } from 'lucide-react';
import React from 'react';

export default function SectionFonctionnalites() {
  const title = 'Tout piloter depuis un seul endroit';
  const p1 = "Le cockpit Arka réunit : le chat orchestrateur multi‑agents, des recettes métiers prêtes à l’emploi, la visibilité en direct des résultats, et une mémoire souveraine (ArkaMeta).";
  const p2 = "Vous donnez la direction, les agents experts se relaient pour exécuter. Les indicateurs se mettent à jour en direct. À la fin, une preuve formelle est générée : claire, lisible, exportable.";

  const items: { key: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[] = [
    { key: 'chat', icon: Users, title: 'Chat multi‑agents experts', desc: 'RH, Qualité, Organisation répondent et déclenchent des actions concrètes.' },
    { key: 'recipes', icon: ListChecks, title: 'Recettes métiers', desc: 'Onboarding, Formation, Conformité, Process internes — prêtes à l’emploi.' },
    { key: 'arkameta', icon: Database, title: 'ArkaMeta — mémoire souveraine', desc: 'Historique, décisions, livrables — hébergés chez vous, contrôlés par vous.' },
    { key: 'evidence', icon: FileCheck2, title: 'Preuves exportables', desc: 'Dossiers clairs pour audits, clients, subventions — en un clic.' },
  ];

  const chips: { label: string; icon: React.ComponentType<{ className?: string }>}[] = [
    { label: 'Assigner', icon: CheckCircle2 },
    { label: 'Vérifier', icon: CheckCircle2 },
    { label: 'Lier un doc', icon: Link2 },
    { label: 'Exporter la preuve', icon: Share2 },
  ];

  const src = '/assets/landing/cockpit-overview.png'; // PNG sans fond (à fournir)
  const srcset = `/assets/landing/cockpit-overview.png?w=480 480w, /assets/landing/cockpit-overview.png?w=768 768w, /assets/landing/cockpit-overview.png?w=1200 1200w, /assets/landing/cockpit-overview.png?w=1600 1600w`;

  return (
    <section id="features" aria-labelledby="features-title" className="py-16 md:py-12 sm:py-10">
      <div className="mx-auto max-w-[1440px] px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Image gauche */}
        <div className="lg:col-span-5">
          <img
            src={src}
            srcSet={srcset}
            sizes="(max-width: 1024px) 90vw, 520px"
            alt="Aperçu du cockpit Arka : chat, recettes, observabilité, preuves"
            className="w-full h-auto object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
        {/* Texte droite */}
        <div className="lg:col-span-7">
          <h2 id="features-title" className="text-3xl md:text-4xl font-semibold" style={{ color: 'var(--site-text)' }}>
            {title}
          </h2>
          <p className="mt-3 max-w-2xl" style={{ color: 'var(--site-muted)' }}>{p1}</p>
          <p className="mt-2 max-w-2xl" style={{ color: 'var(--site-muted)' }}>{p2}</p>

          <div className="mt-8 grid gap-6">
            {items.map((it) => (
              <div key={it.key} className="flex items-start gap-3">
                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full aspect-square"
                  aria-hidden
                  style={{ backgroundImage: 'var(--brand-grad)', color: 'white' }}
                >
                  <it.icon className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-medium" style={{ color: 'var(--site-text)' }}>{it.title}</div>
                  <p style={{ color: 'var(--site-muted)' }}>{it.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-slate-800 cursor-default"
              >
                <span aria-hidden className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full aspect-square" style={{ backgroundImage: 'var(--brand-grad)', color: 'white' }}>
                  <c.icon className="w-3.5 h-3.5" />
                </span>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

