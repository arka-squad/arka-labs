"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Leftbar from '../../components/leftbar';
import GlobalChat from './GlobalChat';

export default function CockpitShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChat = (pathname || '').replace(/\/$/, '') !== '/cockpit';
  return (
    <div className="w-full">
      {/* Fixed sidebar below the topbar (h-14 => 56px) */}
      <Leftbar
        className="fixed top-14 left-0 bottom-0"
        value={'dashboard'}
        onChange={(id) => {
          switch (id) {
            case 'dashboard':
            case 'roadmap':
              window.location.href = '/cockpit/projects';
              break;
            case 'gouv':
              window.location.href = '/cockpit/admin';
              break;
            case 'docs':
              window.location.href = '/cockpit/instructions';
              break;
            case 'observa':
            case 'obs':
              window.location.href = '/cockpit/analytics';
              break;
            case 'runs':
            case 'roster':
              window.location.href = '/cockpit/squads';
              break;
            default:
              window.location.href = '/cockpit/projects';
          }
        }}
        items={[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'roadmap', label: 'Projets' },
          { id: 'gouv', label: 'Admin' },
          { id: 'docs', label: 'DocDesk' },
          { id: 'observa', label: 'Analytics' },
          { id: 'roster', label: 'Squads' },
        ]}
      />
      {/* Main content shifted to leave room for sidebar and optional chat; full height minus topbar */}
      <main
        className={`ml-[72px] h-[calc(100vh-56px)] min-w-0 overflow-auto`}
        style={{ paddingLeft: showChat ? 'calc(var(--cockpit-chat-w, 320px) + 16px)' as any : undefined }}
      >
        {children}
      </main>
      {showChat && <GlobalChat />}
    </div>
  );
}
