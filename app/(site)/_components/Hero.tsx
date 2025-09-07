/* eslint-disable @next/next/no-img-element */
'use client';

import type { ReactNode } from 'react';

export type HeroProps = {
  badge?: string;
  title?: ReactNode;
  subtitle?: string;
  chips?: string[];
  ctas?: { label: string; href: string; variant: 'primary' | 'secondary' }[];
  image?: { src: string; alt: string; srcset?: string; sizes?: string };
};

const DEFAULT_BADGE = 'Cockpit v0.1.0-demo · Données de démo';
const DEFAULT_TITLE = (
  <>
    Pilotez une équipe d’ <span className="accent">agents IA experts</span> — pas un assistant isolé.
  </>
);
const DEFAULT_SUBTITLE =
  'Avec Arka, vous ne dialoguez pas avec une machine. Vous dirigez une squad spécialisée : RH, Formation, Qualité, Organisation. Chaque agent IA est un expert dans son domaine, et tous travaillent ensemble, en ping-pong, pour livrer mieux.';
const DEFAULT_CHIPS = ['Experts, pas généralistes', 'Collaboration multi-rôles', 'Mémoire souveraine'];
const DEFAULT_CTAS = [
  { label: 'Entrer dans le cockpit', href: '/cockpit?demo=1', variant: 'primary' as const },
  { label: 'Voir la démo 90s', href: '#demo', variant: 'secondary' as const },
];
const DEFAULT_IMAGE = {
  src: '/assets/hero/arkabox-board.png',
  alt: 'Aperçu du cockpit Arka – board et actions visibles',
  srcset:
    '/assets/hero/arkabox-board.png?w=480 480w, /assets/hero/arkabox-board.png?w=768 768w, /assets/hero/arkabox-board.png?w=1200 1200w, /assets/hero/arkabox-board.png?w=1600 1600w',
  sizes: '(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 560px',
};

export default function Hero({
  badge = DEFAULT_BADGE,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  chips = DEFAULT_CHIPS,
  ctas = DEFAULT_CTAS,
  image = DEFAULT_IMAGE,
}: HeroProps) {
  return (
    <section id="hero" aria-label="Section de tête" className="py-16 md:py-20 lg:py-24 text-white">
      <div className="mx-auto max-w-[1440px] px-6 grid grid-cols-12 gap-x-6">
        {/* Left: text */}
        <div className="col-span-12 md:col-span-7 space-y-6">
          <div
            className="inline-flex items-center gap-2 rounded-[12px] border px-3 py-1.5 text-xs"
            style={{ backgroundColor: 'rgba(255,255,255,.10)', borderColor: 'rgba(255,255,255,.18)' }}
          >
            <span>{badge}</span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] md:text-[34px] lg:text-[36px] font-semibold leading-tight">{title}</h1>
          <p className="max-w-2xl text-sm md:text-base" style={{ color: '#D1D5DB' }}>
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {ctas.map((c) =>
              c.variant === 'primary' ? (
                <a
                  key={c.label}
                  href={c.href}
                  className="rounded-[12px] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_20px_rgba(226,2,109,.22)] hover:-translate-y-px transition will-change-transform"
                  style={{ backgroundImage: 'linear-gradient(135deg,#FAB652 0%,#F25636 50%,#E0026D 100%)' }}
                  aria-label="Entrer dans le cockpit (démo)"
                >
                  {c.label}
                </a>
              ) : (
                <a
                  key={c.label}
                  href={c.href}
                  className="rounded-[12px] px-5 py-3 text-sm text-white/90 hover:bg-white/10 border"
                  style={{ borderColor: 'rgba(255,255,255,.14)' }}
                  aria-label="Voir la démo 90s"
                >
                  {c.label}
                </a>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Atouts">
            {chips.map((c) => (
              <span
                key={c}
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs"
                style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,.18)', backgroundColor: 'rgba(255,255,255,.10)' }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Right: image */}
        <div className="col-span-12 md:col-span-5 mt-8 md:mt-0 flex justify-center">
          <img
            src={process.env.NEXT_PUBLIC_HERO_IMG || image.src}
            srcSet={image.srcset}
            sizes={image.sizes}
            alt={image.alt}
            decoding="async"
            fetchPriority="high"
            className="w-full md:w-auto aspect-[16/10] md:aspect-auto max-h-[360px] md:max-h-[460px] lg:max-h-[520px] object-contain"
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
