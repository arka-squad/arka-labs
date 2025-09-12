'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building, Calendar, User, Phone, Mail, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Client {
  id: string;
  nom: string;
  email: string;
  secteur: string;
  taille: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal: {
    nom: string;
    email: string;
    fonction?: string;
    telephone?: string;
  } | string;
  contact_nom: string;
  contexte_specifique: string;
  statut: 'actif' | 'inactif' | 'prospect' | 'archive';
  projets_count: number;
  projets_actifs: number;
  created_at: string;
  created_by: string;
}

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [tailleFilter, setTailleFilter] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statutFilter, tailleFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statutFilter) params.append('statut', statutFilter);
      if (tailleFilter) params.append('taille', tailleFilter);
      
      const response = await fetch(`/api/admin/clients?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des clients');
      }
      
      const data = await response.json();
      setClients(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'archive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTailleLabel = (taille: string) => {
    switch (taille) {
      case 'TPE': return 'TPE (1-10)';
      case 'PME': return 'PME (10-250)';
      case 'ETI': return 'ETI (250-5000)';
      case 'GE': return 'GE (5000+)';
      default: return taille;
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
              <p className="mt-1 text-sm text-gray-500">
                {clients.length} client{clients.length !== 1 ? 's' : ''} au total
              </p>
            </div>
            <Link
              href="/cockpit/admin/clients/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nouveau Client
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="prospect">Prospect</option>
                <option value="archive">Archivé</option>
              </select>
              
              <select
                value={tailleFilter}
                onChange={(e) => setTailleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les tailles</option>
                <option value="TPE">TPE (1-10)</option>
                <option value="PME">PME (10-250)</option>
                <option value="ETI">ETI (250-5000)</option>
                <option value="GE">GE (5000+)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && clients.length > 0 && (
          <div className="mb-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 inline-block"></div>
            <span className="ml-2 text-sm text-gray-600">Mise à jour...</span>
          </div>
        )}

        {clients.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Building size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun client trouvé</h3>
            <p className="text-gray-500 mb-6">Commencez par créer votre premier client</p>
            <Link
              href="/cockpit/admin/clients/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Créer un client
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/cockpit/admin/clients/${client.id}`)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {client.nom}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {client.secteur}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(client.statut)}`}>
                      {client.statut}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User size={16} className="mr-2 text-gray-400" />
                      <span className="truncate">
                        {client.contact_nom || 'Non défini'}
                      </span>
                    </div>
                    
                    {client.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Building size={16} className="mr-2 text-gray-400" />
                      <span>{getTailleLabel(client.taille)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{client.projets_actifs}</span> projets actifs
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}