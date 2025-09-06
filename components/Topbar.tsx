'use client';

import React, { useEffect, useRef } from 'react';
import { Search, Share2, Play } from 'lucide-react';
import RoleBadge from './RoleBadge';

type Role = 'viewer' | 'operator' | 'owner';

type TopbarProps = {
  role: Role;
  onSearchFocus?: () => void;
  onShare?: () => void;
  onRun?: () => void;
  onLogoClick?: () => void;
  placeholder?: string;
  sticky?: boolean;
};

export default function Topbar({
  role,
  onSearchFocus,
  onShare,
  onRun,
  onLogoClick,
  placeholder = 'Rechercher (⌘K)',
  sticky = true,
}: TopbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mac = navigator.platform.toUpperCase().includes('MAC');
      const mod = mac ? e.metaKey : e.ctrlKey;
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        inputRef.current?.focus();
        onSearchFocus?.();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        (document.activeElement as HTMLElement).blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSearchFocus]);

  // Logout supprimé de la Topbar (menu utilisateur déplacé sur l’avatar en bas de la sidebar)

  return (
    <header
      role="banner"
      aria-label="Application top bar"
      className={`h-14 box-border border-b border-[var(--border)] bg-[var(--surface)] grid grid-cols-[auto_1fr_auto] items-center px-4 gap-4 ${sticky ? 'sticky top-0 z-30' : ''}`}
    >
      {/* Left: logo */}
      <div className="flex items-center">
        <a
          href="/"
          aria-label="Arka"
          onClick={onLogoClick}
          className="inline-flex h-8 items-center px-1 rounded hover:opacity-100 opacity-90"
        >
          <img src="/assets/logo/arka-logo-blanc.svg" alt="Arka" className="h-5 w-auto" />
        </a>
      </div>
      {/* Center: search */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-[var(--fgdim)] bg-[var(--elevated)] border border-[var(--border)] rounded-full px-3 py-1 w-full max-w-xl focus-within:ring-1 focus-within:ring-[var(--ring-soft)]">
          <Search className="w-4 h-4" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            aria-label="Rechercher"
            className="bg-transparent outline-none text-[var(--fg)] placeholder:text-[var(--fgdim)]/70 w-full"
          />
        </div>
      </div>
      {/* Right: role badge + actions */}
      <div className="relative flex items-center gap-3 justify-end">
        <RoleBadge />
        <button
          onClick={onShare}
          className="h-8 px-3 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[var(--ring-soft)]"
        >
          <Share2 className="w-3 h-3" aria-hidden />Share
        </button>
        <button
          onClick={onRun}
          className="h-8 px-3 rounded bg-white/5 border border-[var(--border)] text-xs flex items-center gap-1 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[var(--ring-soft)]"
        >
          <Play className="w-3 h-3" aria-hidden />Run
        </button>
      </div>
    </header>
  );
}
