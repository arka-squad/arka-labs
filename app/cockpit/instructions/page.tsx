'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, Plus, Search, Filter, AlertCircle, Clock, CheckCircle, 
  XCircle, Play, Pause, RotateCcw, Users, Briefcase, ArrowRight,
  TrendingUp, Activity, Target, Calendar, Settings, Edit, Trash2
} from 'lucide-react';

interface Instruction {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  created_by: string;
  squad_id: number;
  squad_name: string;
  project_id?: number;
  project_name?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress_percentage?: number;
  metadata?: {
    urgency?: boolean;
    complexity?: 'simple' | 'medium' | 'complex';
    tags?: string[];
  };
}

interface Squad {
  id: number;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'archived';
}

interface Project {
  id: number;
  name: string;
  status: 'active' | 'disabled' | 'archived';
}

export default function InstructionsPage() {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [squadFilter, setSquadFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');

  const [newInstruction, setNewInstruction] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    squad_id: 0,
    project_id: 0,
    estimated_hours: 0
  });

  useEffect(() => {
    loadInstructions();
    loadSquads();
    loadProjects();
  }, []);

  const loadInstructions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/instructions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch instructions');
      
      const data = await response.json();
      setInstructions(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadSquads = async () => {
    try {
      const response = await fetch('/api/admin/squads?status=active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSquads(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load squads:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects?status=active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const createInstruction = async () => {
    try {
      const response = await fetch('/api/admin/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
          ...newInstruction,
          project_id: newInstruction.project_id || undefined
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewInstruction({
          title: '',
          description: '',
          priority: 'medium',
          squad_id: 0,
          project_id: 0,
          estimated_hours: 0
        });
        loadInstructions();
      } else {
        throw new Error('Failed to create instruction');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create instruction');
    }
  };

  const updateInstructionStatus = async (instructionId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/instructions/${instructionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadInstructions();
      } else {
        throw new Error('Failed to update instruction');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update instruction');
    }
  };

  const deleteInstruction = async (instructionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette instruction ?')) return;

    try {
      const response = await fetch(`/api/admin/instructions/${instructionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });

      if (response.ok) {
        loadInstructions();
      } else {
        throw new Error('Failed to delete instruction');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete instruction');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'failed': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return Play;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'cancelled': return Pause;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const filteredInstructions = instructions.filter(instruction => {
    const matchesSearch = instruction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instruction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instruction.squad_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instruction.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || instruction.status === statusFilter;
    const matchesPriority = !priorityFilter || instruction.priority === priorityFilter;
    const matchesSquad = !squadFilter || instruction.squad_id.toString() === squadFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSquad;
  });

  const stats = {
    total: instructions.length,
    pending: instructions.filter(i => i.status === 'pending').length,
    in_progress: instructions.filter(i => i.status === 'in_progress').length,
    completed: instructions.filter(i => i.status === 'completed').length,
    failed: instructions.filter(i => i.status === 'failed').length,
    success_rate: instructions.length > 0 ? 
      (instructions.filter(i => i.status === 'completed').length / instructions.length) * 100 : 0
  };

  if (loading) {
    return (
      <div className="console-theme min-h-screen text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement des instructions...</p>
          </div>
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
              onClick={() => window.location.href = '/cockpit/admin'}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              ← Dashboard
            </button>
            <div className="w-px h-6 bg-gray-600"></div>
            <div>
              <h1 className="text-3xl font-bold mb-2">⚡ Gestion Instructions</h1>
              <p className="text-gray-400">Pilotez les instructions et leurs exécutions</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setSelectedView('grid')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedView === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Grille
              </button>
              <button
                onClick={() => setSelectedView('list')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedView === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Liste
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Nouvelle Instruction</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-gray-400 text-xs">Total</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.pending}</div>
            <div className="text-gray-400 text-xs">En attente</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.in_progress}</div>
            <div className="text-gray-400 text-xs">En cours</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.completed}</div>
            <div className="text-gray-400 text-xs">Terminées</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.failed}</div>
            <div className="text-gray-400 text-xs">Échecs</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{Math.round(stats.success_rate)}%</div>
            <div className="text-gray-400 text-xs">Succès</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, description, squad ou projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
              >
                <option value="">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="failed">Échecs</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
            
            <select
              value={squadFilter}
              onChange={(e) => setSquadFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="">Toutes squads</option>
              {squads.map((squad) => (
                <option key={squad.id} value={squad.id}>
                  {squad.name}
                </option>
              ))}
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

        {/* Results count */}
        {searchTerm && (
          <div className="mb-4 text-gray-400 text-sm">
            {filteredInstructions.length} résultat{filteredInstructions.length !== 1 ? 's' : ''} 
            {searchTerm && ` pour "${searchTerm}"`}
          </div>
        )}

        {/* Instructions Display */}
        {selectedView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructions.map((instruction) => {
              const StatusIcon = getStatusIcon(instruction.status);
              return (
                <div
                  key={instruction.id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <StatusIcon 
                        size={16} 
                        style={{ color: getStatusColor(instruction.status) }}
                      />
                      <span 
                        className="text-sm font-medium capitalize"
                        style={{ color: getStatusColor(instruction.status) }}
                      >
                        {instruction.status}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: getPriorityColor(instruction.priority) + '20',
                          color: getPriorityColor(instruction.priority)
                        }}
                      >
                        {instruction.priority}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality
                        }}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteInstruction(instruction.id);
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{instruction.title}</h3>
                  {instruction.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{instruction.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users size={14} className="text-blue-400" />
                      <span className="text-blue-400">{instruction.squad_name}</span>
                    </div>
                    {instruction.project_name && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Briefcase size={14} className="text-green-400" />
                        <span className="text-green-400">{instruction.project_name}</span>
                      </div>
                    )}
                  </div>

                  {instruction.progress_percentage !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progression</span>
                        <span className="text-gray-300">{instruction.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${instruction.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar size={14} />
                      <span>{new Date(instruction.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    {instruction.estimated_hours && (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock size={14} />
                        <span>{instruction.estimated_hours}h</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">
                        Par {instruction.created_by?.split('@')[0] || 'System'}
                      </span>
                      {instruction.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateInstructionStatus(instruction.id, 'in_progress');
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          Démarrer →
                        </button>
                      )}
                      {instruction.status === 'in_progress' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateInstructionStatus(instruction.id, 'completed');
                          }}
                          className="text-green-400 hover:text-green-300 text-xs"
                        >
                          Terminer →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="divide-y divide-gray-700">
              {filteredInstructions.map((instruction) => {
                const StatusIcon = getStatusIcon(instruction.status);
                return (
                  <div key={instruction.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <StatusIcon 
                          size={16} 
                          style={{ color: getStatusColor(instruction.status) }}
                        />
                        <h3 className="text-lg font-semibold text-white">{instruction.title}</h3>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: getPriorityColor(instruction.priority) + '20',
                            color: getPriorityColor(instruction.priority)
                          }}
                        >
                          {instruction.priority}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-blue-400">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteInstruction(instruction.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {instruction.description && (
                      <p className="text-gray-400 text-sm mb-3">{instruction.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Users size={14} className="text-blue-400" />
                          <span>{instruction.squad_name}</span>
                        </div>
                        {instruction.project_name && (
                          <div className="flex items-center space-x-2">
                            <Briefcase size={14} className="text-green-400" />
                            <span>{instruction.project_name}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} />
                          <span>{new Date(instruction.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {instruction.estimated_hours && (
                          <div className="flex items-center space-x-2">
                            <Clock size={14} />
                            <span>{instruction.estimated_hours}h estimées</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {instruction.progress_percentage !== undefined && (
                          <span>{instruction.progress_percentage}% terminé</span>
                        )}
                        {instruction.status === 'pending' && (
                          <button
                            onClick={() => updateInstructionStatus(instruction.id, 'in_progress')}
                            className="text-blue-400 hover:text-blue-300 text-xs bg-blue-900/20 px-2 py-1 rounded"
                          >
                            Démarrer
                          </button>
                        )}
                        {instruction.status === 'in_progress' && (
                          <button
                            onClick={() => updateInstructionStatus(instruction.id, 'completed')}
                            className="text-green-400 hover:text-green-300 text-xs bg-green-900/20 px-2 py-1 rounded"
                          >
                            Terminer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredInstructions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Zap size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'Aucune instruction trouvée' : 'Aucune instruction'}
            </p>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Essayez avec d\'autres termes de recherche' 
                : 'Créez votre première instruction pour commencer'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
              >
                Créer première instruction
              </button>
            )}
          </div>
        )}

        {/* Create Instruction Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Nouvelle Instruction</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Titre *</label>
                  <input
                    type="text"
                    value={newInstruction.title}
                    onChange={(e) => setNewInstruction({...newInstruction, title: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre de l'instruction"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Description</label>
                  <textarea
                    value={newInstruction.description}
                    onChange={(e) => setNewInstruction({...newInstruction, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Description détaillée"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Priorité *</label>
                    <select
                      value={newInstruction.priority}
                      onChange={(e) => setNewInstruction({...newInstruction, priority: e.target.value as 'high' | 'medium' | 'low'})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Squad *</label>
                    <select
                      value={newInstruction.squad_id}
                      onChange={(e) => setNewInstruction({...newInstruction, squad_id: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Sélectionner une squad</option>
                      {squads.map((squad) => (
                        <option key={squad.id} value={squad.id}>
                          {squad.name} ({squad.domain})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Projet (optionnel)</label>
                    <select
                      value={newInstruction.project_id}
                      onChange={(e) => setNewInstruction({...newInstruction, project_id: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Aucun projet</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Temps estimé (heures)</label>
                    <input
                      type="number"
                      value={newInstruction.estimated_hours}
                      onChange={(e) => setNewInstruction({...newInstruction, estimated_hours: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={createInstruction}
                  disabled={!newInstruction.title || !newInstruction.squad_id}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition-colors"
                >
                  Créer Instruction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}