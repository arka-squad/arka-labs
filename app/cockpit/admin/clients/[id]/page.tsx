'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Building, User, Mail, Phone, Globe, Calendar, DollarSign, Tag } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Client {
  id: string;
  nom: string;
  secteur: string;
  taille: string;
  contact_principal: {
    nom: string;
    email?: string;
    fonction?: string;
    telephone?: string;
  } | string;
  email?: string;
  telephone?: string;
  adresse?: string;
  site_web?: string;
  description?: string;
  tags?: string[];
  budget_annuel?: number;
  statut: string;
  created_at: string;
  updated_at: string;
  projets_count?: number;
  projets_actifs?: number;
}

export default function AdminClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClient();
  }, [params.id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${params.id}`);
      if (!response.ok) {
        throw new Error('Client non trouvé');
      }
      const data = await response.json();
      setClient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
    
    try {
      const response = await fetch(`/api/admin/clients/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      router.push('/cockpit/admin/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/cockpit/admin/clients"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Client introuvable</h1>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-900/20 border border-red-200 rounded-lg p-4">
            <p className="text-red-300">{error || 'Le client demandé n\'existe pas.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'archive': return 'bg-red-100 text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTailleLabel = (taille: string) => {
    switch (taille) {
      case 'TPE': return 'TPE (1-10)';
      case 'PME': return 'PME (10-250)';
      case 'ETI': return 'ETI (250-5000)';
      case 'GE': return 'Grande Entreprise (5000+)';
      default: return taille;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/cockpit/admin/clients"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{client.nom}</h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.statut)}`}>
                    {client.statut}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  {client.secteur} • {getTailleLabel(client.taille)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/cockpit/admin/clients/${params.id}/edit`)}
                className="p-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-400" />
                Informations générales
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-300">Nom</dt>
                  <dd className="mt-1 text-sm text-white">{client.nom}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-300">Secteur</dt>
                  <dd className="mt-1 text-sm text-white">{client.secteur}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-300">Taille</dt>
                  <dd className="mt-1 text-sm text-white">{getTailleLabel(client.taille)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-300">Statut</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.statut)}`}>
                      {client.statut}
                    </span>
                  </dd>
                </div>
                {client.budget_annuel && (
                  <div>
                    <dt className="text-sm font-medium text-gray-300 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Budget annuel
                    </dt>
                    <dd className="mt-1 text-sm text-white">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(client.budget_annuel)}
                    </dd>
                  </div>
                )}
                {client.site_web && (
                  <div>
                    <dt className="text-sm font-medium text-gray-300 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Site web
                    </dt>
                    <dd className="mt-1">
                      <a href={client.site_web} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {client.site_web}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              {client.description && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <dt className="text-sm font-medium text-gray-300 mb-2">Description</dt>
                  <dd className="text-sm text-white">{client.description}</dd>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Contact principal
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-300">Nom</dt>
                  <dd className="mt-1 text-sm text-white">
                    {typeof client.contact_principal === 'string' 
                      ? client.contact_principal 
                      : client.contact_principal?.nom || 'Non défini'
                    }
                  </dd>
                </div>
                {client.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-300 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </dt>
                    <dd className="mt-1">
                      <a href={`mailto:${client.email}`} className="text-sm text-blue-600 hover:underline">
                        {client.email}
                      </a>
                    </dd>
                  </div>
                )}
                {client.telephone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-300 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </dt>
                    <dd className="mt-1">
                      <a href={`tel:${client.telephone}`} className="text-sm text-blue-600 hover:underline">
                        {client.telephone}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Statistiques</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-300">Projets totaux</dt>
                  <dd className="text-sm font-medium text-white">{client.projets_count || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-300">Projets actifs</dt>
                  <dd className="text-sm font-medium text-white">{client.projets_actifs || 0}</dd>
                </div>
              </dl>
            </div>

            {/* Dates */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Dates
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-300">Créé le</dt>
                  <dd className="text-sm text-white">
                    {new Date(client.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-300">Mis à jour le</dt>
                  <dd className="text-sm text-white">
                    {new Date(client.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/cockpit/admin/projects/new?client_id=${client.id}`}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Créer un projet
                </Link>
                <button
                  onClick={() => router.push(`/cockpit/admin/clients/${params.id}/edit`)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Modifier le client
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}