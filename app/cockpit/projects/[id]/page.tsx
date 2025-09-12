'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Settings, AlertCircle, Calendar, Briefcase, ArrowLeft, 
  Plus, Search, Filter, BarChart3, Clock, CheckCircle, XCircle,
  Target, Zap, TrendingUp, Activity, Edit, Trash2
} from 'lucide-react';

interface Project {
  id: number;
  nom: string;
  created_at: string;
  created_by: string;
  status: 'active' | 'disabled' | 'archived';
  squads_count?: number;
  client_name?: string;
  client_secteur?: string;
  budget?: number;
  deadline?: string;
  priority?: string;
  description?: string;
  metadata?: {
    client?: string;
    priority?: string;
    description?: string;
  };
}

interface Squad {
  id: number;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'archived';
  agents_count: number;
  created_at: string;
  performance_score?: number;
  current_instructions?: number;
}

interface Instruction {
  id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  squad_id: number;
  squad_name: string;
  estimated_hours?: number;
  actual_hours?: number;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'squads' | 'instructions' | 'analytics'>('overview');
  const [showAssignSquadModal, setShowAssignSquadModal] = useState(false);
  const [availableSquads, setAvailableSquads] = useState<Squad[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadProjectData();
  }, [params.id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Load project details first
      const projectRes = await fetch(`/api/admin/projects/${params.id}`, {
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });

      if (!projectRes.ok) {
        if (projectRes.status === 404) {
          throw new Error('Projet non trouvé');
        }
        throw new Error('Échec du chargement du projet');
      }
      
      const projectData = await projectRes.json();
      setProject(projectData);
      
      // Load squads in parallel (if project exists)
      const squadsRes = await fetch(`/api/admin/projects/${params.id}/squads`, {
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });
      
      if (squadsRes.ok) {
        const squadsData = await squadsRes.json();
        setSquads(squadsData.items || []);
      }
      
      // Instructions endpoint doesn't exist yet, skip for now
      setInstructions([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSquads = async () => {
    try {
      const response = await fetch('/api/admin/squads?available_for_project=true', {
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableSquads(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load available squads:', error);
    }
  };

  const assignSquadToProject = async (squadId: number) => {
    try {
      const response = await fetch(`/api/admin/projects/${params.id}/squads`, {
        method: 'POST',
        headers: {
          'X-Trace-Id': `trace-${Date.now()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ squad_id: squadId })
      });

      if (response.ok) {
        setShowAssignSquadModal(false);
        loadProjectData();
      } else {
        throw new Error('Failed to assign squad');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to assign squad');
    }
  };

  const removeSquadFromProject = async (squadId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette squad du projet ?')) return;
    
    try {
      const response = await fetch(`/api/admin/projects/${params.id}/squads/${squadId}`, {
        method: 'DELETE',
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });

      if (response.ok) {
        loadProjectData();
      } else {
        throw new Error('Failed to remove squad');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove squad');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'disabled': case 'inactive': return '#F59E0B';
      case 'archived': return '#6B7280';
      case 'pending': return '#3B82F6';
      case 'in_progress': return '#8B5CF6';
      case 'completed': return '#10B981';
      case 'failed': return '#EF4444';
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

  const filteredSquads = squads.filter(squad => {
    const matchesSearch = squad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         squad.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || squad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="console-theme min-h-screen text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement du projet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="console-theme min-h-screen text-white p-6">
        <div className="text-center py-12">
          <AlertCircle size={64} className="text-red-400 mx-auto mb-4" />
          <p className="text-xl text-red-400 mb-2">Projet non trouvé</p>
          <button 
            onClick={() => window.location.href = '/cockpit/admin/projects'}
            className="text-blue-400 hover:text-blue-300"
          >
            ← Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="console-theme min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/cockpit/admin/projects'}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Projets</span>
            </button>
            <div className="w-px h-6 bg-gray-600"></div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{project.nom}</h1>
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
                    Priorité {project.priority}
                  </span>
                )}
              </div>
              <p className="text-gray-400">
                Projet #{project.id} • {project.client_name || 'Client non spécifié'}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
              <Edit size={16} />
              <span>Modifier</span>
            </button>
            <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
              <Trash2 size={16} />
              <span>Supprimer</span>
            </button>
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

        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Vue d\'ensemble', icon: Target },
              { key: 'squads', label: 'Squads', icon: Users },
              { key: 'instructions', label: 'Instructions', icon: Zap },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Project Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <Users size={20} className="text-blue-400" />
                  <span className="text-2xl font-bold text-white">{project.squads_count}</span>
                </div>
                <div className="text-gray-400 text-sm">Squads assignées</div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap size={20} className="text-purple-400" />
                  <span className="text-2xl font-bold text-white">{instructions.length}</span>
                </div>
                <div className="text-gray-400 text-sm">Instructions totales</div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle size={20} className="text-green-400" />
                  <span className="text-2xl font-bold text-white">
                    {instructions.filter(i => i.status === 'completed').length}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">Terminées</div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock size={20} className="text-yellow-400" />
                  <span className="text-2xl font-bold text-white">
                    {instructions.filter(i => ['pending', 'in_progress'].includes(i.status)).length}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">En cours</div>
              </div>
            </div>

            {/* Project Description */}
            {project.description && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300">{project.description}</p>
              </div>
            )}

            {/* Project Details */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Détails du projet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Créé le</label>
                  <div className="text-white">{new Date(project.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Créé par</label>
                  <div className="text-white">{project.created_by?.split('@')[0] || 'System'}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Client</label>
                  <div className="text-white">{project.client_name || 'Non spécifié'}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Statut</label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    />
                    <span className="text-white capitalize">{project.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'squads' && (
          <div className="space-y-6">
            {/* Squad Management Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une squad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                >
                  <option value="">Tous statuts</option>
                  <option value="active">Actives</option>
                  <option value="inactive">Inactives</option>
                  <option value="archived">Archivées</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setShowAssignSquadModal(true);
                  loadAvailableSquads();
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                <span>Assigner Squad</span>
              </button>
            </div>

            {/* Squads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSquads.map((squad) => (
                <div
                  key={squad.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: getStatusColor(squad.status) }}
                      />
                      <span className="text-sm text-gray-400 capitalize">{squad.status}</span>
                    </div>
                    <button
                      onClick={() => removeSquadFromProject(squad.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{squad.name}</h3>
                  <p className="text-blue-400 text-sm mb-4">{squad.domain}</p>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <Users size={14} className="text-green-400" />
                      <span className="text-green-400 font-medium">{squad.agents_count}</span>
                      <span className="text-gray-500">agents</span>
                    </div>
                    
                    {squad.performance_score && (
                      <div className="flex items-center space-x-2">
                        <TrendingUp size={14} className="text-purple-400" />
                        <span className="text-purple-400 font-medium">
                          {Math.round(squad.performance_score * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => window.location.href = `/cockpit/admin/squads/${squad.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Voir détails →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredSquads.length === 0 && (
              <div className="text-center py-12">
                <Users size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Aucune squad assignée</p>
                <p className="text-gray-500 mb-6">Assignez des squads pour démarrer le projet</p>
                <button
                  onClick={() => {
                    setShowAssignSquadModal(true);
                    loadAvailableSquads();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Assigner première squad
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="space-y-6">
            {/* Instructions List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Instructions du projet</h3>
              </div>
              <div className="divide-y divide-gray-700">
                {instructions.map((instruction) => (
                  <div key={instruction.id} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{instruction.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: getPriorityColor(instruction.priority) + '20',
                            color: getPriorityColor(instruction.priority)
                          }}
                        >
                          {instruction.priority}
                        </span>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: getStatusColor(instruction.status) + '20',
                            color: getStatusColor(instruction.status)
                          }}
                        >
                          {instruction.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>Squad: {instruction.squad_name}</span>
                        <span>Créée le {new Date(instruction.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {instruction.estimated_hours && (
                        <div className="flex items-center space-x-2">
                          <Clock size={14} />
                          <span>{instruction.estimated_hours}h estimées</span>
                          {instruction.actual_hours && (
                            <span>• {instruction.actual_hours}h réelles</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {instructions.length === 0 && (
              <div className="text-center py-12">
                <Zap size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Aucune instruction</p>
                <p className="text-gray-500">Les instructions apparaîtront ici une fois créées</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <Activity size={20} className="text-green-400" />
                  <span className="text-lg font-semibold text-white">Taux de Réussite</span>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {instructions.length > 0 
                    ? Math.round((instructions.filter(i => i.status === 'completed').length / instructions.length) * 100)
                    : 0}%
                </div>
                <div className="text-gray-400 text-sm">
                  {instructions.filter(i => i.status === 'completed').length} / {instructions.length} instructions
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock size={20} className="text-yellow-400" />
                  <span className="text-lg font-semibold text-white">Temps Moyen</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {instructions.length > 0 && instructions.some(i => i.actual_hours)
                    ? (instructions.reduce((sum, i) => sum + (i.actual_hours || 0), 0) / instructions.filter(i => i.actual_hours).length).toFixed(1)
                    : '0'}h
                </div>
                <div className="text-gray-400 text-sm">Par instruction</div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp size={20} className="text-blue-400" />
                  <span className="text-lg font-semibold text-white">Performance</span>
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {squads.length > 0 && squads.some(s => s.performance_score)
                    ? Math.round((squads.reduce((sum, s) => sum + (s.performance_score || 0), 0) / squads.filter(s => s.performance_score).length) * 100)
                    : 0}%
                </div>
                <div className="text-gray-400 text-sm">Score moyen squads</div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Distribution des Instructions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['pending', 'in_progress', 'completed', 'failed'].map(status => {
                  const count = instructions.filter(i => i.status === status).length;
                  const percentage = instructions.length > 0 ? (count / instructions.length) * 100 : 0;
                  return (
                    <div key={status} className="text-center">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: getStatusColor(status) }}
                      >
                        {count}
                      </div>
                      <div className="text-gray-400 text-sm capitalize mb-2">{status}</div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: getStatusColor(status),
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Assign Squad Modal */}
        {showAssignSquadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Assigner une Squad</h3>
                <button
                  onClick={() => setShowAssignSquadModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableSquads.map((squad) => (
                  <div
                    key={squad.id}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getStatusColor(squad.status) }}
                      />
                      <div>
                        <div className="text-white font-medium">{squad.name}</div>
                        <div className="text-gray-400 text-sm">{squad.domain} • {squad.agents_count} agents</div>
                      </div>
                    </div>
                    <button
                      onClick={() => assignSquadToProject(squad.id)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Assigner
                    </button>
                  </div>
                ))}
              </div>

              {availableSquads.length === 0 && (
                <div className="text-center py-8">
                  <Users size={48} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Aucune squad disponible</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}