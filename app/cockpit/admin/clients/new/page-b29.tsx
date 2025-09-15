'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Save, X } from 'lucide-react';
import AdminNavigation from '../../components/AdminNavigation';
import AdminProtection from '../../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function CreateClientPageB29() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Structure anglaise B29
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    size: 'medium' as 'small' | 'medium' | 'large' | 'enterprise',
    status: 'active' as 'active' | 'inactive' | 'pending',
    primary_contact: {
      name: '',
      email: '',
      phone: ''
    },
    specific_context: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Creating client with B29 structure:', formData);

      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Client created successfully:', result.data);

      // Redirection vers la fiche du client créé
      router.push(`/cockpit/admin/clients/${result.data.id}`);
    } catch (err) {
      console.error('❌ Error creating client:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du client');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('primary_contact.')) {
      const contactField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        primary_contact: {
          ...prev.primary_contact,
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Petite entreprise';
      case 'medium': return 'Moyenne entreprise';
      case 'large': return 'Grande entreprise';
      case 'enterprise': return 'Entreprise/Corporation';
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

  return (
    <AdminProtection>
      <div className="min-h-screen bg-black text-green-400 p-8">
        <AdminNavigation />

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-green-400 hover:text-green-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>

            <div className="text-sm text-green-400/70">
              🔧 Structure B29 anglaise - Plus d&apos;erreurs FR-EN!
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-900/50 border border-green-500/20 rounded-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-green-400 mb-2">🏢 Nouveau Client</h1>
              <p className="text-green-400/70">Création avec structure anglaise cohérente</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations générales */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-green-400 border-b border-green-500/20 pb-2">
                  Informations générales
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-400/70 mb-2">
                      Nom de l&apos;entreprise *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 placeholder-green-400/50 focus:border-green-500 focus:outline-none"
                      placeholder="Ex: Acme Corp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-400/70 mb-2">
                      Secteur d&apos;activité
                    </label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 placeholder-green-400/50 focus:border-green-500 focus:outline-none"
                      placeholder="Ex: Technology, Finance, Retail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-400/70 mb-2">
                      Taille de l&apos;entreprise
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 focus:border-green-500 focus:outline-none"
                    >
                      <option value="small">Petite entreprise</option>
                      <option value="medium">Moyenne entreprise</option>
                      <option value="large">Grande entreprise</option>
                      <option value="enterprise">Entreprise/Corporation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-400/70 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 focus:border-green-500 focus:outline-none"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="pending">En attente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact principal */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-green-400 border-b border-green-500/20 pb-2">
                  Contact principal
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-400/70 mb-2">
                      Nom du contact
                    </label>
                    <input
                      type="text"
                      value={formData.primary_contact.name}
                      onChange={(e) => handleInputChange('primary_contact.name', e.target.value)}
                      className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 placeholder-green-400/50 focus:border-green-500 focus:outline-none"
                      placeholder="Ex: John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-400/70 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.primary_contact.email}
                      onChange={(e) => handleInputChange('primary_contact.email', e.target.value)}
                      className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 placeholder-green-400/50 focus:border-green-500 focus:outline-none"
                      placeholder="contact@exemple.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-400/70 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.primary_contact.phone}
                      onChange={(e) => handleInputChange('primary_contact.phone', e.target.value)}
                      className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 placeholder-green-400/50 focus:border-green-500 focus:outline-none"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </div>

              {/* Contexte spécifique */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-green-400 border-b border-green-500/20 pb-2">
                  Contexte spécifique
                </h2>

                <div>
                  <label className="block text-sm font-medium text-green-400/70 mb-2">
                    Informations contextuelles
                  </label>
                  <textarea
                    value={formData.specific_context}
                    onChange={(e) => handleInputChange('specific_context', e.target.value)}
                    rows={4}
                    className="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 placeholder-green-400/50 focus:border-green-500 focus:outline-none resize-none"
                    placeholder="Contexte, besoins spécifiques, historique..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-green-500/20">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Création...' : 'Créer le client'}</span>
                </button>
              </div>
            </form>

            {/* Debug info */}
            <div className="mt-8 p-4 bg-gray-900/30 rounded-lg border border-green-500/10">
              <div className="text-sm text-green-400/50">
                🔧 Debug B29: Structure anglaise cohérente -
                Champs: name=&quot;{formData.name}&quot; | sector=&quot;{formData.sector}&quot; | status=&quot;{formData.status}&quot; | size=&quot;{formData.size}&quot;
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}