/* eslint-disable @next/next/no-img-element */
'use client';

export default function Hero() {
  return (
    <section id="hero" aria-label="Section de tête" className="py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 grid grid-cols-12 gap-x-6">
        {/* Left: text */}
        <div className="col-span-12 md:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-[12px] border px-3 py-1.5 text-xs text-white" style={{ background: 'rgba(255,255,255,.10)', borderColor: 'rgba(255,255,255,.18)', backgroundColor: '#0b1015' }}>
            <span>Cockpit v0.1.0-demo</span>
            <span aria-hidden>•</span>
            <span>Données de démo</span>
          </div>
          <h1 className="mt-4 leading-tight" style={{ color: '#FFFFFF' }}>
            <span className="block text-[28px] sm:text-[32px] md:text-[34px] lg:text-[36px] font-semibold">Pilotez une équipe d’ <span className="accent">agents IA experts</span> — pas un assistant isolé.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm md:text-base" style={{ color: '#D1D5DB' }}>
            Avec Arka, vous ne dialoguez pas avec une machine. Vous dirigez une squad spécialisée : RH, Formation, Qualité, Organisation.
            Chaque agent IA est un expert dans son domaine, et tous travaillent ensemble, en ping-pong, pour livrer mieux.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/cockpit?demo=1" className="rounded-[12px] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_20px_rgba(226,2,109,.22)] hover:-translate-y-px transition will-change-transform" style={{ backgroundImage: 'linear-gradient(12deg,#FAB652,#F25636 50%,#E0026D)' }} aria-label="Entrer dans le cockpit (démo)">
              Entrer dans le cockpit
            </a>
            <a href="#features" className="rounded-[12px] px-5 py-3 text-sm text-white/90 ring-1 ring-white/20 hover:bg-white/10" aria-label="Voir la démo 90s">
              Voir la démo 90s
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" aria-label="Atouts">
            {['Experts, pas généralistes', 'Collaboration multi-rôles', 'Mémoire souveraine'].map((c) => (
              <span key={c} className="inline-flex items-center rounded-full border px-3 py-1 text-xs" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,.18)', background: 'rgba(255,255,255,.10)' }}>{c}</span>
            ))}
          </div>
        </div>

        {/* Right: image */}
        <div className="col-span-12 md:col-span-5 mt-8 md:mt-0 flex justify-center">
          <img
            src="/assets/hero/arkabox-board.png"
            alt="Aperçu du cockpit Arka — board et actions visibles"
            decoding="async"
            fetchPriority="high"
            className="max-h-[360px] md:max-h-[460px] lg:max-h-[520px] w-auto object-contain"
          />
        </div>
      </div>

      {/* Dark local background spanning container width */}
      <style jsx>{`
        #hero { background: #0b1015; }
        .accent {
          background-image: linear-gradient(12deg, #FAB652, #F25636 50%, #E0026D);
          -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: 900;
        }
      `}</style>
    </section>
  );
}
