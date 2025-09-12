'use client';

import { useState, useEffect } from 'react';
import { Plus, Building, Search, Filter, ArrowRight, Settings, Briefcase, Phone, Mail } from 'lucide-react';
import ResponsiveWrapper from '../components/ResponsiveWrapper';

interface Client {
  id: string;
  nom: string;
  secteur: string;
  taille: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal?: {
    nom: string;
    email: string;
    telephone: string;
  };
  contexte_specifique?: string;
  statut: 'actif' | 'inactif' | 'archive';
  projets_count?: number;
  projets_actifs?: number;
  created_at: string;
  created_by: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tailleFilter, setTailleFilter] = useState('');
  const [secteurFilter, setSecteurFilter] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, tailleFilter, secteurFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (statusFilter) params.append('statut', statusFilter);
      if (tailleFilter) params.append('taille', tailleFilter);
      if (secteurFilter) params.append('secteur', secteurFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/backoffice/clients?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'X-Trace-Id': `trace-${Date.now()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch clients');
      
      const data = await response.json();
      setClients(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif': return '#10B981';
      case 'inactif': return '#F59E0B';
      case 'archive': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTailleColor = (taille: string) => {
    switch (taille) {
      case 'GE': return '#8B5CF6';
      case 'ETI': return '#3B82F6';
      case 'PME': return '#10B981';
      case 'TPE': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.secteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contact_principal?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || client.statut === statusFilter;
    const matchesTaille = !tailleFilter || client.taille === tailleFilter;
    const matchesSecteur = !secteurFilter || client.secteur?.toLowerCase().includes(secteurFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesTaille && matchesSecteur;
  });

  if (loading) {
    return (
      <ResponsiveWrapper 
        currentPath="/cockpit/clients"
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0" 
        innerClassName="max-w-none mx-0"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement des clients...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper 
      currentPath="/cockpit/clients"
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
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">🏢 Gestion Clients</h1>
                <p className="text-gray-400 text-sm sm:text-base">Référentiel clients avec projets associés</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => window.location.href = '/cockpit/projects'}
                className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Briefcase size={16} />
                <span>Voir Projets</span>
              </button>
              <button 
                onClick={() => window.location.href = '/cockpit/clients/new'}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} />
                <span>Nouveau Client</span>
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
              placeholder="Rechercher par nom, secteur, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Tous statuts</option>
                <option value="actif">Actifs</option>
                <option value="inactif">Inactifs</option>
                <option value="archive">Archivés</option>
              </select>
            </div>
            
            <select
              value={tailleFilter}
              onChange={(e) => setTailleFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes tailles</option>
              <option value="TPE">TPE</option>
              <option value="PME">PME</option>
              <option value="ETI">ETI</option>
              <option value="GE">Grande Entreprise</option>
            </select>
            
            <input
              type="text"
              placeholder="Filtrer par secteur"
              value={secteurFilter}
              onChange={(e) => setSecteurFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
            
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setTailleFilter('');
                setSecteurFilter('');
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
            {filteredClients.length} résultat{filteredClients.length !== 1 ? 's' : ''} 
            {searchTerm && ` pour "${searchTerm}"`}
          </div>
        )}

        {/* Grille des Clients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer transform hover:scale-[1.02]"
              onClick={() => window.location.href = `/cockpit/clients/${client.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: getStatusColor(client.statut) }}
                  />
                  <span className="text-sm text-gray-400 capitalize">{client.statut}</span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: getTailleColor(client.taille) + '20',
                      color: getTailleColor(client.taille)
                    }}
                  >
                    {client.taille}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Settings size={16} className="text-gray-400 hover:text-white" />
                  <ArrowRight size={16} className="text-gray-400 hover:text-blue-400" />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-white">{client.nom}</h3>
              
              {client.secteur && (
                <div className="flex items-center space-x-2 text-sm text-blue-400 mb-3">
                  <Building size={14} />
                  <span>{client.secteur}</span>
                </div>
              )}

              {client.contact_principal && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="font-medium">{client.contact_principal.nom}</span>
                  </div>
                  {client.contact_principal.email && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Mail size={12} />
                      <span>{client.contact_principal.email}</span>
                    </div>
                  )}
                  {client.contact_principal.telephone && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Phone size={12} />
                      <span>{client.contact_principal.telephone}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase size={14} className="text-green-400" />
                    <span className="text-green-400 font-medium">{client.projets_actifs || 0}</span>
                    <span className="text-gray-500 text-sm">actifs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-medium">{client.projets_count || 0}</span>
                    <span className="text-gray-500 text-sm">total</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    Par {client.created_by?.split('@')[0] || 'System'}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    Voir projets →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'Aucun client trouvé' : 'Aucun client'}
            </p>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Essayez avec d\'autres termes de recherche' 
                : 'Créez votre premier client pour commencer'}
            </p>
            {!searchTerm && (
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
                Créer mon premier client
              </button>
            )}
          </div>
        )}

        {/* Stats rapides */}
        {clients.length > 0 && (
          <div className="mt-8 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {clients.filter(c => c.statut === 'actif').length}
              </div>
              <div className="text-gray-400 text-sm">Clients Actifs</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {clients.reduce((sum, c) => sum + (c.projets_count || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Projets</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {clients.reduce((sum, c) => sum + (c.projets_actifs || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Projets Actifs</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {clients.filter(c => c.taille === 'PME' || c.taille === 'ETI').length}
              </div>
              <div className="text-gray-400 text-sm">PME/ETI</div>
            </div>
          </div>
        )}

        {/* Action rapide */}
        <div className="mt-8 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-700/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                🎯 Développez votre portefeuille client
              </h3>
              <p className="text-gray-400">
                Ajoutez de nouveaux clients et lancez vos premiers projets avec nos squads spécialisées
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/cockpit/projects'}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Créer un projet →
            </button>
          </div>
        </div>
    </ResponsiveWrapper>
  );
}