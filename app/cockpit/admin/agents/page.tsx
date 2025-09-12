'use client';

import { useState, useEffect } from 'react';
import { Plus, Bot, Search, Filter, Zap, Users, Target, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AgentTemplate {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
}

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
  configuration?: any;
  performance_metrics?: any;
  created_at: string;
  created_by: string;
  project_name?: string;
  client_name?: string;
  template_name?: string;
}

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchAgents();
    fetchTemplates();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/agents/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = searchTerm === '' || 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === '' || agent.domaine === selectedDomain;
    const matchesStatus = selectedStatus === '' || agent.status === selectedStatus;
    return matchesSearch && matchesDomain && matchesStatus;
  });

  const domains = [...new Set(agents.map(a => a.domaine))].filter(Boolean);
  const statuses = ['active', 'paused', 'archived'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'RH': return <Users className="w-4 h-4" />;
      case 'Finance': return <Target className="w-4 h-4" />;
      case 'Marketing': return <Zap className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestion des Agents</h1>
              <p className="text-sm text-gray-300 mt-1">
                {agents.length} agents configurés • {templates.length} templates disponibles
              </p>
            </div>
            <Link
              href="/cockpit/admin/agents/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvel Agent
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les domaines</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'active' ? 'Actif' : status === 'paused' ? 'En pause' : 'Archivé'}
                </option>
              ))}
            </select>

            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              Plus de filtres
            </button>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Aucun agent trouvé</h3>
            <p className="text-gray-300 mb-4">
              {searchTerm || selectedDomain || selectedStatus
                ? 'Aucun agent ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier agent.'}
            </p>
            {!searchTerm && !selectedDomain && !selectedStatus && (
              <Link
                href="/cockpit/admin/agents/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Créer un agent
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => router.push(`/cockpit/admin/agents/${agent.id}`)}
                className="bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getDomainIcon(agent.domaine)}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{agent.name}</h3>
                      <p className="text-sm text-gray-300">{agent.role}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                    {agent.status === 'active' ? 'Actif' : agent.status === 'paused' ? 'En pause' : 'Archivé'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {agent.project_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{agent.project_name}</span>
                    </div>
                  )}
                  {agent.client_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{agent.client_name}</span>
                    </div>
                  )}
                  {agent.template_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Bot className="w-3 h-3" />
                      <span>Template: {agent.template_name}</span>
                    </div>
                  )}
                </div>

                {agent.performance_metrics && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-300">Tâches</p>
                        <p className="text-sm font-semibold">{agent.performance_metrics.tasks_completed || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">Succès</p>
                        <p className="text-sm font-semibold">{agent.performance_metrics.success_rate || 0}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">Temps moy.</p>
                        <p className="text-sm font-semibold">{agent.performance_metrics.avg_response_time || 0}s</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}