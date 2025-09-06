'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Share2, Play, ChevronDown } from 'lucide-react';
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
  const [open, setOpen] = useState(false);

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

  function logout() {
    try {
      localStorage.removeItem('RBAC_TOKEN');
      localStorage.removeItem('access_token');
      localStorage.removeItem('jwt');
      localStorage.removeItem('session_token');
    } catch {}
    window.location.href = '/login';
  }

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
      {/* Right: role badge + actions + user menu */}
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
        {/* User avatar/menu */}
        <div className="relative">
          <button
            aria-haspopup="menu"
            aria-expanded={open ? 'true' : 'false'}
            onClick={() => setOpen(o => !o)}
            className="h-8 pl-2 pr-2 rounded-full bg-white/5 border border-[var(--border)] flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-[var(--ring-soft)]"
          >
            <span aria-hidden className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-[10px]">U</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {open && (
            <div role="menu" className="absolute right-0 mt-2 min-w-[200px] rounded-xl border border-[var(--border)] elevated bg-[var(--surface)] shadow-2xl p-2 z-50">
              <div className="px-2 py-1 text-xs text-[var(--fgdim)]">Compte</div>
              <button role="menuitem" className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-sm">Paramètres</button>
              <div className="my-2 h-px bg-white/10" />
              <button role="menuitem" onClick={logout} className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-sm text-red-300">Se déconnecter</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
