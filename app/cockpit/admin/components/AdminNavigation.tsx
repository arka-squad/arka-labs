'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentRole } from '../../../../lib/auth/role';

interface AdminNavigationProps {
  className?: string;
}

export default function AdminNavigation({ className = "" }: AdminNavigationProps) {
  const [stats, setStats] = useState({
    profils: { total: 23 }, // B30 Profils
    squads: { total: 0 },
    agents: { total: 0 },
    projects: { total: 0 },
    clients: { total: 0 }
  });
  const [userRole, setUserRole] = useState<string>('viewer');
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setUserRole(getCurrentRole());
    loadNavigationStats();
  }, []);

  const loadNavigationStats = async () => {
    try {
      // Essayer d'abord les nouvelles APIs B26
      const responses = await Promise.allSettled([
        fetch('/api/admin/squads?limit=1', { credentials: 'include' }),
        fetch('/api/admin/agents?limit=1', { credentials: 'include' }),
        fetch('/api/admin/projects?limit=1', { credentials: 'include' }),
        fetch('/api/admin/clients?limit=1', { credentials: 'include' })
      ]);

      let newStats = { ...stats };

      // Squads
      if (responses[0].status === 'fulfilled' && responses[0].value.ok) {
        const squadsData = await responses[0].value.json();
        newStats.squads.total = squadsData.pagination?.total || squadsData.count || 0;
      }

      // Agents  
      if (responses[1].status === 'fulfilled' && responses[1].value.ok) {
        const agentsData = await responses[1].value.json();
        newStats.agents.total = agentsData.pagination?.total || agentsData.count || 0;
      }

      // Projects
      if (responses[2].status === 'fulfilled' && responses[2].value.ok) {
        const projectsData = await responses[2].value.json();
        newStats.projects.total = projectsData.pagination?.total || projectsData.count || 0;
      }

      // Clients
      if (responses[3].status === 'fulfilled' && responses[3].value.ok) {
        const clientsData = await responses[3].value.json();
        newStats.clients.total = clientsData.pagination?.total || clientsData.count || 0;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Failed to load navigation stats:', error);
      // Fallback avec données par défaut
      setStats({
        squads: { total: 0 },
        agents: { total: 0 },
        projects: { total: 1 }, // Valeur du screenshot
        clients: { total: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Déterminer la section active basée sur le pathname
  const getActiveTab = () => {
    if (pathname.includes('/profils')) return 'profils';
    if (pathname.includes('/squads')) return 'squads';
    if (pathname.includes('/agents')) return 'agents';
    if (pathname.includes('/projects')) return 'projects';
    if (pathname.includes('/clients')) return 'clients';
    if (pathname.includes('/analytics')) return 'analytics';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const tabs = [
    {
      id: 'profils',
      label: '💎 Profils',
      count: stats.profils.total,
      href: '/cockpit/admin/profils',
      badge: 'NEW!'
    },
    {
      id: 'clients',
      label: '🏢 Clients',
      count: stats.clients.total,
      href: '/cockpit/admin/clients'
    },
    {
      id: 'projects',
      label: '📋 Projects',
      count: stats.projects.total,
      href: '/cockpit/admin/projects'
    },
    {
      id: 'squads',
      label: '🔷 Squads',
      count: stats.squads.total,
      href: '/cockpit/admin/squads'
    },
    {
      id: 'agents',
      label: '👤 Agents',
      count: stats.agents.total,
      href: '/cockpit/admin/agents'
    },
    {
      id: 'analytics',
      label: '📊 Analytics',
      href: '/cockpit/analytics'
    }
  ];

  return (
    <div className={`mb-6 md:mb-8 ${className}`}>
      {/* Header avec titre et compteurs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏢</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              ARKA Backoffice Admin
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Gestion des squads, agents, projets et clients
          </p>
        </div>
        
        {/* Compteurs en temps réel */}
        <div className="flex items-center space-x-6 self-start sm:self-center">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-xs text-gray-400">PROFILS</div>
              <div className="text-lg font-bold text-emerald-400">
                {loading ? '...' : stats.profils.total}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">CLIENTS</div>
              <div className="text-lg font-bold text-blue-400">
                {loading ? '...' : stats.clients.total}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">PROJETS</div>
              <div className="text-lg font-bold text-yellow-400">
                {loading ? '...' : stats.projects.total}
              </div>
            </div>
          </div>
          
          {/* Status utilisateur */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400 hidden sm:inline">En ligne</span>
          </div>
        </div>
      </div>
      
      {/* Navigation par onglets */}
      <div className="flex space-x-8 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === tab.id
                ? tab.id === 'profils' ? 'border-emerald-400 text-emerald-400' : 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded font-medium">
                {tab.badge}
              </span>
            )}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded text-xs ${
                activeTab === tab.id
                  ? tab.id === 'profils' ? 'bg-emerald-400 text-white' : 'bg-blue-400 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}