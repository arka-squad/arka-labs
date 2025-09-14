'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building, User, Mail, Phone, ArrowRight, Users, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../components/AdminNavigation';
import AdminProtection from '../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Client {
  id: string;
  name: string;
  email: string;
  sector: string;
  size: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal: {
    name: string;
    email: string;
    role?: string;
    phone?: string;
  } | string;
  contact_name: string;
  specific_context: string;
  status: 'active' | 'inactive' | 'prospect' | 'archived';
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
      if (statusFilter) params.append('status', statusFilter);
      if (sizeFilter) params.append('size', sizeFilter);
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'prospect': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'archived': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getSizeLabel = (size: string) => {
    const labels = {
      'TPE': 'TPE (1-10)',
      'PME': 'PME (10-250)',
      'ETI': 'ETI (250-5K)',
      'GE': 'GE (5K+)'
    };
    return labels[size as keyof typeof labels] || size;
  };

  const getContactInfo = (client: Client) => {
    if (typeof client.contact_principal === 'object' && client.contact_principal) {
      return {
        name: client.contact_principal.name,
        email: client.contact_principal.email,
        phone: client.contact_principal.phone
      };
    }
    return {
      name: client.contact_name || 'N/A',
      email: client.email || 'N/A',
      phone: ''
    };
  };

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
      <div className="min-h-screen console-theme">
      {/* Admin Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <AdminNavigation />
        
        {/* Action Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🏢 Gestion des Clients</h1>
            <p className="text-sm text-gray-400 mt-1">
              {clients.length} client{clients.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link
            href="/cockpit/admin/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau Client
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactif</option>
              <option value="archived">Archivé</option>
            </select>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les tailles</option>
              <option value="TPE">TPE (1-10)</option>
              <option value="PME">PME (10-250)</option>
              <option value="ETI">ETI (250-5K)</option>
              <option value="GE">Grande Entreprise (5K+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {clients.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Aucun client trouvé</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter || sizeFilter
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Commencez par créer votre premier client.'
              }
            </p>
            {!searchTerm && !statusFilter && !sizeFilter && (
              <Link
                href="/cockpit/admin/clients/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Créer le premier client
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
              const contact = getContactInfo(client);
              return (
                <Link key={client.id} href={`/cockpit/admin/clients/${client.id}`}>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-all duration-200 hover:border-gray-600 group cursor-pointer">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {client.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">{client.sector}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{contact.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Company Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Building className="w-4 h-4" />
                        <span>{getSizeLabel(client.size)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{client.projets_actifs}</span>
                          <span className="hidden sm:inline">projet{client.projets_actifs > 1 ? 's' : ''}</span>
                        </div>
                        {client.projets_count > client.projets_actifs && (
                          <div className="text-xs">
                            +{client.projets_count - client.projets_actifs} total
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {loading && clients.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      </div>
    </AdminProtection>
  );
}