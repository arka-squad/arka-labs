'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Building, User, Mail, Phone, Globe, Briefcase, Users, Calendar, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../components/AdminNavigation';
import AdminProtection from '../../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  sector: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  primary_contact: {
    name: string;
    email: string;
    fonction?: string;
    phone?: string;
  };
  specific_context: string;
  status: 'active' | 'inactive' | 'pending';
  projets_count: number;
  projets_actifs: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const statusColors = {
  'active': 'bg-green-500/20 text-green-400 border-green-500/50',
  'inactive': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  'pending': 'bg-blue-500/20 text-blue-400 border-blue-500/50'
};

const sizeLabels = {
  'small': 'TPE (1-10 employés)',
  'medium': 'PME (10-250 employés)',
  'large': 'ETI (250-5000 employés)',
  'enterprise': 'Grande Entreprise (5000+ employés)'
};

export default function AdminClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/admin/clients?id=${clientId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Client introuvable');
          } else {
            throw new Error('Erreur lors du chargement');
          }
          return;
        }
        const data = await response.json();
        setClient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'X-Trace-Id': `trace-${Date.now()}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      router.push('/cockpit/admin/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
            <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </AdminProtection>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error || 'Client introuvable'}</div>
          <Link href="/cockpit/admin/clients" className="text-blue-400 hover:text-blue-300">
            ← Retour aux clients
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen console-theme">
      {/* Admin Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <AdminNavigation />
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/cockpit/admin/clients"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              <p className="text-sm text-gray-300 mt-1">
                Client · {client.sector} · Créé le {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/cockpit/admin/clients/${client.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Statut</p>
                  <p className="text-2xl font-semibold text-white mt-2 capitalize">{client.status}</p>
                </div>
                <Building className="w-8 h-8 text-blue-400" />
              </div>
              <div className="mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[client.status]}`}>
                  {client.status}
                </span>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Taille</p>
                  <p className="text-2xl font-semibold text-white mt-2">{client.size}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mt-4">
                {sizeLabels[client.size]}
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Projets actifs</p>
                  <p className="text-2xl font-semibold text-white mt-2">{client.projets_actifs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-400 mt-4">
                {client.projets_count} projet{client.projets_count > 1 ? 's' : ''} total
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Création</p>
                  <p className="text-lg font-semibold text-white mt-2">{formatDate(client.created_at).split(' ')[0]}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Par {client.created_by}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Company Details */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-400" />
                    Informations entreprise
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Nom de l&apos;entreprise</h3>
                      <p className="text-white font-medium">{client.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Secteur d&apos;activité</h3>
                      <p className="text-white">{client.sector}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Taille</h3>
                      <p className="text-white">{sizeLabels[client.size]}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Statut</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[client.status]}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>

                  {client.specific_context && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Contexte spécifique</h3>
                      <p className="text-white">{client.specific_context}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      Projets ({client.projets_count})
                    </h2>
                    <Link
                      href={`/cockpit/admin/projects/new?client=${client.id}`}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      + Nouveau projet
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {client.projets_count > 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">
                        Ce client a {client.projets_count} projet{client.projets_count > 1 ? 's' : ''} 
                        {client.projets_actifs > 0 && ` dont ${client.projets_actifs} actif${client.projets_actifs > 1 ? 's' : ''}`}
                      </p>
                      <Link
                        href={`/cockpit/admin/projects?client=${client.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Voir tous les projets →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">Aucun projet pour ce client</p>
                      <Link
                        href={`/cockpit/admin/projects/new?client=${client.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Briefcase className="w-4 h-4" />
                        Créer le premier projet
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    Contact principal
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">{client.primary_contact?.name || 'Nom non renseigné'}</p>
                      {client.primary_contact?.fonction && (
                        <p className="text-sm text-gray-400">{client.primary_contact?.fonction}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a 
                      href={`mailto:${client.primary_contact?.email || ''}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {client.primary_contact?.email || 'Email non renseigné'}
                    </a>
                  </div>

                  {client.primary_contact?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`tel:${client.primary_contact?.phone || ''}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {client.primary_contact?.phone || 'Téléphone non renseigné'}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white">Actions rapides</h2>
                </div>
                <div className="p-6 space-y-3">
                  <Link
                    href={`/cockpit/admin/projects/new?client=${client.id}`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <Briefcase className="w-4 h-4" />
                    Créer un projet
                  </Link>
                  <Link
                    href={`/cockpit/admin/clients/${client.id}/edit`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier le client
                  </Link>
                  <a
                    href={`mailto:${client.primary_contact?.email}`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <Mail className="w-4 h-4" />
                    Envoyer un email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Supprimer le client</h3>
                <p className="text-sm text-gray-400">Cette action est irréversible</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer le client &quot;{client?.name}&quot; ? Tous les projets associés seront également affectés.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}