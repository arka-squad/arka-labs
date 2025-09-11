'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Settings, Plus, X, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { COLOR } from '../../../../apps/console/src/ui/tokens';

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

  useEffect(() => {
    fetchSquadDetail();
  }, [params.id]);

  const fetchSquadDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/squads/${params.id}`, {
        headers: {
          'X-Trace-Id': `trace-${Date.now()}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Squad not found');
        }
        throw new Error('Failed to fetch squad details');
      }
      
      const data = await response.json();
      setSquad(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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

  if (loading) {
    return (
      <div style={{ background: COLOR.body }} className="min-h-screen text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading squad details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !squad) {
    return (
      <div style={{ background: COLOR.body }} className="min-h-screen text-white p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft size={16} />
            <span>Back to Squads</span>
          </button>
          
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-8 text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Squad</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: COLOR.body }} className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              <span>Back to Squads</span>
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{squad.name}</h1>
                <div
                  className="w-3 h-3 rounded-full"
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
              </div>
              <p className="text-gray-400">{squad.slug}</p>
              {squad.mission && (
                <p className="text-gray-300 mt-2 max-w-2xl">{squad.mission}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Instructions</span>
              <Zap size={16} className="text-blue-400" />
            </div>
            <div className="text-2xl font-bold">{squad.performance.instructions_total}</div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completed</span>
              <CheckCircle size={16} className="text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">{squad.performance.instructions_completed}</div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Success Rate</span>
              <div className="text-green-400">%</div>
            </div>
            <div className="text-2xl font-bold">
              {(squad.performance.success_rate * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Time</span>
              <Clock size={16} className="text-yellow-400" />
            </div>
            <div className="text-2xl font-bold">
              {squad.performance.avg_completion_time_hours > 0 
                ? `${squad.performance.avg_completion_time_hours.toFixed(1)}h` 
                : '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Members Section */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Users size={20} />
                <span>Members ({squad.members.length})</span>
              </h2>
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm"
              >
                <Plus size={14} />
                <span>Add Member</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {squad.members.map((member) => (
                <div
                  key={member.agent_id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getRoleIcon(member.role)}</span>
                    <div>
                      <div className="font-medium">{member.agent_name}</div>
                      <div className="text-sm text-gray-400 capitalize">{member.role}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex flex-wrap gap-1 justify-end mb-1">
                      {member.specializations.slice(0, 2).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {member.specializations.length > 2 && (
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                          +{member.specializations.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {squad.members.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No members yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Projects & Instructions */}
          <div className="space-y-6">
            {/* Attached Projects */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Attached Projects ({squad.attached_projects.length})</h2>
              
              <div className="space-y-3">
                {squad.attached_projects.map((project) => (
                  <div
                    key={project.project_id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{project.project_name}</div>
                      <div className="text-sm text-gray-400">
                        Project #{project.project_id} • {project.project_status}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(project.attached_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {squad.attached_projects.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    <p>No projects attached</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Instructions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Instructions</h2>
              
              <div className="space-y-3">
                {squad.recent_instructions.map((instruction) => (
                  <div
                    key={instruction.id}
                    className="p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getStatusColor(instruction.status) }}
                        />
                        <span className="text-sm font-medium capitalize">
                          {instruction.status}
                        </span>
                        {instruction.priority !== 'normal' && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            instruction.priority === 'urgent' ? 'bg-red-900/30 text-red-300' :
                            instruction.priority === 'high' ? 'bg-orange-900/30 text-orange-300' :
                            'bg-blue-900/30 text-blue-300'
                          }`}>
                            {instruction.priority}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(instruction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">{instruction.content}</p>
                    
                    {instruction.project_name && (
                      <div className="text-xs text-blue-400">
                        Project: {instruction.project_name}
                      </div>
                    )}
                  </div>
                ))}
                
                {squad.recent_instructions.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    <p>No recent instructions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}