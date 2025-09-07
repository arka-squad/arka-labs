export default function SectionExemples() {
  const items = [
    { t: 'Préparer un onboarding', d: 'Checklist RH + planning + preuves de lecture.' },
    { t: 'Former une équipe', d: 'Scénarios guidés + quiz + feedbacks structurés.' },
    { t: 'Auditer un processus', d: 'Contrôles, écarts, actions correctives.' },
  ];
  return (
    <section aria-labelledby="exemples" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <header className="text-center max-w-3xl mx-auto">
          <h2 id="exemples" className="text-3xl md:text-4xl font-semibold" style={{ color: '#0F172A' }}>Exemples</h2>
          <p className="mt-2" style={{ color: '#334155' }}>Trois cas concrets pour démarrer</p>
        </header>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((c, i) => (
            <article key={i} className={`relative overflow-hidden rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6 ${['cardGlowA','cardGlowB','cardGlowC'][i%3]}`}>
              <h3 className="text-base font-semibold" style={{ color: '#0F172A' }}>{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#334155' }}>{c.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

