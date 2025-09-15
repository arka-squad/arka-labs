'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building, User, Mail, Phone, ArrowRight, Users, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../components/AdminNavigation';
import AdminProtection from '../components/AdminProtection';
import { Client, ApiListResponse } from '../../../../types/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function AdminClientsPageB29() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sizeFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);  // ✅ status (anglais)
      if (sizeFilter) params.append('size', sizeFilter);        // ✅ size (anglais)

      const response = await fetch(`/api/admin/clients?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des clients');
      }

      const data: ApiListResponse<Client> = await response.json();
      setClients(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';    // ✅ anglais
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';     // ✅ anglais
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';      // ✅ anglais
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Petite';
      case 'medium': return 'Moyenne';
      case 'large': return 'Grande';
      case 'enterprise': return 'Entreprise';
      default: return size;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AdminProtection>
        <div className="min-h-screen bg-black text-green-400 p-8">
          <AdminNavigation />
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Chargement des clients...</div>
          </div>
        </div>
      </AdminProtection>
    );
  }

  if (error) {
    return (
      <AdminProtection>
        <div className="min-h-screen bg-black text-green-400 p-8">
          <AdminNavigation />
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-red-400">❌ {error}</div>
          </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-black text-green-400 p-8">
        <AdminNavigation />

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🏢 Gestion Clients</h1>
              <p className="text-green-400/70">Structure B29 anglaise - Plus d&apos;erreurs FR-EN!</p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Nouveau Client</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gray-900/50 p-6 rounded-lg border border-green-500/20">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400/50" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-green-500/30 rounded-lg pl-10 pr-4 py-3 text-green-400 placeholder-green-400/50 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 focus:border-green-500 focus:outline-none"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
              </select>

              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 focus:border-green-500 focus:outline-none"
              >
                <option value="">Toutes les tailles</option>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
                <option value="enterprise">Entreprise</option>
              </select>
            </div>
          </div>

          {/* Clients List */}
          <div className="grid gap-6">
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-green-400/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun client trouvé</h3>
                <p className="text-green-400/70">Commencez par ajouter votre premier client</p>
              </div>
            ) : (
              clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-gray-900/50 border border-green-500/20 rounded-lg p-6 hover:border-green-500/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/cockpit/admin/clients/${client.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-xl font-semibold text-green-400 group-hover:text-green-300">
                          {client.name} {/* ✅ Plus nom, maintenant name */}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(client.status)}`}>
                          {getStatusLabel(client.status)} {/* ✅ Plus statut, maintenant status */}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 border border-blue-500/50">
                          {getSizeLabel(client.size)} {/* ✅ Plus taille, maintenant size */}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-green-400/50" />
                          <span className="text-green-400/70">Secteur:</span>
                          <span>{client.sector || 'Non spécifié'}</span> {/* ✅ Plus secteur, maintenant sector */}
                        </div>

                        {client.primary_contact && ( /* ✅ Plus contact_principal, maintenant primary_contact */
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-green-400/50" />
                            <span className="text-green-400/70">Contact:</span>
                            <span>{client.primary_contact.name}</span>
                          </div>
                        )}

                        {client.primary_contact?.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-green-400/50" />
                            <span className="text-green-400/70">Email:</span>
                            <span>{client.primary_contact.email}</span>
                          </div>
                        )}
                      </div>

                      {client.specific_context && ( /* ✅ Plus contexte_specifique, maintenant specific_context */
                        <div className="mt-3 text-sm text-green-400/70">
                          {client.specific_context}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-green-400/50 group-hover:text-green-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}