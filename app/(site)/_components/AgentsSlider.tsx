"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type AgentCardData = {
  id: string;
  title: string;
  role: string;
  image: string;
  summary: string;
  skills: string[];
  cta?: { label: string; href: string };
};

export default function AgentsSlider({
  items = [] as AgentCardData[],
  initialIndex = 0,
}: { items?: AgentCardData[]; initialIndex?: number }) {
  const railRef = useRef<HTMLDivElement>(null);

  // Use HTMLElement because <article> is HTMLArticleElement, not HTMLDivElement
  const cardRefs = useRef<HTMLElement[]>([]);

  const [active, setActive] = useState(initialIndex);

  const snapTo = useCallback((index: number, smooth = true) => {
    const rail = railRef.current; if (!rail) return;
    const card = cardRefs.current[index]; if (!card) return;
    const pl = parseFloat(getComputedStyle(rail).paddingLeft || '0');
    const target = card.offsetLeft - pl;
    const max = rail.scrollWidth - rail.clientWidth;
    rail.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    const rail = railRef.current; if (!rail) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const pl = parseFloat(getComputedStyle(rail).paddingLeft || '0');
        const leftEdge = rail.scrollLeft + pl;
        let best = 0, bestDist = Infinity;
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const dist = Math.abs(el.offsetLeft - leftEdge);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        setActive(best);
      });
    };
    rail.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); rail.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); snapTo(Math.max(0, active - 1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); snapTo(Math.min(items.length - 1, active + 1)); }
      if (e.key === 'Home') { e.preventDefault(); snapTo(0, false); }
      if (e.key === 'End') { e.preventDefault(); snapTo(items.length - 1, false); }
      if (e.key === 'Escape') { e.preventDefault(); snapTo(0); }
    };
    window.addEventListener('keydown', onKey);
    const onResize = () => snapTo(active, false);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [active, items.length, snapTo]);

  // Align to initial index on mount without animation
  useEffect(() => { requestAnimationFrame(() => snapTo(initialIndex, false)); }, [initialIndex, snapTo]);

  const data = useMemo<AgentCardData[]>(() => (
    items.length ? items : [
      { id:'rh', title:'Conseiller RH', role:'RH', image:'/assets/hero/arkabox.png', summary:'Prépare dossiers, contrats, onboarding.', skills:['Dossiers RH','Contrats','Onboarding'] },
      { id:'edu', title:'Formateur', role:'ÉDU', image:'/assets/hero/arkabox.png', summary:'Parcours, évaluations, ateliers.', skills:['Parcours','Évaluations','Ateliers'] },
      { id:'qual', title:'Qualité', role:'QUAL', image:'/assets/hero/arkabox.png', summary:'Processus, audits, conformité.', skills:['Processus','Audits','Conformité'] },
      { id:'org', title:'Organisation', role:'ORG', image:'/assets/hero/arkabox.png', summary:'Roadmaps, risques, arbitrages.', skills:['Roadmaps','Risques','Arbitrages'] },
      { id:'support', title:'Support', role:'SUP', image:'/assets/hero/arkabox.png', summary:'Tickets, réponses, satisfaction.', skills:['Tickets','Réponses','Satisfaction'] },
      { id:'marketing', title:'Marketing', role:'MKT', image:'/assets/hero/arkabox.png', summary:'Campagnes, contenus, analytics.', skills:['Campagnes','Contenus','Analytics'] },
    ]
  ), [items]);

  const atStart = active === 0;
  const atEnd = active === Math.max(0, data.length - 1);

  return (
    <section id="agents" aria-labelledby="agents-title" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h2 id="agents-title" className="text-3xl md:text-4xl font-semibold" style={{ color: 'var(--site-text)' }}>Nos agents experts</h2>
            <p className="mt-2" style={{ color: 'var(--site-muted)' }}>Une squad où chaque rôle est clair…</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button aria-controls="agents-rail" aria-label="Carte précédente" disabled={atStart} onClick={() => snapTo(Math.max(0, active - 1))} className="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 disabled:opacity-40 disabled:cursor-not-allowed">◀</button>
            <button aria-controls="agents-rail" aria-label="Carte suivante" disabled={atEnd} onClick={() => snapTo(Math.min(data.length - 1, active + 1))} className="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 disabled:opacity-40 disabled:cursor-not-allowed">▶</button>
          </div>
        </header>
      </div>

      {/* rail full‑bleed */}
      <div className="mt-6 w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <div id="agents-rail" ref={railRef} role="group" aria-roledescription="carousel" aria-label="Agents" aria-live="off" className="rail flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6" style={{ scrollBehavior: 'smooth', scrollbarGutter: 'stable both-edges' }}>
          {data.map((a, i) => (

            <article key={a.id} ref={(el: HTMLElement | null) => { if (el) cardRefs.current[i] = el; }} role="region" aria-label={`${a.role} — ${a.title}`} tabIndex={0} className="flex-none w-[55%] md:w-[240px] lg:w-[320px] xl:w-[360px] snap-start snap-always rounded-[16px] bg-white ring-1 ring-black/5 shadow-[0_12px_24px_rgba(15,23,42,.08)]">

              <div className="relative overflow-hidden rounded-t-[16px] bg-slate-100 h-28 md:h-36 lg:h-44 xl:h-48">
                <img src={a.image} alt={`${a.role} — ${a.title}, illustration`} className="absolute inset-0 h-full w-full object-cover" loading={i===0?'eager':'lazy'} decoding="async" />
              </div>
              <div className="p-6 grid [grid-template-rows:auto_auto_1fr_auto] min-h-[190px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--site-text)' }}>{a.title}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundImage: 'var(--brand-grad)' }}>{a.role}</span>
                </div>
                <p className="mt-2" style={{ color: 'var(--site-muted)' }}>{a.summary}</p>
                <ul className="mt-4 grid grid-cols-3 gap-2 text-sm" style={{ color: 'var(--site-muted)' }}>
                  {a.skills.slice(0,3).map((s, j) => (
                    <li key={j} className="col-span-3 sm:col-span-1 flex items-center gap-2">✓ {s}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2" role="tablist" aria-label="Pagination agents">
          {data.map((_, i) => (
            <button key={i} role="tab" aria-selected={active===i} aria-controls="agents-rail" onClick={() => snapTo(i)} aria-label={`Aller à la carte ${i+1}`}
              className={`h-2.5 w-2.5 rounded-full ${active===i ? 'bg-slate-800' : 'bg-slate-400/40'}`} />
          ))}
        </div>
        <span className="ml-2 text-sm" style={{ color: 'var(--site-muted)' }}>{active+1} / {data.length}</span>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce){
          #agents-rail { scroll-behavior:auto !important; }
        }
      `}</style>
    </section>
  );
}
