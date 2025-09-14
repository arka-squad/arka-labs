'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Settings, AlertCircle, Calendar, Briefcase, Search, Filter, ArrowRight } from 'lucide-react';
import ResponsiveWrapper from '../../components/ResponsiveWrapper';
import AdminNavigation from '../components/AdminNavigation';
import AdminProtection from '../components/AdminProtection';

interface Project {
  id: string; // UUID format
  name: string; // schéma DB réel
  client: {
    id: string;
    nom: string;
    secteur: string;
  };
  status: 'draft' | 'active' | 'on_hold' | 'completed'; // schéma DB réel
  priority: 'low' | 'normal' | 'high' | 'urgent'; // schéma DB réel
  budget: number;
  deadline: string;
  agents_count: number;
  squads_count: number;
  deadline_alert?: 'ok' | 'proche' | 'depassee';
  created_at: string;
  created_by: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProjects();
    }, 300); // Debounce de 300ms pour éviter trop d'appels API

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, priorityFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Construire les paramètres de filtrage
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/projects?${params.toString()}`, {
        headers: {
          'X-Trace-Id': `trace-${Date.now()}`
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'draft': return '#F59E0B';
      case 'on_hold': return '#6B7280';
      case 'completed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'normal': return '#10B981';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getDeadlineAlertColor = (alert?: string) => {
    switch (alert) {
      case 'depassee': return '#EF4444';
      case 'proche': return '#F59E0B';
      case 'ok': return '#10B981';
      default: return '#6B7280';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.secteur?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesPriority = !priorityFilter || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <AdminProtection allowedRoles={['admin', 'manager']}>
        <ResponsiveWrapper 
        currentPath="/cockpit/admin/projects"
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
        innerClassName="max-w-none mx-0"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement des projets...</p>
          </div>
        </div>
        </ResponsiveWrapper>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
      <ResponsiveWrapper 
      currentPath="/cockpit/admin/projects"
      contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
      innerClassName="max-w-none mx-0"
    >
        {/* Admin Navigation */}
        <AdminNavigation />
        
        {/* Action Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📋 Gestion Projets</h1>
            <p className="text-gray-400">Pilotez vos projets clients et leurs squads assignées</p>
          </div>
          <button 
            onClick={() => window.location.href = '/cockpit/admin/projects/new'}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            <span>Nouveau Projet</span>
          </button>
        </div>

        {/* Barre de recherche et filtres - Mobile Responsive */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom de projet ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Filter size={16} className="text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Tous statuts</option>
                <option value="actif">Actifs</option>
                <option value="inactif">Inactifs</option>
                <option value="archive">Archivés</option>
                <option value="termine">Terminés</option>
              </select>
            </div>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-auto bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes priorités</option>
              <option value="urgente">Urgente</option>
              <option value="haute">Haute</option>
              <option value="normale">Normale</option>
              <option value="basse">Basse</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Résultats de recherche */}
        {searchTerm && (
          <div className="mb-4 text-gray-400 text-sm">
            {filteredProjects.length} résultat{filteredProjects.length !== 1 ? 's' : ''} 
            {searchTerm && ` pour "${searchTerm}"`}
          </div>
        )}

        {/* Grille des Projets - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer transform hover:scale-[1.02]"
              onClick={() => window.location.href = `/cockpit/admin/projects/${project.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  />
                  <span className="text-sm text-gray-400 capitalize">{project.status}</span>
                  {project.priority && (
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: getPriorityColor(project.priority) + '20',
                        color: getPriorityColor(project.priority)
                      }}
                    >
                      {project.priority}
                    </span>
                  )}
                  {project.deadline_alert && project.deadline_alert !== 'ok' && (
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: getDeadlineAlertColor(project.deadline_alert) + '20',
                        color: getDeadlineAlertColor(project.deadline_alert)
                      }}
                    >
                      {project.deadline_alert === 'proche' ? '⚠️ Deadline proche' : '🚨 Deadline dépassée'}
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Settings size={16} className="text-gray-400 hover:text-white" />
                  <ArrowRight size={16} className="text-gray-400 hover:text-blue-400" />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-white">{project.name}</h3>
              <p className="text-gray-400 text-sm mb-4">Projet #{project.id}</p>

              {project.client && (
                <div className="flex items-center space-x-2 text-sm text-blue-400 mb-4">
                  <Briefcase size={14} />
                  <span>{project.client.nom}</span>
                  {project.client.secteur && (
                    <span className="text-gray-300">• {project.client.secteur}</span>
                  )}
                </div>
              )}

              {project.budget && (
                <div className="flex items-center space-x-2 text-sm text-green-400 mb-2">
                  <span>💰</span>
                  <span>{project.budget.toLocaleString('fr-FR')} €</span>
                </div>
              )}

              {project.deadline && (
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
                  <Calendar size={14} />
                  <span>Échéance: {new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users size={14} className="text-green-400" />
                    <span className="text-green-400 font-medium">{project.agents_count}</span>
                    <span className="text-gray-300 text-sm">agents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-medium">{project.squads_count}</span>
                    <span className="text-gray-300 text-sm">squads</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <span>Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    Par {project.created_by?.split('@')[0] || 'System'}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    Voir détails →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <Briefcase size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'Aucun projet trouvé' : 'Aucun projet'}
            </p>
            <p className="text-gray-300 mb-6">
              {searchTerm 
                ? 'Essayez avec d\'autres termes de recherche' 
                : 'Créez votre premier projet pour commencer'}
            </p>
            {!searchTerm && (
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
                Créer mon premier projet
              </button>
            )}
          </div>
        )}

        {/* Stats rapides - Mobile Responsive */}
        {projects.length > 0 && (
          <div className="mt-8 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {projects.filter(p => p.status === 'active').length}
              </div>
              <div className="text-gray-400 text-sm">Projets Actifs</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {projects.filter(p => p.status === 'draft').length}
              </div>
              <div className="text-gray-400 text-sm">Projets Inactifs</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {projects.reduce((sum, p) => sum + (p.agents_count || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Agents Assignés</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {projects.filter(p => p.deadline_alert === 'proche' || p.deadline_alert === 'depassee').length}
              </div>
              <div className="text-gray-400 text-sm">Alertes Deadline</div>
            </div>
          </div>
        )}

        {/* Action rapide */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-700/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                🚀 Optimisez vos projets
              </h3>
              <p className="text-gray-400">
                Assignez des squads performantes à vos projets pour maximiser les résultats
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/cockpit/admin/squads'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Gérer les Squads →
            </button>
          </div>
        </div>
    </ResponsiveWrapper>
    </AdminProtection>
  );
}