'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Settings, AlertCircle, Calendar, Briefcase, Search, Filter, ArrowRight } from 'lucide-react';
import ResponsiveWrapper from '../components/ResponsiveWrapper';

interface Project {
  id: number;
  name: string;
  created_at: string;
  created_by: string;
  status: 'active' | 'disabled' | 'archived';
  squads_count: number;
  metadata?: {
    client?: string;
    priority?: string;
  };
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'disabled': return '#F59E0B';
      case 'archived': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.metadata?.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesPriority = !priorityFilter || project.metadata?.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="console-theme min-h-screen text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement des projets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveWrapper currentPath="/cockpit/projects">
        {/* Header - Mobile Responsive */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4 pl-16 md:pl-0">
              <button
                onClick={() => window.location.href = '/cockpit/admin'}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                ← Dashboard
              </button>
              <div className="w-px h-6 bg-gray-600 hidden sm:block"></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">📋 Gestion Projets</h1>
                <p className="text-gray-400 text-sm sm:text-base">Pilotez vos projets clients et leurs squads assignées</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => window.location.href = '/cockpit/squads'}
                className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Users size={16} />
                <span>Gérer Squads</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} />
                <span>Nouveau Projet</span>
              </button>
            </div>
          </div>
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
                <option value="active">Actifs</option>
                <option value="disabled">Désactivés</option>
                <option value="archived">Archivés</option>
              </select>
            </div>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-auto bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
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
              onClick={() => window.location.href = `/cockpit/projects/${project.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  />
                  <span className="text-sm text-gray-400 capitalize">{project.status}</span>
                  {project.metadata?.priority && (
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: getPriorityColor(project.metadata.priority) + '20',
                        color: getPriorityColor(project.metadata.priority)
                      }}
                    >
                      {project.metadata.priority}
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

              {project.metadata?.client && (
                <div className="flex items-center space-x-2 text-sm text-blue-400 mb-4">
                  <Briefcase size={14} />
                  <span>{project.metadata.client}</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Users size={14} className="text-green-400" />
                  <span className="text-green-400 font-medium">{project.squads_count}</span>
                  <span className="text-gray-500 text-sm">squads</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <Calendar size={14} />
                  <span>{new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
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
            <p className="text-gray-500 mb-6">
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
                {projects.filter(p => p.status === 'disabled').length}
              </div>
              <div className="text-gray-400 text-sm">Projets Suspendus</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {projects.reduce((sum, p) => sum + p.squads_count, 0)}
              </div>
              <div className="text-gray-400 text-sm">Squads Assignées</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {projects.length}
              </div>
              <div className="text-gray-400 text-sm">Total Projets</div>
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
              onClick={() => window.location.href = '/cockpit/squads'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Gérer les Squads →
            </button>
          </div>
        </div>
    </ResponsiveWrapper>
  );
}