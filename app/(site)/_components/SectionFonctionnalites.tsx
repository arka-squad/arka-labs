/* eslint-disable @next/next/no-img-element */
export default function SectionFonctionnalites() {
  const title = 'Tout piloter depuis un seul endroit';
  const p1 = "Le cockpit Arka réunit : le chat orchestrateur multi‑agents, des recettes métiers prêtes à l’emploi, la visibilité en direct des résultats, et une mémoire souveraine (ArkaMeta).";
  const p2 = "Vous donnez la direction, les agents experts se relaient pour exécuter. Les indicateurs se mettent à jour en direct. À la fin, une preuve formelle est générée : claire, lisible, exportable.";

  const items = [
    { title: 'Chat multi‑agents experts', desc: 'RH, Qualité, Organisation répondent et déclenchent des actions concrètes.' },
    { title: 'Recettes métiers', desc: 'Onboarding, Formation, Conformité, Process internes — prêtes à l’emploi.' },
    { title: 'ArkaMeta — mémoire souveraine', desc: 'Historique, décisions, livrables — hébergés chez vous, contrôlés par vous.' },
    { title: 'Preuves exportables', desc: 'Dossiers clairs pour audits, clients, subventions — en un clic.' },
  ];
  const chips = ['Assigner', 'Vérifier', 'Lier un doc', 'Exporter la preuve'];
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
              <div key={it.title} className="flex items-start gap-3">
                <span
                  className="inline-flex h-8 w-8 rounded-full items-center justify-center text-white"
                  aria-hidden
                  style={{ backgroundImage: 'var(--brand-grad)' }}
                >
                  •
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
                key={c}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-slate-800 cursor-default"
              >
                <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundImage: 'var(--brand-grad)', color: 'white' }}>✓</span>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

