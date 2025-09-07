/* eslint-disable @next/next/no-img-element */
export default function SectionAgents() {
  const agents = [
    { name: 'RH', desc: 'Recrutement, onboarding, formations.' },
    { name: 'Éducation', desc: 'Parcours, évaluations, ateliers.' },
    { name: 'Qualité', desc: 'Processus, audits, conformité.' },
    { name: 'Organisation', desc: 'Roadmaps, risques, arbitrages.' },
  ];
  return (
    <section aria-labelledby="agents" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <header className="text-center max-w-3xl mx-auto">
          <h2 id="agents" className="text-3xl md:text-4xl font-semibold" style={{ color: '#0F172A' }}>Nos agents experts</h2>
          <p className="mt-2" style={{ color: '#334155' }}>Une squad spécialisée qui travaille ensemble</p>
        </header>
        <div className="mt-8 overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <div className="min-w-[720px] grid grid-cols-4 gap-6">
            {agents.map((a, i) => (
              <article key={a.name} className="rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white mb-3" style={{ backgroundImage: 'var(--brand-grad)' }}>{a.name[0]}</div>
                <h3 className="text-base font-semibold" style={{ color: '#0F172A' }}>{a.name}</h3>
                <p className="mt-1 text-sm" style={{ color: '#334155' }}>{a.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

