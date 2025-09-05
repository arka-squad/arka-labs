"use client";

import { Activity, CalendarRange, Layers, FileText, Gauge, Users, Inbox, Menu, GitCommit } from 'lucide-react';

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

  return (
    <aside className="h-full w-[72px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col z-20">
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
      <div className="mt-auto p-2 flex flex-col items-center gap-2 border-t border-[var(--border)]">
        <button aria-label="Messages" title="Messages" className="relative h-12 w-full rounded-[12px] border border-[var(--border)] grid place-items-center hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-soft)]">
          <Inbox className="w-5 h-5" aria-hidden />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--success)]" />}
        </button>
        <div className="relative w-12 h-12 rounded-full bg-white/10 grid place-items-center border border-[var(--border)]" aria-label="Utilisateur connecté" title="Mon compte">
          <span className="text-sm">O</span>
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)] ${presenceColor}`} />
        </div>
      </div>
    </aside>
  );
}
