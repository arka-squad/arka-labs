export default function BetaSignup() {
  return (
    <section id="beta" aria-labelledby="beta-title" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="rounded-[20px] card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 id="beta-title" className="text-2xl md:text-3xl font-semibold" style={{ color: 'var(--site-text)' }}>Inscription à la Bêta</h2>
            <p className="mt-2 text-[var(--site-muted)]">Rejoignez la liste d’attente. Nous vous prévenons dès l’ouverture.</p>
          </div>
          <a href="/beta" className="inline-flex items-center gap-2 rounded-[12px] px-5 py-3 text-white" style={{ backgroundImage: 'var(--brand-grad)' }}>
            S’inscrire à la Bêta
          </a>
        </div>
      </div>
    </section>
  );
}

