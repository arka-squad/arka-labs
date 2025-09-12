'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Zap, Settings, TrendingUp, AlertCircle, 
  CheckCircle, Clock, ArrowRight, BarChart3, Activity, Building 
} from 'lucide-react';
import { getCurrentRole } from '../../../lib/auth/role';
import ResponsiveWrapper from '../components/ResponsiveWrapper';
import { useRealTimeUpdates, LiveDataBadge } from '../components/RealTimeUpdates';

// Dashboard principal B23 - Cockpit Admin
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'squads' | 'agents' | 'projets' | 'clients' | 'analytics'>('squads');
  const [stats, setStats] = useState({
    squads: { total: 0, active: 0, inactive: 0 },
    projects: { total: 0, active: 0, disabled: 0 },
    instructions: { total: 0, pending: 0, completed: 0, failed: 0 },
    performance: { avg_completion_hours: 0, success_rate: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('viewer');

  // Set up real-time dashboard updates
  const { data: realtimeStats, loading: realtimeLoading } = useRealTimeUpdates({
    endpoint: '/api/admin/dashboard/stats',
    interval: 15000, // Update every 15 seconds
    enabled: true,
    onUpdate: (data) => {
      if (data) {
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setStats(data);
        }
      }
    }
  });

  useEffect(() => {
    setUserRole(getCurrentRole());
    if (!realtimeStats) {
      loadDashboardStats(); // Initial load if real-time data not available
    }
  }, [realtimeStats]);

  const loadDashboardStats = async () => {
    try {
      // Load dashboard statistics from new B23 v2.5 API
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setStats(data);
        }
      } else {
        throw new Error('Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Fallback to legacy endpoints if new API not available
      loadLegacyDashboardStats();
    } finally {
      setLoading(false);
    }
  };

  const loadLegacyDashboardStats = async () => {
    try {
      // Fallback to legacy endpoints
      const [squadsRes, projectsRes] = await Promise.all([
        fetch('/api/admin/squads?limit=1', {
          credentials: 'include'
        }),
        fetch('/api/projects', {
          credentials: 'include'
        })
      ]);

      if (squadsRes.ok && projectsRes.ok) {
        const squadsData = await squadsRes.json();
        const projectsData = await projectsRes.json();
        
        // Calculate stats from API responses
        const squadStats = calculateSquadStats(squadsData);
        const projectStats = calculateProjectStats(projectsData);
        
        setStats({
          squads: squadStats,
          projects: projectStats,
          instructions: { total: 45, pending: 8, completed: 35, failed: 2 }, // Mock data
          performance: { avg_completion_hours: 2.3, success_rate: 0.94 }
        });
      }
    } catch (error) {
      console.error('Failed to load legacy dashboard stats:', error);
    }
  };

  const calculateSquadStats = (data: any) => ({
    total: data.count || 0,
    active: data.items?.filter((s: any) => s.status === 'active').length || 0,
    inactive: data.items?.filter((s: any) => s.status === 'inactive').length || 0
  });

  const calculateProjectStats = (data: any) => ({
    total: data.count || 0,
    active: data.items?.filter((p: any) => p.status === 'active').length || 0,
    disabled: data.items?.filter((p: any) => p.status === 'disabled').length || 0
  });

  const canManageSquads = ['admin', 'manager'].includes(userRole);

  if (loading) {
    return (
      <div className="console-theme min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du cockpit...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'squads' as const, label: '🔷 Squads', count: stats?.squads?.total || 0 },
    { id: 'agents' as const, label: '👤 Agents', count: 0 },
    { id: 'projets' as const, label: '📋 Projets', count: stats?.projects?.total || 0 },
    { id: 'clients' as const, label: '🏢 Clients', count: 0 },
    { id: 'analytics' as const, label: '📊 Analytics' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'squads':
        return renderSquadsSection();
      case 'agents':
        return renderAgentsSection();
      case 'projets':
        return renderProjetsSection();
      case 'clients':
        return renderClientsSection();
      case 'analytics':
        return renderAnalyticsSection();
      default:
        return renderSquadsSection();
    }
  };

  return (
    <ResponsiveWrapper 
      currentPath="/cockpit/admin" 
      userRole={userRole} 
      contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
      innerClassName="max-w-none mx-0"
    >
        {/* Header avec Tabs - Mobile Responsive */}
        <div className="mb-6 md:mb-8">
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
            <div className="flex items-center space-x-6 self-start sm:self-center">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-xs text-gray-400">SQUADS</div>
                  <div className="text-lg font-bold text-green-400">{stats?.squads?.total || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">AGENTS</div>
                  <div className="text-lg font-bold text-blue-400">0</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">PROJETS</div>
                  <div className="text-lg font-bold text-yellow-400">{stats?.projects?.total || 0}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 hidden sm:inline">En ligne</span>
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    activeTab === tab.id 
                      ? 'bg-blue-400 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {renderTabContent()}
        </div>

        {/* Quick Access Footer */}
        <div className="mt-8 flex justify-center">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 text-center">
            <span>B23 Console Admin v2.5</span>
            <span className="hidden sm:inline">•</span>
            <span>Architecture simplifiée</span>
            <span className="hidden sm:inline">•</span>
            <span>Performance optimisée</span>
          </div>
        </div>
    </ResponsiveWrapper>
  );

  // Section renders
  function renderSquadsSection() {
    return (
      <div className="space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Squads Stats */}
          <LiveDataBadge isLive={!realtimeLoading}>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Users size={24} className="text-blue-400" />
                </div>
                <ArrowRight 
                  size={16} 
                  className="text-gray-500 cursor-pointer hover:text-blue-400" 
                  onClick={() => window.location.href = '/cockpit/squads'}
                />
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">{stats?.squads?.total || 0}</div>
                <div className="text-gray-400 text-sm">Squads totales</div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-400">{stats?.squads?.active || 0} actives</span>
                <span className="text-yellow-400">{stats?.squads?.inactive || 0} inactives</span>
              </div>
            </div>
          </LiveDataBadge>

          {/* Projects Stats */}
          <LiveDataBadge isLive={!realtimeLoading}>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <Briefcase size={24} className="text-green-400" />
                </div>
                <ArrowRight 
                  size={16} 
                  className="text-gray-500 cursor-pointer hover:text-green-400"
                  onClick={() => window.location.href = '/cockpit/projects'}
                />
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">{stats?.projects?.total || 0}</div>
                <div className="text-gray-400 text-sm">Projets</div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-400">{stats?.projects?.active || 0} actifs</span>
                <span className="text-red-400">{stats?.projects?.disabled || 0} désactivés</span>
              </div>
            </div>
          </LiveDataBadge>

          {/* Instructions Stats */}
          <LiveDataBadge isLive={!realtimeLoading}>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-900/30 rounded-lg">
                  <Zap size={24} className="text-purple-400" />
                </div>
                <ArrowRight 
                  size={16} 
                  className="text-gray-500 cursor-pointer hover:text-purple-400"
                  onClick={() => window.location.href = '/cockpit/instructions'}
                />
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">{stats?.instructions?.total || 0}</div>
                <div className="text-gray-400 text-sm">Instructions</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span className="text-yellow-400">{stats?.instructions?.pending || 0} en cours</span>
                <span className="text-green-400">{stats?.instructions?.completed || 0} OK</span>
                <span className="text-red-400">{stats?.instructions?.failed || 0} KO</span>
              </div>
            </div>
          </LiveDataBadge>

          {/* Performance Stats */}
          <LiveDataBadge isLive={!realtimeLoading}>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-900/30 rounded-lg">
                  <TrendingUp size={24} className="text-orange-400" />
                </div>
                <Activity size={16} className="text-gray-500" />
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">
                  {((stats?.performance?.success_rate || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Taux de succès</div>
              </div>
              <div className="text-xs text-orange-400">
                Moy: {(stats?.performance?.avg_completion_hours || 0).toFixed(1)}h
              </div>
            </div>
          </LiveDataBadge>
        </div>

        {/* Action Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Manage Squads */}
          {canManageSquads && (
            <div 
              className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl p-6 border border-blue-700/30 cursor-pointer hover:border-blue-600/50 transition-all"
              onClick={() => window.location.href = '/cockpit/squads'}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Users size={24} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Gérer les Squads</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Créer, configurer et organiser vos squads d&apos;agents IA spécialisés
              </p>
              <div className="flex justify-between items-center">
                <span className="text-blue-400 text-sm font-medium">Accéder →</span>
                <div className="flex space-x-1">
                  <CheckCircle size={16} className="text-green-400" />
                  <Clock size={16} className="text-yellow-400" />
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              </div>
            </div>
          )}

          {/* Manage Projects */}
          <div 
            className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl p-6 border border-green-700/30 cursor-pointer hover:border-green-600/50 transition-all"
            onClick={() => window.location.href = '/cockpit/projects'}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Briefcase size={24} className="text-green-400" />
              <h3 className="text-lg font-semibold text-white">Projets Client</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Suivre les projets, assigner les squads et monitorer la performance
            </p>
            <div className="flex justify-between items-center">
              <span className="text-green-400 text-sm font-medium">Voir tout →</span>
              <div className="text-xs text-gray-500">
                Architecture projet-centrée
              </div>
            </div>
          </div>

          {/* Manage Clients */}
          <div 
            className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl p-6 border border-blue-700/30 cursor-pointer hover:border-blue-600/50 transition-all"
            onClick={() => window.location.href = '/cockpit/clients'}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Building size={24} className="text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Référentiel Clients</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Gérer le portefeuille client et leurs contextes spécifiques
            </p>
            <div className="flex justify-between items-center">
              <span className="text-blue-400 text-sm font-medium">Gérer →</span>
              <div className="text-xs text-gray-500">
                TPE • PME • ETI • GE
              </div>
            </div>
          </div>

          {/* Manage Agents */}
          <div 
            className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-6 border border-purple-700/30 cursor-pointer hover:border-purple-600/50 transition-all"
            onClick={() => window.location.href = '/cockpit/agents'}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Zap size={24} className="text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Nos Agents IA</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Bibliothèque d&apos;agents, templates et performances
            </p>
            <div className="flex justify-between items-center">
              <span className="text-purple-400 text-sm font-medium">Explorer →</span>
              <div className="text-xs text-gray-500">
                Templates • Versions • Scoring
              </div>
            </div>
          </div>

          {/* Performance Dashboard */}
          <div 
            className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-6 border border-purple-700/30 cursor-pointer hover:border-purple-600/50 transition-all"
            onClick={() => window.location.href = '/cockpit/analytics'}
          >
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 size={24} className="text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Analytics</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Métriques de performance, KPIs et rapports détaillés
            </p>
            <div className="flex justify-between items-center">
              <span className="text-purple-400 text-sm font-medium">Dashboard →</span>
              <div className="text-xs text-gray-500">
                Temps réel
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">🔄 Activité récente - Squads</h2>
            <button className="text-gray-400 hover:text-white text-sm">
              Voir tout →
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
              <CheckCircle size={16} className="text-green-400" />
              <div className="flex-1">
                <div className="text-white text-sm">Squad RH Alpha a complété une instruction</div>
                <div className="text-gray-500 text-xs">Projet: Journée Coworking Q4 • Il y a 12 min</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
              <Users size={16} className="text-blue-400" />
              <div className="flex-1">
                <div className="text-white text-sm">Nouvel agent ajouté à Squad Tech Core</div>
                <div className="text-gray-500 text-xs">Agent: Developer Beta • Il y a 34 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAgentsSection() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">👤 AGENTS - Création & Édition</h2>
          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors text-sm text-white">
            + Créer Agent
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <Users size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Section Agents en cours d&apos;implémentation selon les spécifications Codex...</p>
        </div>
      </div>
    );
  }

  function renderProjetsSection() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">📋 PROJETS - Gestion & Assignation</h2>
          <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors text-sm text-white">
            + Créer Projet
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <Briefcase size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Section Projets en cours d&apos;implémentation selon les spécifications Codex...</p>
        </div>
      </div>
    );
  }

  function renderClientsSection() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">🏢 CLIENTS - Gestion & Contact</h2>
          <button className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors text-sm text-white">
            + Nouveau Client
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <Building size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Section Clients en cours d&apos;implémentation selon les spécifications Codex...</p>
        </div>
      </div>
    );
  }

  function renderAnalyticsSection() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">📊 ANALYTICS - Métriques & Rapports</h2>
        
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <BarChart3 size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Section Analytics en cours d&apos;implémentation selon les spécifications Codex...</p>
        </div>
      </div>
    );
  }
}
