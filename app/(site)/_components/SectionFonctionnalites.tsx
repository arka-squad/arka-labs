/* eslint-disable @next/next/no-img-element */
export default function SectionFonctionnalites() {
  const feats = [
    'Chat SSE avec agents spécialisés',
    'Recettes versionnées et testables',
    'DocGraph et contrats (RO)',
    'Observabilité intégrée (trace id)',
  ];
  return (
    <section aria-labelledby="features" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5">
          <img src="/assets/hero/arkabox.png" alt="Aperçu fonctionnalités Arka" className="w-full h-auto object-contain" loading="lazy" decoding="async" />
        </div>
        <div className="md:col-span-7">
          <h2 id="features-title" className="text-3xl md:text-4xl font-semibold" style={{ color: 'var(--site-text)' }}>Fonctionnalités</h2>
          <p className="mt-2" style={{ color: 'var(--site-muted)' }}>Ce qui rend le cockpit utile au quotidien</p>
          <ul className="mt-6 space-y-2 text-sm" style={{ color: 'var(--site-text)' }}>
            {feats.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundImage: 'var(--brand-grad)' }} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

