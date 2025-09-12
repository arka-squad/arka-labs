'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Building, User, Mail, Phone, Globe, Briefcase, Users, Calendar } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ClientDetails {
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
  };
  contexte_specifique: string;
  statut: 'actif' | 'inactif' | 'prospect' | 'archive';
  projets_count: number;
  projets_actifs: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const statutColors = {
  'actif': 'bg-green-500/20 text-green-400 border-green-500/50',
  'inactif': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  'prospect': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  'archive': 'bg-red-500/20 text-red-400 border-red-500/50'
};

const tailleLabels = {
  'TPE': 'TPE (1-10 employés)',
  'PME': 'PME (10-250 employés)',
  'ETI': 'ETI (250-5000 employés)',
  'GE': 'Grande Entreprise (5000+ employés)'
};

export default function AdminClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/admin/clients/${clientId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/cockpit/admin/clients"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{client.nom}</h1>
                <p className="text-sm text-gray-300 mt-1">
                  Client · {client.secteur} · Créé le {formatDate(client.created_at)}
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
            </div>
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
                  <p className="text-2xl font-semibold text-white mt-2 capitalize">{client.statut}</p>
                </div>
                <Building className="w-8 h-8 text-blue-400" />
              </div>
              <div className="mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statutColors[client.statut]}`}>
                  {client.statut}
                </span>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Taille</p>
                  <p className="text-2xl font-semibold text-white mt-2">{client.taille}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mt-4">
                {tailleLabels[client.taille]}
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
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Nom de l'entreprise</h3>
                      <p className="text-white font-medium">{client.nom}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Secteur d'activité</h3>
                      <p className="text-white">{client.secteur}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Taille</h3>
                      <p className="text-white">{tailleLabels[client.taille]}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Statut</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statutColors[client.statut]}`}>
                        {client.statut}
                      </span>
                    </div>
                  </div>

                  {client.contexte_specifique && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Contexte spécifique</h3>
                      <p className="text-white">{client.contexte_specifique}</p>
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
                      <p className="font-medium text-white">{client.contact_principal.nom}</p>
                      {client.contact_principal.fonction && (
                        <p className="text-sm text-gray-400">{client.contact_principal.fonction}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a 
                      href={`mailto:${client.contact_principal.email}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {client.contact_principal.email}
                    </a>
                  </div>

                  {client.contact_principal.telephone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`tel:${client.contact_principal.telephone}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {client.contact_principal.telephone}
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
                    href={`mailto:${client.contact_principal.email}`}
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
    </div>
  );
}