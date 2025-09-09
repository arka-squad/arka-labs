'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Settings, AlertCircle, Calendar, Briefcase } from 'lucide-react';
import { COLOR } from '../../../apps/console/src/ui/tokens';

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

  if (loading) {
    return (
      <div style={{ background: COLOR.body }} className="min-h-screen text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: COLOR.body }} className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Management</h1>
            <p className="text-gray-400">Manage projects and their squad assignments</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/admin/squads'}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              <Users size={16} />
              <span>Manage Squads</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              <Plus size={16} />
              <span>Create Project</span>
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => window.location.href = `/admin/projects/${project.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
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
                      {project.metadata.priority} priority
                    </span>
                  )}
                </div>
                <Settings size={16} className="text-gray-400" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              <p className="text-gray-400 text-sm mb-4">Project #{project.id}</p>

              {project.metadata?.client && (
                <div className="flex items-center space-x-2 text-sm text-blue-400 mb-4">
                  <Briefcase size={14} />
                  <span>{project.metadata.client}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <Users size={14} className="text-green-400" />
                  <span className="text-green-400 font-medium">{project.squads_count}</span>
                  <span className="text-gray-500">squads</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-500">
                  <Calendar size={14} />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  Created by {project.created_by || 'System'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <Briefcase size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No projects found</p>
            <p className="text-gray-500">Create your first project to get started</p>
          </div>
        )}

        {/* Quick Stats */}
        {projects.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {projects.filter(p => p.status === 'active').length}
              </div>
              <div className="text-gray-400 text-sm">Active Projects</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {projects.filter(p => p.status === 'disabled').length}
              </div>
              <div className="text-gray-400 text-sm">Disabled Projects</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {projects.reduce((sum, p) => sum + p.squads_count, 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Squads</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {projects.length}
              </div>
              <div className="text-gray-400 text-sm">Total Projects</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}