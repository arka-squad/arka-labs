'use client';

import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle, Building, User, Mail, Phone, Globe, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ClientForm {
  nom: string;
  secteur: string;
  taille: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  site_web?: string;
  description?: string;
  tags?: string[];
  budget_annuel?: number;
  statut: 'actif' | 'inactif' | 'prospect' | 'archive';
}

const initialForm: ClientForm = {
  nom: '',
  secteur: '',
  taille: 'PME',
  contact_principal: '',
  email: '',
  telephone: '',
  adresse: '',
  site_web: '',
  description: '',
  tags: [],
  budget_annuel: undefined,
  statut: 'actif'
};

export default function AdminNewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClientForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.nom || !form.secteur || !form.contact_principal) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      const newClient = await response.json();
      router.push(`/cockpit/admin/clients/${newClient.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
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
                <h1 className="text-2xl font-bold text-gray-900">Nouveau Client</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Administration - Création d'un nouveau client
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm">
            {/* Informations générales */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-400" />
                Informations générales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité *
                  </label>
                  <input
                    type="text"
                    value={form.secteur}
                    onChange={(e) => setForm({ ...form, secteur: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Finance, Santé, E-commerce..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille de l'entreprise *
                  </label>
                  <select
                    value={form.taille}
                    onChange={(e) => setForm({ ...form, taille: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="TPE">TPE (1-10 employés)</option>
                    <option value="PME">PME (10-250 employés)</option>
                    <option value="ETI">ETI (250-5000 employés)</option>
                    <option value="GE">Grande Entreprise (5000+ employés)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={form.statut}
                    onChange={(e) => setForm({ ...form, statut: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="archive">Archivé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact principal */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Contact principal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du contact *
                  </label>
                  <input
                    type="text"
                    value={form.contact_principal}
                    onChange={(e) => setForm({ ...form, contact_principal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Site web
                  </label>
                  <input
                    type="url"
                    value={form.site_web}
                    onChange={(e) => setForm({ ...form, site_web: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Informations complémentaires */}
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Informations complémentaires</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description / Notes
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Informations supplémentaires sur le client..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget annuel (€)
                  </label>
                  <input
                    type="number"
                    value={form.budget_annuel || ''}
                    onChange={(e) => setForm({ ...form, budget_annuel: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 50000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-4">
            <Link
              href="/cockpit/admin/clients"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Créer le client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}