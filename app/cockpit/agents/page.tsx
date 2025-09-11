'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Search, Filter, ArrowRight, Settings, Zap, Star, Copy, Play } from 'lucide-react';
import ResponsiveWrapper from '../components/ResponsiveWrapper';

interface Agent {
  id: string;
  name: string;
  role: string;
  domaine: 'RH' | 'Tech' | 'Marketing' | 'Finance' | 'Ops' | 'General';
  version: string;
  description?: string;
  tags: string[];
  is_template: boolean;
  original_agent_id?: string;
  performance_score?: number;
  projets_actifs: number;
  projets_total: number;
  status: 'active' | 'inactive';
  created_at: string;
  created_by: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [domaineFilter, setDomaineFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [versionFilter, setVersionFilter] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAgents();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, domaineFilter, typeFilter, versionFilter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (domaineFilter) params.append('domaine', domaineFilter);
      if (typeFilter) params.append('is_template', typeFilter === 'templates' ? 'true' : 'false');
      if (versionFilter) params.append('version_filter', versionFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/backoffice/agents?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch agents');
      
      const data = await response.json();
      setAgents(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getDomaineColor = (domaine: string) => {
    switch (domaine) {
      case 'RH': return '#10B981';
      case 'Tech': return '#3B82F6';
      case 'Marketing': return '#F59E0B';
      case 'Finance': return '#8B5CF6';
      case 'Ops': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPerformanceColor = (score?: number) => {
    if (!score) return '#6B7280';
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const handleDuplicate = async (agentId: string, agentName: string) => {
    try {
      const newName = prompt(`Nom du nouvel agent (basé sur ${agentName}):`, `${agentName} v2`);
      if (!newName) return;

      const response = await fetch(`/api/backoffice/agents/${agentId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json',
          'X-Trace-Id': `trace-${Date.now()}`
        },
        body: JSON.stringify({
          new_name: newName,
          version: '2.0',
          changes: {
            improvements: 'Version améliorée créée depuis l\'interface'
          }
        })
      });

      if (response.ok) {
        fetchAgents(); // Recharger la liste
        alert('Agent dupliqué avec succès !');
      } else {
        throw new Error('Échec de la duplication');
      }
    } catch (err) {
      alert('Erreur lors de la duplication : ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDomaine = !domaineFilter || agent.domaine === domaineFilter;
    const matchesType = !typeFilter || 
                       (typeFilter === 'templates' && agent.is_template) ||
                       (typeFilter === 'instances' && !agent.is_template);
    const matchesVersion = !versionFilter ||
                          (versionFilter === 'latest' && !agent.original_agent_id);
    
    return matchesSearch && matchesDomaine && matchesType && matchesVersion;
  });

  if (loading) {
    return (
      <ResponsiveWrapper 
        currentPath="/cockpit/agents"
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
        innerClassName="max-w-none mx-0"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement des agents...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper 
      currentPath="/cockpit/agents"
      contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
      innerClassName="max-w-none mx-0"
    >
        {/* Header */}
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
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">🤖 Nos Agents IA</h1>
                <p className="text-gray-400 text-sm sm:text-base">Bibliothèque d&apos;agents spécialisés et leurs performances</p>
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
              <button 
                onClick={() => window.location.href = '/cockpit/agents/new'}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} />
                <span>Créer Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, description, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400 flex-shrink-0" />
              <select
                value={domaineFilter}
                onChange={(e) => setDomaineFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Tous domaines</option>
                <option value="RH">RH</option>
                <option value="Tech">Tech</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Ops">Ops</option>
              </select>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tous types</option>
              <option value="templates">Templates uniquement</option>
              <option value="instances">Instances uniquement</option>
            </select>
            
            <select
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes versions</option>
              <option value="latest">Dernières versions</option>
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setDomaineFilter('');
                setTypeFilter('');
                setVersionFilter('');
              }}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-2">
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
            {filteredAgents.length} résultat{filteredAgents.length !== 1 ? 's' : ''} 
            {searchTerm && ` pour "${searchTerm}"`}
          </div>
        )}

        {/* Grille des Agents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer transform hover:scale-[1.02]"
              onClick={() => window.location.href = `/cockpit/agents/${agent.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: getDomaineColor(agent.domaine) + '20',
                      color: getDomaineColor(agent.domaine)
                    }}
                  >
                    {agent.domaine}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300">
                    v{agent.version}
                  </span>
                  {agent.is_template && (
                    <span className="px-2 py-1 rounded text-xs bg-purple-900/30 text-purple-300">
                      Template
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(agent.id, agent.name);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Dupliquer"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                    title="Tester"
                  >
                    <Play size={14} />
                  </button>
                  <ArrowRight size={16} className="text-gray-400 hover:text-blue-400" />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-white">{agent.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{agent.role}</p>

              {agent.description && (
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {agent.description}
                </p>
              )}

              {agent.performance_score !== undefined && (
                <div className="flex items-center space-x-2 mb-3">
                  <Star size={14} className="text-yellow-400" />
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`w-3 h-3 rounded-full ${
                            star <= Math.floor(agent.performance_score! / 20) + 1
                              ? 'bg-yellow-400'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: getPerformanceColor(agent.performance_score) }}
                    >
                      {agent.performance_score}/100
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Zap size={14} className="text-green-400" />
                    <span className="text-green-400 font-medium">{agent.projets_actifs}</span>
                    <span className="text-gray-500 text-sm">actifs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-medium">{agent.projets_total}</span>
                    <span className="text-gray-500 text-sm">total</span>
                  </div>
                </div>
              </div>

              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-500 text-xs rounded">
                      +{agent.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    {agent.original_agent_id ? 'Basé sur original' : 'Agent original'}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    Voir usage →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Zap size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'Aucun agent trouvé' : 'Aucun agent'}
            </p>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Essayez avec d\'autres termes de recherche' 
                : 'Créez votre premier agent pour commencer'}
            </p>
            {!searchTerm && (
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
                Créer mon premier agent
              </button>
            )}
          </div>
        )}

        {/* Stats rapides */}
        {agents.length > 0 && (
          <div className="mt-8 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {agents.filter(a => a.is_template).length}
              </div>
              <div className="text-gray-400 text-sm">Templates</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {agents.filter(a => !a.is_template).length}
              </div>
              <div className="text-gray-400 text-sm">Instances</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {agents.reduce((sum, a) => sum + a.projets_actifs, 0)}
              </div>
              <div className="text-gray-400 text-sm">Projets Actifs</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {Math.round(agents.reduce((sum, a) => sum + (a.performance_score || 0), 0) / agents.length) || 0}
              </div>
              <div className="text-gray-400 text-sm">Score Moyen</div>
            </div>
          </div>
        )}

        {/* Action rapide */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                ⚡ Optimisez vos agents
              </h3>
              <p className="text-gray-400">
                Créez des variations d&apos;agents performants et assignez-les à vos projets clients
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/cockpit/projects'}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Voir assignations →
            </button>
          </div>
        </div>
    </ResponsiveWrapper>
  );
}