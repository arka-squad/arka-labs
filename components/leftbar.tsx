"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Activity, CalendarRange, Layers, FileText, Gauge, Users, Inbox, Menu, GitCommit, Settings, LogOut } from 'lucide-react';

type NavId = 'dashboard'|'roadmap'|'builder'|'gouv'|'docdesk'|'docs'|'observa'|'obs'|'runs'|'roster';
type Item = { id: NavId; label: string };

type LeftbarProps = {
  value?: NavId;                    // preferred API
  onChange?: (id: NavId) => void;   // preferred API
  // Back-compat mapping (view/setView)
  view?: string;
  setView?: (v: string) => void;
  items?: Item[];
  unread?: number;
  presence?: 'online'|'away'|'busy';
  className?: string;
};

export default function Leftbar({
  value,
  onChange,
  view,
  setView,
  items = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'gouv', label: 'Gouvernance' },
    { id: 'docs', label: 'DocDesk' },
    { id: 'observa', label: 'Observabilité' },
    { id: 'runs', label: 'Runs' },
    { id: 'roster', label: 'Roster' },
  ],
  unread = 0,
  presence = 'online',
  className,
}: LeftbarProps) {
  // Normalize API
  const current = (value ?? (view as NavId)) || 'dashboard';
  const change = (id: NavId) => {
    onChange?.(id);
    setView?.(id);
  };

  const iconFor = (id: string) => {
    switch (id) {
      case 'dashboard': return <Activity className="w-5 h-5" aria-hidden/>;
      case 'roadmap': return <CalendarRange className="w-5 h-5" aria-hidden/>;
      case 'gouv':
      case 'builder': return <Layers className="w-5 h-5" aria-hidden/>;
      case 'docs':
      case 'docdesk': return <FileText className="w-5 h-5" aria-hidden/>;
      case 'obs':
      case 'observa': return <Gauge className="w-5 h-5" aria-hidden/>;
      case 'runs': return <GitCommit className="w-5 h-5" aria-hidden/>;
      case 'roster': return <Users className="w-5 h-5" aria-hidden/>;
      default: return null;
    }
  };

  const presenceColor = presence === 'online' ? 'bg-[var(--success)]' : presence === 'away' ? 'bg-[var(--warn)]' : 'bg-[var(--danger)]';

  // User menu (avatar click)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') setMenuOpen(false); }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onEsc); };
  }, []);

  // Decode role from JWT if present (display-only)
  const [role, setRole] = useState<'viewer'|'operator'|'owner'|'admin'|null>(null);
  useEffect(() => {
    function readRole() {
      try {
        const jwt = localStorage.getItem('jwt') || localStorage.getItem('RBAC_TOKEN') || '';
        const payload = jwt.split('.')[1];
        if (!payload) return setRole(null);
        const json = JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
        const r = (json.role || json.claims?.role || '').toString().toLowerCase();
        if (['viewer','operator','owner','admin'].includes(r)) setRole(r as any); else setRole(null);
      } catch { setRole(null); }
    }
    readRole();
    const id = setInterval(readRole, 2000);
    return () => clearInterval(id);
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem('RBAC_TOKEN');
      localStorage.removeItem('jwt');
      localStorage.removeItem('session_token');
    } catch {}
    setMenuOpen(false);
    window.location.assign('/login');
  };

  return (
    <aside className={`${className ?? ''} h-full w-[72px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col z-20`}>
      <div className="h-14 grid place-items-center border-b border-[var(--border)]">
        <Menu className="w-5 h-5" aria-label="Menu" />
      </div>
      <nav aria-label="Navigation principale" role="navigation" className="flex-1">
        {items.map((it) => (
          <button
            key={it.id}
            aria-label={it.label}
            aria-current={current === it.id ? 'page' : undefined}
            onClick={() => change(it.id)}
            className={`h-12 w-full grid place-items-center border-b border-[var(--border)] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)] ${current === it.id ? 'bg-white/10' : ''}`}
            title={it.label}
          >
            {iconFor(it.id)}
          </button>
        ))}
      </nav>
      <div className="mt-auto p-2 flex flex-col items-center gap-2 border-t border-[var(--border)] relative" ref={menuRef}>
        <button aria-label="Messages" title="Messages" className="relative h-12 w-full rounded-[12px] border border-[var(--border)] grid place-items-center hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]">
          <Inbox className="w-5 h-5" aria-hidden />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--success)]" />}
        </button>
        <button
          type="button"
          aria-label="Mon compte"
          title="Mon compte"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(e)=>{ e.stopPropagation(); setMenuOpen(o=>!o); }}
          className="relative w-12 h-12 rounded-full bg-white/10 grid place-items-center border border-[var(--border)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]"
        >
          <span className="text-sm">O</span>
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)] ${presenceColor}`} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Menu utilisateur"
            className="absolute bottom-16 left-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-2 z-50"
          >
            <div className="px-2 py-1.5 text-xs text-[var(--fgdim)] flex items-center justify-between">
              <span>Compte</span>
              {role && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] border ${role==='owner' ? 'border-[var(--primary)] text-[var(--primary)]' : role==='operator' ? 'border-[var(--success)] text-[var(--success)]' : 'border-[var(--muted)] text-[var(--muted)]'}`}
                  aria-label={`Current role: ${role.toUpperCase()}`}
                >{role.toUpperCase()}</span>
              )}
            </div>
            <button role="menuitem" className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-white/5 text-sm" onClick={()=>{ /* stub */ setMenuOpen(false); }}>
              <Settings className="w-4 h-4" /> Paramètres
            </button>
            <button role="menuitem" className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 text-sm text-[var(--danger)]" onClick={logout}>
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
