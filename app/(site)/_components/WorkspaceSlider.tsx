"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Route, BookOpen, Settings, Users, Activity, HardDrive, ClipboardList, type LucideIcon, ArrowRight } from 'lucide-react';

export type WorkspaceCardData = {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  cta?: { label: string; href: string };
};

export default function WorkspaceSlider({
  items = [] as WorkspaceCardData[],
  initialIndex = 0,
}: { items?: WorkspaceCardData[]; initialIndex?: number }) {
  const railRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => { requestAnimationFrame(() => snapTo(initialIndex, false)); }, [initialIndex, snapTo]);

  const data = useMemo<WorkspaceCardData[]>(() => (
    items.length ? items : [
      { id:'chat',      title:'Chat',                  desc:"Là où l’on décide et déclenche.",            icon: MessageSquare },
      { id:'roadmap',   title:'Roadmap',              desc:'Missions et jalons.',                         icon: Route },
      { id:'docdesk',   title:'DocDesk',              desc:'Documents, contrats, supports versionnés.',   icon: BookOpen },
      { id:'builder',   title:'Builder Gouvernance',  desc:'Règles et check‑lists.',                      icon: Settings },
      { id:'roster',    title:'Roster',               desc:'Rôles de la squad, charges, dispo.',          icon: Users },
      { id:'observa',   title:'Observabilité',        desc:'Santé et indicateurs clés.',                  icon: Activity },
      { id:'arkameta',  title:'ArkaMeta',             desc:'Mémoire souveraine, chez vous.',              icon: HardDrive },
      { id:'evidence',  title:'Evidence',             desc:'Le paquet de preuves à partager.',            icon: ClipboardList },
    ]
  ), [items]);

  const atStart = active === 0;
  const atEnd = active === Math.max(0, data.length - 1);

  return (
    <section id="workspace" aria-labelledby="workspace-title" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h2 id="workspace-title" className="text-3xl md:text-4xl font-semibold" style={{ color: 'var(--site-text)' }}>Où vit le projet</h2>
            <p className="mt-2 font-medium" style={{ color: 'var(--site-muted)' }}>Tout est visible, rien n’est perdu</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button aria-controls="workspace-rail" aria-label="Précédent" disabled={atStart} onClick={() => snapTo(Math.max(0, active - 1))} className="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 disabled:opacity-40 disabled:cursor-not-allowed">◀︎</button>
            <button aria-controls="workspace-rail" aria-label="Suivant" disabled={atEnd} onClick={() => snapTo(Math.min(data.length - 1, active + 1))} className="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 disabled:opacity-40 disabled:cursor-not-allowed">▶︎</button>
          </div>
        </header>
      </div>

      <div className="mt-6 w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <div
          id="workspace-rail"
          ref={railRef}
          role="group"
          aria-roledescription="carousel"
          aria-label="Workspace"
          aria-live="off"
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6"
          style={{ ['--pad' as any]: 'max(calc((100vw - 90rem)/2 + 24px), 16px)', paddingLeft:'var(--pad)', paddingRight:'var(--pad)', scrollPaddingLeft:'var(--pad)', scrollPaddingRight:'var(--pad)', scrollBehavior: 'smooth', msOverflowStyle:'none', scrollbarWidth:'none', scrollbarGutter: 'stable both-edges', willChange:'scroll-position' }}
        >
          {data.map((w, i) => (
            <article key={w.id} ref={(el: HTMLElement | null) => { if (el) cardRefs.current[i] = el; }} role="region" aria-label={w.title} tabIndex={0} className="flex-none w-[88%] sm:w-[60%] md:w-[340px] lg:w-[380px] xl:w-[420px] snap-start snap-always rounded-[20px] bg-white ring-0 shadow-[0_12px_24px_rgba(15,23,42,.08)] p-6 grid [grid-template-rows:auto_auto_1fr]">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundImage: 'var(--brand-grad)' }}>
                <w.icon size={20} className="text-white" />
              </div>
              <h3 className="mt-4 text-xl font-semibold" style={{ color: 'var(--site-text)' }}>{w.title}</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--site-muted)' }}>{w.desc}</p>
              {/* CTA optionnel */}
              <button aria-label={`Ouvrir ${w.title}`} className="mt-3 h-9 w-9 rounded-full bg-[#0F172A] text-white grid place-items-center shadow-sm justify-self-start">
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </div>

      {/* Bullets/fraction masquées en v1 */}

      <style jsx>{`
        @media (prefers-reduced-motion: reduce){
          #workspace-rail { scroll-behavior:auto !important; }
        }
        #workspace-rail::-webkit-scrollbar { display:none; height:0; }
      `}</style>
    </section>
  );
}
