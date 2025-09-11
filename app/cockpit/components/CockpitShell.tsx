"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import Topbar from '../../../components/Topbar';
import GlobalChat from './GlobalChat';
import Leftbar from '../../../components/leftbar';
import { getCurrentRole } from '../../../lib/auth/role';

type CockpitShellProps = {
  children: ReactNode;
};

export default function CockpitShell({ children }: CockpitShellProps) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'operator' | 'viewer' | 'owner'>('viewer');

  useEffect(() => {
    setUserRole(getCurrentRole());
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Topbar role={userRole} />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar navigation principale */}
        <Leftbar 
          value={currentView as any}
          onChange={(view) => setCurrentView(view)}
          items={[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'agents', label: 'Agents' },
            { id: 'roadmap', label: 'Roadmap' },
            { id: 'gouv', label: 'Gouvernance' },
            { id: 'docs', label: 'DocDesk' },
            { id: 'observa', label: 'Observabilité' },
            { id: 'runs', label: 'Runs' },
            { id: 'roster', label: 'Roster' },
          ]}
        />
        
        {/* Chat global */}
        <GlobalChat />
        
        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto bg-gray-900 scroller">
          {children}
        </main>
      </div>
    </div>
  );
}

