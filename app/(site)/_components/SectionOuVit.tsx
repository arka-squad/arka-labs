export default function SectionOuVit() {
  const items = [
    { t: 'Cockpit', d: 'Chat, recettes, observabilité' },
    { t: 'Docs', d: 'Prompts, contrats, versions' },
    { t: 'Evidence', d: 'Paquets texte + empreintes' },
  ];
  return (
    <section aria-labelledby="project-home" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <header className="text-center max-w-3xl mx-auto">
          <h2 id="project-home" className="text-3xl md:text-4xl font-semibold" style={{ color: '#0F172A' }}>Où vit le projet</h2>
          <p className="mt-2" style={{ color: '#334155' }}>Un rail pour retrouver vos éléments clés</p>
        </header>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((c, i) => (
            <article key={i} className="rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6">
              <h3 className="text-base font-semibold" style={{ color: '#0F172A' }}>{c.t}</h3>
              <p className="mt-2 text-sm" style={{ color: '#334155' }}>{c.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

