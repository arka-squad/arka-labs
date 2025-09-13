'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, Building, User, Mail, Phone, Globe, Users, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../../components/AdminNavigation';
import AdminProtection from '../../../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ClientForm {
  nom: string;
  secteur: string;
  taille: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal: {
    nom: string;
    email: string;
    telephone?: string;
    fonction?: string;
  };
  contexte_specifique?: string;
  statut: 'actif' | 'inactif' | 'prospect' | 'archive';
}

const initialForm: ClientForm = {
  nom: '',
  secteur: '',
  taille: 'PME',
  contact_principal: {
    nom: '',
    email: '',
    telephone: '',
    fonction: ''
  },
  contexte_specifique: '',
  statut: 'actif'
};

export default function AdminEditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [form, setForm] = useState<ClientForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Client non trouvé');
      }

      const client = await response.json();
      
      // Parse contact_principal if it's a string
      let contactPrincipal = client.contact_principal;
      if (typeof contactPrincipal === 'string') {
        try {
          contactPrincipal = JSON.parse(contactPrincipal);
        } catch {
          contactPrincipal = { nom: '', email: '', telephone: '', fonction: '' };
        }
      }

      setForm({
        nom: client.nom || '',
        secteur: client.secteur || '',
        taille: client.taille || 'PME',
        contact_principal: contactPrincipal || { nom: '', email: '', telephone: '', fonction: '' },
        contexte_specifique: client.contexte_specifique || '',
        statut: client.statut || 'actif'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nom.length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-Id': `trace-${Date.now()}`
        },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }

      router.push(`/cockpit/admin/clients/${clientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

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
            <div className="min-h-screen console-theme">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <AdminNavigation />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    </AdminProtection>
    );
  }

  return (
    <div className="min-h-screen console-theme">
      {/* Admin Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <AdminNavigation />
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/cockpit/admin/clients/${clientId}`}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Modifier Client</h1>
              <p className="text-sm text-gray-300 mt-1">
                Modification des informations client
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l&apos;entreprise *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm(prev => ({ ...prev, nom: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Acme Corporation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secteur d&apos;activité *
                </label>
                <input
                  type="text"
                  required
                  value={form.secteur}
                  onChange={(e) => setForm(prev => ({ ...prev, secteur: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: Technologie, Finance, Santé..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Taille de l&apos;entreprise
                </label>
                <select
                  value={form.taille}
                  onChange={(e) => setForm(prev => ({ ...prev, taille: e.target.value as any }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TPE">TPE (1-10 employés)</option>
                  <option value="PME">PME (10-250 employés)</option>
                  <option value="ETI">ETI (250-5000 employés)</option>
                  <option value="GE">Grande Entreprise (5000+ employés)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm(prev => ({ ...prev, statut: e.target.value as any }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="prospect">Prospect</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>
            </div>

            {/* Contact principal */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact principal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du contact
                  </label>
                  <input
                    type="text"
                    value={form.contact_principal.nom}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      contact_principal: { ...prev.contact_principal, nom: e.target.value }
                    }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={form.contact_principal.email}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        contact_principal: { ...prev.contact_principal, email: e.target.value }
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ex: jean@acme.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.contact_principal.telephone}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        contact_principal: { ...prev.contact_principal, telephone: e.target.value }
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ex: +33 1 23 45 67 89"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fonction
                  </label>
                  <input
                    type="text"
                    value={form.contact_principal.fonction}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      contact_principal: { ...prev.contact_principal, fonction: e.target.value }
                    }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Directeur Général"
                  />
                </div>
              </div>
            </div>

            {/* Contexte spécifique */}
            <div className="border-t border-gray-700 pt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contexte spécifique
              </label>
              <textarea
                value={form.contexte_specifique}
                onChange={(e) => setForm(prev => ({ ...prev, contexte_specifique: e.target.value }))}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Informations supplémentaires sur le client, ses besoins spécifiques..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
              <Link
                href={`/cockpit/admin/clients/${clientId}`}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
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
              Êtes-vous sûr de vouloir supprimer ce client ? Tous les projets associés seront également affectés.
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