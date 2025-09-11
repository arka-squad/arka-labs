'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Bot, Settings, Activity, Trash2, Copy, Pause, Play, Archive, Layers, Info } from 'lucide-react';
import Link from 'next/link';

interface Agent {
  id: number;
  name: string;
  role: string;
  domaine: string;
  status: 'active' | 'paused' | 'archived';
  project_id?: number;
  client_id?: number;
  template_id?: number;
  parent_agent_id?: number;
  configuration: any;
  wake_prompt: string;
  performance_metrics?: any;
  created_at: string;
  updated_at: string;
  created_by: string;
  project_name?: string;
  client_name?: string;
  template_name?: string;
}

interface ContextLevel {
  level: string;
  entity_id: string;
  configuration: any;
}

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [contexts, setContexts] = useState<ContextLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  
  const [formData, setFormData] = useState({
    name: '',
    wake_prompt: '',
    configuration: {
      temperature: 0.7,
      max_tokens: 2000,
      response_format: 'text',
      custom_instructions: ''
    },
    status: 'active' as const
  });

  useEffect(() => {
    fetchAgent();
    fetchContextHierarchy();
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAgent(data);
        setFormData({
          name: data.name,
          wake_prompt: data.wake_prompt || '',
          configuration: data.configuration || {},
          status: data.status
        });
      } else if (res.status === 404) {
        router.push('/cockpit/admin/agents');
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContextHierarchy = async () => {
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/context`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setContexts(data.contexts || []);
      }
    } catch (error) {
      console.error('Error fetching context:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchAgent();
        alert('Agent mis à jour avec succès');
      } else {
        const error = await res.json();
        alert(error.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'paused' | 'archived') => {
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (res.ok) {
        await fetchAgent();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${agent?.name} (Copie)` }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/cockpit/admin/agents/${data.id}`);
      }
    } catch (error) {
      console.error('Error duplicating agent:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;
    
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        router.push('/cockpit/admin/agents');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agent) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/cockpit/admin/agents"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                    {agent.status === 'active' ? 'Actif' : agent.status === 'paused' ? 'En pause' : 'Archivé'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {agent.role} • {agent.domaine} • Créé le {new Date(agent.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {agent.status === 'active' ? (
                <button
                  onClick={() => handleStatusChange('paused')}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              ) : agent.status === 'paused' ? (
                <button
                  onClick={() => handleStatusChange('active')}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Activer
                </button>
              ) : null}
              
              <button
                onClick={handleDuplicate}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Dupliquer
              </button>
              
              {agent.status !== 'archived' && (
                <button
                  onClick={() => handleStatusChange('archived')}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Archiver
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['config', 'context', 'metrics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'config' && 'Configuration'}
                {tab === 'context' && 'Contexte'}
                {tab === 'metrics' && 'Métriques'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'config' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration de l&apos;agent
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;agent
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions (Wake Prompt)
                  </label>
                  <textarea
                    value={formData.wake_prompt}
                    onChange={(e) => setFormData({...formData, wake_prompt: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Température
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.configuration.temperature || 0.7}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuration: {
                          ...formData.configuration,
                          temperature: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tokens maximum
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="8000"
                      value={formData.configuration.max_tokens || 2000}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuration: {
                          ...formData.configuration,
                          max_tokens: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'context' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Hiérarchie de contexte
              </h2>

              <div className="space-y-4">
                {contexts.map((ctx, idx) => (
                  <div key={idx} className={`pl-${idx * 4} border-l-2 border-gray-200 ml-1`}>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{ctx.level.charAt(0).toUpperCase() + ctx.level.slice(1)}</h3>
                        <span className="text-sm text-gray-500">ID: {ctx.entity_id}</span>
                      </div>
                      <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(ctx.configuration, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Configuration effective</p>
                    <p>La configuration finale de l&apos;agent combine tous les niveaux de contexte, du plus général au plus spécifique.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Métriques de performance
              </h2>

              {agent.performance_metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Tâches complétées</p>
                    <p className="text-2xl font-bold">{agent.performance_metrics.tasks_completed || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Taux de succès</p>
                    <p className="text-2xl font-bold">{agent.performance_metrics.success_rate || 0}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Temps de réponse moyen</p>
                    <p className="text-2xl font-bold">{agent.performance_metrics.avg_response_time || 0}s</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune métrique disponible pour le moment</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}