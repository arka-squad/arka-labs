'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Settings, Plus, X, AlertCircle, CheckCircle, Clock, 
  Zap, TrendingUp, Activity, Send, UserPlus, Trash2, Edit
} from 'lucide-react';
import ResponsiveWrapper from '../../components/ResponsiveWrapper';

interface SquadDetail {
  id: string;
  name: string;
  slug: string;
  mission: string;
  domain: string;
  status: 'active' | 'inactive' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  members: SquadMember[];
  attached_projects: AttachedProject[];
  recent_instructions: RecentInstruction[];
  performance: {
    instructions_completed: number;
    instructions_total: number;
    avg_completion_time_hours: number;
    success_rate: number;
  };
}

interface SquadMember {
  agent_id: string;
  agent_name: string;
  role: 'lead' | 'specialist' | 'contributor';
  specializations: string[];
  status: string;
  joined_at: string;
}

interface AttachedProject {
  project_id: number;
  project_name: string;
  project_status: string;
  attached_at: string;
}

interface RecentInstruction {
  id: string;
  content: string;
  status: string;
  priority: string;
  project_name?: string;
  created_at: string;
  completed_at?: string;
}

export default function SquadDetailPage({ params }: { params: { id: string } }) {
  const [squad, setSquad] = useState<SquadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateInstruction, setShowCreateInstruction] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'projects' | 'instructions' | 'analytics'>('overview');

  useEffect(() => {
    fetchSquadDetail();
  }, [params.id]);

  const fetchSquadDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/squads/${params.id}`, {
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Squad non trouvée');
        }
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      setSquad(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'archived': return '#6B7280';
      case 'completed': return '#10B981';
      case 'processing': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDomainColor = (domain: string) => {
    const colors = {
      'RH': '#E0026D',
      'Tech': '#3B82F6', 
      'Marketing': '#F59E0B',
      'Finance': '#10B981',
      'Ops': '#8B5CF6'
    };
    return colors[domain as keyof typeof colors] || '#6B7280';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'lead': return '👑';
      case 'specialist': return '🎯';
      case 'contributor': return '⚡';
      default: return '👤';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'normal': return '#6B7280';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <ResponsiveWrapper 
        currentPath="/cockpit/admin/squads"
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
        innerClassName="max-w-none mx-0"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement de la squad...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  if (error || !squad) {
    return (
      <ResponsiveWrapper 
        currentPath="/cockpit/admin/squads"
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
        innerClassName="max-w-none mx-0"
      >
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Retour aux squads</span>
        </button>
        
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-8 text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper 
      currentPath="/cockpit/admin/squads"
      contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
      innerClassName="max-w-none mx-0"
    >
        {/* Header amélioré */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/cockpit/admin/squads'}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Squads</span>
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{squad.name}</h1>
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: getStatusColor(squad.status) }}
                />
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: getDomainColor(squad.domain) + '20', 
                    color: getDomainColor(squad.domain) 
                  }}
                >
                  {squad.domain}
                </span>
                <span className="text-gray-400 text-sm capitalize">
                  • {squad.status}
                </span>
              </div>
              <p className="text-gray-400 font-mono text-sm">{squad.slug}</p>
              {squad.mission && (
                <p className="text-gray-300 mt-2 max-w-2xl">{squad.mission}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowCreateInstruction(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Send size={16} />
              <span>Instruction</span>
            </button>
            <button 
              onClick={() => setShowAddMember(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <UserPlus size={16} />
              <span>Ajouter</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
              <Settings size={16} />
              <span>Config</span>
            </button>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: Activity },
            { key: 'members', label: `Agents (${squad.members.length})`, icon: Users },
            { key: 'projects', label: `Projets (${squad.attached_projects.length})`, icon: Zap },
            { key: 'instructions', label: `Instructions (${squad.recent_instructions.length})`, icon: Send },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPIs Performance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Instructions Total</span>
                  <Zap size={16} className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold">{squad.performance.instructions_total}</div>
                <div className="text-xs text-gray-500 mt-1">Toutes priorités</div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Complétées</span>
                  <CheckCircle size={16} className="text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400">{squad.performance.instructions_completed}</div>
                <div className="text-xs text-gray-500 mt-1">
                  +{squad.performance.instructions_completed > 0 ? 
                    Math.floor((squad.performance.instructions_completed / squad.performance.instructions_total) * 100) : 0}% ce mois
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Taux de Succès</span>
                  <TrendingUp size={16} className="text-green-400" />
                </div>
                <div className="text-3xl font-bold">
                  {(squad.performance.success_rate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-green-400 mt-1">Excellent</div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Temps Moyen</span>
                  <Clock size={16} className="text-yellow-400" />
                </div>
                <div className="text-3xl font-bold">
                  {squad.performance.avg_completion_time_hours > 0 
                    ? `${squad.performance.avg_completion_time_hours.toFixed(1)}h` 
                    : '—'}
                </div>
                <div className="text-xs text-yellow-400 mt-1">Par instruction</div>
              </div>
            </div>

            {/* Vue d'ensemble rapide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Users size={18} />
                  <span>Équipe Active</span>
                </h3>
                <div className="space-y-3">
                  {squad.members.slice(0, 3).map((member) => (
                    <div key={member.agent_id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-lg">{getRoleIcon(member.role)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{member.agent_name}</div>
                        <div className="text-xs text-gray-400 capitalize">{member.role}</div>
                      </div>
                      <div className="flex space-x-1">
                        {member.specializations.slice(0, 2).map((spec) => (
                          <span key={spec} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {squad.members.length > 3 && (
                    <div className="text-center">
                      <button 
                        onClick={() => setActiveTab('members')}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Voir tous les {squad.members.length} agents →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Activity size={18} />
                  <span>Activité Récente</span>
                </h3>
                <div className="space-y-3">
                  {squad.recent_instructions.slice(0, 4).map((instruction) => (
                    <div key={instruction.id} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <div
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(instruction.status) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-300 truncate">
                          {instruction.content}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 capitalize">
                            {instruction.status}
                          </span>
                          {instruction.project_name && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-xs text-blue-400">
                                {instruction.project_name}
                              </span>
                            </>
                          )}
                          <span className="text-gray-600">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(instruction.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {squad.recent_instructions.length > 4 && (
                    <div className="text-center">
                      <button 
                        onClick={() => setActiveTab('instructions')}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Voir toutes les instructions →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Users size={20} />
                <span>Agents de la Squad ({squad.members.length})</span>
              </h2>
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Plus size={14} />
                <span>Ajouter Agent</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {squad.members.map((member) => (
                <div
                  key={member.agent_id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getRoleIcon(member.role)}</div>
                    <div>
                      <div className="font-medium text-white">{member.agent_name}</div>
                      <div className="text-sm text-gray-400 capitalize">{member.role}</div>
                      <div className="text-xs text-gray-500">
                        Rejoint le {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex flex-wrap gap-1 justify-end mb-2">
                      {member.specializations.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {member.specializations.length > 3 && (
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                          +{member.specializations.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-blue-400 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button className="text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {squad.members.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Aucun agent dans cette squad</p>
                <p className="mb-4">Ajoutez des agents pour commencer</p>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Ajouter le premier agent
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Zap size={20} />
                <span>Projets Assignés ({squad.attached_projects.length})</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {squad.attached_projects.map((project) => (
                <div
                  key={project.project_id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
                >
                  <div>
                    <div className="font-medium text-white">{project.project_name}</div>
                    <div className="text-sm text-gray-400">
                      Projet #{project.project_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Attaché le {new Date(project.attached_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: getStatusColor(project.project_status) + '20',
                        color: getStatusColor(project.project_status)
                      }}
                    >
                      {project.project_status}
                    </span>
                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {squad.attached_projects.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Zap size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Aucun projet assigné</p>
                <p>Cette squad n&apos;est pas encore assignée à des projets</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Send size={20} />
                <span>Historique Instructions</span>
              </h2>
              <button
                onClick={() => setShowCreateInstruction(true)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Plus size={14} />
                <span>Nouvelle Instruction</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {squad.recent_instructions.map((instruction) => (
                <div
                  key={instruction.id}
                  className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getStatusColor(instruction.status) }}
                      />
                      <div>
                        <span className="text-sm font-medium capitalize text-white">
                          {instruction.status}
                        </span>
                        {instruction.priority !== 'normal' && (
                          <span 
                            className={`ml-2 text-xs px-2 py-1 rounded font-medium`}
                            style={{ 
                              backgroundColor: getPriorityColor(instruction.priority) + '20',
                              color: getPriorityColor(instruction.priority)
                            }}
                          >
                            {instruction.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(instruction.created_at).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(instruction.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3 leading-relaxed">{instruction.content}</p>
                  
                  <div className="flex items-center justify-between">
                    {instruction.project_name && (
                      <div className="text-xs text-blue-400">
                        📋 {instruction.project_name}
                      </div>
                    )}
                    {instruction.completed_at && (
                      <div className="text-xs text-green-400">
                        ✅ Complétée le {new Date(instruction.completed_at).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {squad.recent_instructions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Send size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Aucune instruction</p>
                <p className="mb-4">Créez la première instruction pour cette squad</p>
                <button
                  onClick={() => setShowCreateInstruction(true)}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Créer une instruction
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>Analytics & Performance</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Répartition par Statut</h3>
                <div className="space-y-3">
                  {[
                    { status: 'completed', count: squad.performance.instructions_completed, color: '#10B981' },
                    { status: 'processing', count: Math.floor(squad.performance.instructions_total * 0.1), color: '#3B82F6' },
                    { status: 'pending', count: Math.floor(squad.performance.instructions_total * 0.05), color: '#F59E0B' },
                    { status: 'failed', count: squad.performance.instructions_total - squad.performance.instructions_completed - Math.floor(squad.performance.instructions_total * 0.15), color: '#EF4444' }
                  ].map(({ status, count, color }) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="capitalize text-gray-300">{status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{count}</span>
                        <span className="text-xs text-gray-500">
                          ({squad.performance.instructions_total > 0 
                            ? ((count / squad.performance.instructions_total) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Métriques Clés</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Temps moyen de completion</span>
                    <span className="text-yellow-400 font-medium">
                      {squad.performance.avg_completion_time_hours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Taux de succès</span>
                    <span className="text-green-400 font-medium">
                      {(squad.performance.success_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Instructions ce mois</span>
                    <span className="text-blue-400 font-medium">
                      {squad.performance.instructions_total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Agents actifs</span>
                    <span className="text-purple-400 font-medium">
                      {squad.members.filter(m => m.status === 'active').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showAddMember && (
          <AddMemberModal
            squadId={squad.id}
            onClose={() => setShowAddMember(false)}
            onSuccess={() => {
              setShowAddMember(false);
              fetchSquadDetail();
            }}
          />
        )}

        {showCreateInstruction && (
          <CreateInstructionModal
            squadId={squad.id}
            projects={squad.attached_projects}
            onClose={() => setShowCreateInstruction(false)}
            onSuccess={() => {
              setShowCreateInstruction(false);
              fetchSquadDetail();
            }}
          />
        )}
    </ResponsiveWrapper>
  );
}

// Composant Modal pour ajouter un membre (simplifié)
function AddMemberModal({ squadId, onClose, onSuccess }: {
  squadId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white">Ajouter un Agent</h2>
        <p className="text-gray-400 mb-4">
          Fonctionnalité en cours de développement
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant Modal pour créer une instruction (simplifié)
function CreateInstructionModal({ squadId, projects, onClose, onSuccess }: {
  squadId: string;
  projects: AttachedProject[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white">Créer une Instruction</h2>
        <p className="text-gray-400 mb-4">
          Interface de création d&apos;instruction en cours de développement
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}