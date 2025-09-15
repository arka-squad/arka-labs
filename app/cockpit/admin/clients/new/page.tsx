'use client';

import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle, Building, User, Mail, Phone, Globe, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../components/AdminNavigation';
import AdminProtection from '../../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Structure B29 anglaise cohérente avec BDD
interface ClientForm {
  name: string;                    // ✅ Plus nom → name
  sector: string;                  // ✅ Plus secteur → sector
  size: 'small' | 'medium' | 'large' | 'enterprise';  // ✅ Plus taille → size
  primary_contact: {               // ✅ Plus contact_principal → primary_contact
    name: string;                  // ✅ Plus nom → name
    email: string;
    phone?: string;                // ✅ Plus telephone → phone
    function?: string;             // ✅ Plus fonction → function
  };
  address?: string;                // ✅ Plus adresse → address
  website?: string;                // ✅ Plus site_web → website
  description?: string;
  specific_context?: string;       // ✅ Plus contexte_specifique → specific_context
  tags?: string[];
  annual_budget?: number;          // ✅ Plus budget_annuel → annual_budget
  status: 'active' | 'inactive' | 'pending';  // ✅ Plus statut → status
}

const initialForm: ClientForm = {
  name: '',                        // ✅ Structure anglaise
  sector: '',
  size: 'medium',                  // ✅ medium au lieu de PME
  primary_contact: {
    name: '',                      // ✅ Structure anglaise
    email: '',
    phone: '',                     // ✅ phone au lieu de telephone
    function: ''
  },
  address: '',                     // ✅ Structure anglaise
  website: '',
  description: '',
  specific_context: '',            // ✅ Structure anglaise
  tags: [],
  annual_budget: undefined,        // ✅ Structure anglaise
  status: 'active'                 // ✅ Structure anglaise
};

export default function AdminNewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClientForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - Structure B29 anglaise
    if (!form.name || !form.sector || !form.primary_contact.name || !form.primary_contact.email) {
      setError('Veuillez remplir tous les champs obligatoires (name, sector, nom du contact et email)');
      return;
    }

    console.log('🔄 Creating client with B29 structure:', form);

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
    <AdminProtection allowedRoles={['admin', 'manager']}>
          <div className="min-h-screen console-theme">
      {/* Admin Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <AdminNavigation />
        
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/cockpit/admin/clients"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Nouveau Client</h1>
            <p className="text-sm text-gray-300 mt-1">
              Administration - Création d&apos;un nouveau client
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
            {/* Informations générales */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Building className="w-5 h-5 text-gray-400" />
                Informations générales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de l&apos;entreprise *
                  </label>
                  <input
                    type="text"
                    value={form.name}    // ✅ Structure B29
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secteur d&apos;activité *
                  </label>
                  <input
                    type="text"
                    value={form.sector}    // ✅ Structure B29
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Ex: Finance, Santé, E-commerce..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Taille de l&apos;entreprise *
                  </label>
                  <select
                    value={form.size}    // ✅ Structure B29
                    onChange={(e) => setForm({ ...form, size: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  >
                    <option value="small">Petite (1-50 employés)</option>
                    <option value="medium">Moyenne (50-250 employés)</option>
                    <option value="large">Grande (250-1000 employés)</option>
                    <option value="enterprise">Entreprise (1000+ employés)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={form.status}    // ✅ Structure B29
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  >
                    <option value="pending">En attente</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact principal */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-gray-400" />
                Contact principal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du contact *
                  </label>
                  <input
                    type="text"
                    value={form.primary_contact.name}    // ✅ Structure B29
                    onChange={(e) => setForm({
                      ...form,
                      primary_contact: { ...form.primary_contact, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email du contact *
                  </label>
                  <input
                    type="email"
                    value={form.primary_contact.email}    // ✅ Structure B29
                    onChange={(e) => setForm({
                      ...form,
                      primary_contact: { ...form.primary_contact, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone du contact
                  </label>
                  <input
                    type="tel"
                    value={form.primary_contact.phone || ''}    // ✅ Structure B29
                    onChange={(e) => setForm({
                      ...form,
                      primary_contact: { ...form.primary_contact, phone: e.target.value }
                    })}    // ✅ Structure B29
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fonction du contact
                  </label>
                  <input
                    type="text"
                    value={form.primary_contact.function || ''}    // ✅ Structure B29
                    onChange={(e) => setForm({
                      ...form,
                      primary_contact: { ...form.primary_contact, function: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Ex: Directeur, Manager, etc."
                  />
                </div>
              </div>
            </div>

            {/* Informations complémentaires */}
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Informations complémentaires</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={form.address || ''}    // ✅ Structure B29
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Adresse complète de l'entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Site web
                    </label>
                    <input
                      type="url"
                      value={form.website || ''}    // ✅ Structure B29
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description / Notes
                  </label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Informations supplémentaires sur le client..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contexte spécifique
                  </label>
                  <textarea
                    value={form.specific_context || ''}    // ✅ Structure B29
                    onChange={(e) => setForm({ ...form, specific_context: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Contexte spécifique au client, besoins particuliers..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Budget annuel (€)
                  </label>
                  <input
                    type="number"
                    value={form.annual_budget || ''}    // ✅ Structure B29
                    onChange={(e) => setForm({ ...form, annual_budget: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
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
              className="px-4 py-2 text-gray-700 hover:text-white transition-colors"
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
  </AdminProtection>
  );
}