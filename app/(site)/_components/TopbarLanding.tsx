/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { Menu, X, Rocket } from 'lucide-react';

export type HeaderProps = {
  links?: { label: string; href: string }[];
  onOpenCockpit?: () => void;
  onLogin?: () => void;
  sticky?: boolean;
};

const DEFAULT_LINKS = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#how' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function TopbarLanding({ links = DEFAULT_LINKS, onOpenCockpit, onLogin, sticky = true }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState('');
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Observe sections to set aria-current dynamically
  useEffect(() => {
    const ids = links
      .map((l) => l.href)
      .filter((h) => h.startsWith('#'))
      .map((h) => h.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [links]);

  const stickyCls = sticky ? 'sticky top-0 z-50' : '';
  const borderColor = scrolled ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.08)';

  return (
    <header
      role="banner"
      aria-label="En-tête du site"
      className={`h-14 ${stickyCls} border-b`}
      style={{
        background: 'rgba(227,224,219,0.80)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderColor,
      }}
    >
      {/* Skip link (option) */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-[var(--site-text)] px-3 py-1 rounded" aria-label="Aller au contenu">
        Aller au contenu
      </a>
      <div className="mx-auto h-full max-w-[1440px] px-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Logo */}
        <a href="/" aria-label="Arka" className="inline-flex items-center h-8 opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-black/20 rounded px-1">
          <img src="/assets/logo/arka-logo-noir-radient.svg" alt="Arka" className="h-8 w-auto" />
        </a>

        {/* Center nav (desktop) */}
        <nav aria-label="Navigation principale" className="hidden sm:block">
          <ul className="flex items-center justify-center gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={activeHref === l.href ? 'page' : undefined}
                  className={`text-sm font-medium underline-offset-4 hover:underline rounded py-1.5 px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
                    activeHref === l.href
                      ? 'text-[var(--site-text)]'
                      : 'text-[var(--site-muted)] hover:text-[var(--site-text)]'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions (desktop): secondary then primary */}
        <div className="hidden sm:flex items-center gap-2 justify-end">
          <a
            href="/login"
            onClick={onLogin}
            className="inline-flex items-center h-9 px-3 rounded-[12px] border text-[var(--site-text)] hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            style={{ borderColor: 'rgba(15,23,42,.12)' }}
          >
            Se connecter
          </a>
          <a
            href="/cockpit?demo=1"
            onClick={onOpenCockpit}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[12px] text-white shadow-[0_6px_16px_rgba(226,2,109,.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 hover:-translate-y-px transition will-change-transform"
            style={{ backgroundImage: 'var(--brand-grad)' }}
            aria-label="Entrer dans le cockpit (démo)"
          >
            <Rocket className="w-4 h-4" aria-hidden />
            Ouvrir le cockpit
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile sheet full-width */}
      {open && (
        <div className="sm:hidden border-t" style={{ borderColor: 'rgba(0,0,0,.08)', background: 'rgba(227,224,219,0.92)' }}>
          <div className="mx-auto max-w-[1440px] px-6 py-3 space-y-4">
            <nav aria-label="Navigation principale (mobile)">
              <ul className="flex flex-col gap-2">
                {links.map((l) => (
                  <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={activeHref === l.href ? 'page' : undefined}
                  className={`block text-sm font-medium underline-offset-4 hover:underline rounded py-2 px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
                    activeHref === l.href
                      ? 'text-[var(--site-text)]'
                      : 'text-[var(--site-muted)] hover:text-[var(--site-text)]'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
            </nav>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href="/login"
                onClick={onLogin}
                className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] border text-[var(--site-text)] hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                style={{ borderColor: 'rgba(15,23,42,.12)' }}
              >
                Se connecter
              </a>
              <a
                href="/cockpit?demo=1"
                onClick={onOpenCockpit}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-white shadow-[0_6px_16px_rgba(226,2,109,.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                style={{ backgroundImage: 'var(--brand-grad)' }}
                aria-label="Entrer dans le cockpit (démo)"
              >
                <Rocket className="w-4 h-4" aria-hidden />
                Ouvrir le cockpit
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
