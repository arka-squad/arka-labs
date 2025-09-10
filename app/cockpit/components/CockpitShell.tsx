"use client";

import React, { ReactNode } from 'react';
import Leftbar from '../../../components/leftbar';
import GlobalChat from './GlobalChat';

type CockpitShellProps = {
  children: ReactNode;
  leftbarValue?: 'dashboard'|'roadmap'|'builder'|'gouv'|'docdesk'|'docs'|'observa'|'obs'|'runs'|'roster';
  onLeftbarChange?: (value: string) => void;
};

export default function CockpitShell({ 
  children, 
  leftbarValue = 'dashboard',
  onLeftbarChange 
}: CockpitShellProps) {
  // Items de navigation pour le cockpit
  const leftbarItems = [
    { id: 'dashboard' as const, label: 'Admin' },
    { id: 'roadmap' as const, label: 'Squads' },
    { id: 'builder' as const, label: 'Projects' },
    { id: 'gouv' as const, label: 'Agents' },
    { id: 'docs' as const, label: 'Clients' },
    { id: 'observa' as const, label: 'Analytics' },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar fixe à gauche */}
      <Leftbar 
        items={leftbarItems}
        value={leftbarValue}
        onChange={onLeftbarChange}
        unread={0}
        presence="online"
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Chat global à gauche avec largeur dynamique */}
        <GlobalChat />
        
        {/* Contenu principal avec padding calculé dynamiquement */}
        <main 
          className="flex-1 overflow-y-auto bg-gray-900"
          style={{ paddingLeft: 'calc(var(--cockpit-chat-w, 0px) + 16px)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}