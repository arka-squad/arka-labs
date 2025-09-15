'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Settings, Zap, AlertCircle, Filter, Search } from 'lucide-react';
import ResponsiveWrapper from '../../components/ResponsiveWrapper';
import AdminNavigation from '../components/AdminNavigation';
import AdminProtection from '../components/AdminProtection';

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
  const [searchTerm, setSearchTerm] = useState('');

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
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
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

  const filteredSquads = squads.filter(squad =>
    squad.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    squad.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && squads.length === 0) {
    return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
            <ResponsiveWrapper 
        currentPath="/cockpit/admin/squads"
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
        innerClassName="max-w-none mx-0"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement des squads...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    </AdminProtection>
    );
  }

  return (
    <ResponsiveWrapper 
      currentPath="/cockpit/admin/squads"
      contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
      innerClassName="max-w-none mx-0"
    >
        {/* Admin Navigation */}
        <AdminNavigation />
        
        {/* Action Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🛡️ Gestion des Squads</h1>
            <p className="text-gray-400">Orchestrez vos équipes d&apos;agents IA spécialisés</p>
          </div>
          <button
            onClick={() => window.location.href = '/cockpit/admin/squads/new'}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            <span>Créer Squad</span>
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou domaine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filter.domain}
                onChange={(e) => setFilter(prev => ({ ...prev, domain: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
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
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="">Tous statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
              <option value="archived">Archivées</option>
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
            {filteredSquads.length} résultat{filteredSquads.length !== 1 ? 's' : ''} 
            {searchTerm && ` pour "${searchTerm}"`}
          </div>
        )}

        {/* Grille des Squads */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSquads.map((squad) => (
            <div
              key={squad.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer transform hover:scale-[1.02]"
              onClick={() => window.location.href = `/cockpit/admin/squads/${squad.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: getStatusColor(squad.status) }}
                  />
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getDomainColor(squad.domain) + '20', 
                      color: getDomainColor(squad.domain) 
                    }}
                  >
                    {squad.domain}
                  </span>
                </div>
                <Settings size={16} className="text-gray-400 hover:text-white" />
              </div>

              <h3 className="text-lg font-semibold mb-2 text-white">{squad.name}</h3>
              <p className="text-gray-400 text-sm mb-4 font-mono">{squad.slug}</p>

              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="flex items-center justify-center space-x-1 text-blue-400">
                    <Users size={14} />
                    <span className="text-lg font-bold">{squad.members_count}</span>
                  </div>
                  <div className="text-xs text-gray-300">Agents</div>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1 text-green-400">
                    <Zap size={14} />
                    <span className="text-lg font-bold">{squad.projects_count}</span>
                  </div>
                  <div className="text-xs text-gray-300">Projets</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">
                    {squad.avg_completion_hours > 0 
                      ? `${(squad.avg_completion_hours || 0).toFixed(1)}h` 
                      : '—'}
                  </div>
                  <div className="text-xs text-gray-300">Moy.</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    Par {squad.created_by?.split('@')[0] || 'Utilisateur'}
                  </span>
                  <span className="text-gray-300">
                    {new Date(squad.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSquads.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'Aucune squad trouvée' : 'Aucune squad'}
            </p>
            <p className="text-gray-300 mb-6">
              {searchTerm 
                ? 'Essayez avec d\'autres termes de recherche' 
                : 'Créez votre première squad pour commencer'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
              >
                Créer ma première squad
              </button>
            )}
          </div>
        )}

        {/* Stats rapides */}
        {squads.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-xl font-bold text-green-400 mb-1">
                {squads.filter(s => s.status === 'active').length}
              </div>
              <div className="text-gray-400 text-sm">Squads Actives</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-xl font-bold text-blue-400 mb-1">
                {squads.reduce((sum, s) => sum + s.members_count, 0)}
              </div>
              <div className="text-gray-400 text-sm">Agents Totaux</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-xl font-bold text-purple-400 mb-1">
                {squads.reduce((sum, s) => sum + s.projects_count, 0)}
              </div>
              <div className="text-gray-400 text-sm">Projets Assignés</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-xl font-bold text-yellow-400 mb-1">
                {squads.length > 0 
                  ? (squads.reduce((sum, s) => sum + (s.avg_completion_hours || 0), 0) / squads.length).toFixed(1)
                  : '0'}h
              </div>
              <div className="text-gray-400 text-sm">Temps Moyen</div>
            </div>
          </div>
        )}

        {/* Modal de création */}
        {showCreateModal && (
          <CreateSquadModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={createSquad}
          />
        )}
    </ResponsiveWrapper>
  );
}

// Composant Modal amélioré
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
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white">Créer une nouvelle Squad</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Nom de la Squad *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="ex: Squad RH Alpha"
              required
              minLength={3}
              maxLength={100}
            />
            <div className="text-xs text-gray-300 mt-1">
              {formData.name.length}/100 caractères
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Mission (Optionnelle)
            </label>
            <textarea
              value={formData.mission}
              onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 text-white resize-none"
              placeholder="Décrivez la mission de cette squad..."
              maxLength={800}
            />
            <div className="text-xs text-gray-300 mt-1">
              {formData.mission.length}/800 caractères
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Domaine d&apos;expertise
            </label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value as any }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="Tech">🔧 Tech - Développement & Architecture</option>
              <option value="RH">👥 RH - Ressources Humaines</option>
              <option value="Marketing">📢 Marketing - Communication</option>
              <option value="Finance">💰 Finance - Gestion financière</option>
              <option value="Ops">⚙️ Ops - Opérations & Support</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-gray-300 transition-colors"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 text-white font-medium"
              disabled={submitting || formData.name.length < 3}
            >
              {submitting ? 'Création...' : 'Créer Squad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}