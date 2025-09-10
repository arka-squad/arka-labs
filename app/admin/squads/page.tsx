'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Settings, Zap, AlertCircle } from 'lucide-react';
import { COLOR } from '../../../apps/console/src/ui/tokens';

interface Squad {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: 'active' | 'inactive' | 'archived';
  members_count: number;
  projects_count: number;
  avg_completion_hours: number;
  created_by: string;
  created_at: string;
}

interface CreateSquadData {
  name: string;
  mission: string;
  domain: 'RH' | 'Tech' | 'Marketing' | 'Finance' | 'Ops';
}

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState({ domain: '', status: '' });

  useEffect(() => {
    fetchSquads();
  }, [filter]);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.domain) params.append('domain', filter.domain);
      if (filter.status) params.append('status', filter.status);
      
      const response = await fetch(`/api/admin/squads?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch squads');
      
      const data = await response.json();
      setSquads(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createSquad = async (squadData: CreateSquadData) => {
    try {
      const response = await fetch('/api/admin/squads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`
        },
        body: JSON.stringify(squadData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create squad');
      }

      const newSquad = await response.json();
      setSquads(prev => [newSquad, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'archived': return '#6B7280';
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

  if (loading && squads.length === 0) {
    return (
      <div style={{ background: COLOR.body }} className="min-h-screen text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading squads...</p>
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
            <h1 className="text-3xl font-bold mb-2">Squad Management</h1>
            <p className="text-gray-400">Manage your AI agent squads and their assignments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>Create Squad</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select
            value={filter.domain}
            onChange={(e) => setFilter(prev => ({ ...prev, domain: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="">All Domains</option>
            <option value="RH">RH</option>
            <option value="Tech">Tech</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Ops">Ops</option>
          </select>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
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

        {/* Squads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {squads.map((squad) => (
            <div
              key={squad.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => window.location.href = `/admin/squads/${squad.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(squad.status) }}
                  />
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: getDomainColor(squad.domain) + '20', color: getDomainColor(squad.domain) }}
                  >
                    {squad.domain}
                  </span>
                </div>
                <Settings size={16} className="text-gray-400" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{squad.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{squad.slug}</p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center space-x-1 text-blue-400">
                    <Users size={14} />
                    <span className="text-lg font-bold">{squad.members_count}</span>
                  </div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1 text-green-400">
                    <Zap size={14} />
                    <span className="text-lg font-bold">{squad.projects_count}</span>
                  </div>
                  <div className="text-xs text-gray-500">Projects</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">
                    {squad.avg_completion_hours > 0 
                      ? `${squad.avg_completion_hours.toFixed(1)}h` 
                      : '—'}
                  </div>
                  <div className="text-xs text-gray-500">Avg Time</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  Created by {squad.created_by} • {new Date(squad.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {squads.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No squads found</p>
            <p className="text-gray-500">Create your first squad to get started</p>
          </div>
        )}
      </div>

      {/* Create Squad Modal */}
      {showCreateModal && (
        <CreateSquadModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createSquad}
        />
      )}
    </div>
  );
}

function CreateSquadModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: CreateSquadData) => Promise<void>;
}) {
  const [formData, setFormData] = useState<CreateSquadData>({
    name: '',
    mission: '',
    domain: 'Tech'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.length < 3) return;
    
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Squad</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Squad Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Squad RH Alpha"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mission (Optional)</label>
            <textarea
              value={formData.mission}
              onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              placeholder="Describe the squad's mission..."
              maxLength={800}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Domain</label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value as any }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tech">Tech</option>
              <option value="RH">RH</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Ops">Ops</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              disabled={submitting || formData.name.length < 3}
            >
              {submitting ? 'Creating...' : 'Create Squad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}