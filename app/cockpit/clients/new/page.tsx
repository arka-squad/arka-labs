'use client';

import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle, Building, User, Mail, Phone, Globe, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClientForm {
  nom: string;
  secteur: string;
  taille: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal: {
    nom: string;
    email: string;
    telephone: string;
    fonction: string;
  };
  contexte_specifique: string;
  site_web?: string;
  effectifs?: number;
  chiffre_affaires?: number;
  statut: 'actif' | 'inactif';
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
  site_web: '',
  effectifs: undefined,
  chiffre_affaires: undefined,
  statut: 'actif'
};

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClientForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.nom.trim() || !form.secteur.trim()) {
      setError('Le nom et le secteur sont obligatoires');
      return;
    }

    if (!form.contact_principal.email || !form.contact_principal.nom) {
      setError('Le nom et l\'email du contact principal sont obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la création du client');
      }

      // Redirect to client detail page
      router.push(`/cockpit/clients/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const updateContactField = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      contact_principal: {
        ...prev.contact_principal,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#0F1621] text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A3441]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/cockpit/clients')}
              className="p-2 hover:bg-[#1A2332] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Nouveau Client</h1>
              <p className="text-slate-400 text-sm mt-1">Créer une nouvelle organisation cliente</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informations générales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom de l'entreprise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({...form, nom: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Arka Labs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secteur d'activité <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.secteur}
                    onChange={(e) => setForm({...form, secteur: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Technologies, Finance, Industrie..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Taille de l'entreprise <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.taille}
                    onChange={(e) => setForm({...form, taille: e.target.value as ClientForm['taille']})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="TPE">TPE (0-10)</option>
                    <option value="PME">PME (10-250)</option>
                    <option value="ETI">ETI (250-5000)</option>
                    <option value="GE">Grande Entreprise (5000+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Statut
                  </label>
                  <select
                    value={form.statut}
                    onChange={(e) => setForm({...form, statut: e.target.value as ClientForm['statut']})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={form.site_web}
                    onChange={(e) => setForm({...form, site_web: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Effectifs
                  </label>
                  <input
                    type="number"
                    value={form.effectifs || ''}
                    onChange={(e) => setForm({...form, effectifs: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="250"
                  />
                </div>
              </div>
            </div>

            {/* Contact principal */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact principal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.contact_principal.nom}
                    onChange={(e) => updateContactField('nom', e.target.value)}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fonction
                  </label>
                  <input
                    type="text"
                    value={form.contact_principal.fonction}
                    onChange={(e) => updateContactField('fonction', e.target.value)}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Directeur Technique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.contact_principal.email}
                    onChange={(e) => updateContactField('email', e.target.value)}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="jean.dupont@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={form.contact_principal.telephone}
                    onChange={(e) => updateContactField('telephone', e.target.value)}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Contexte spécifique */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">Contexte & Notes</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contexte spécifique
                </label>
                <textarea
                  value={form.contexte_specifique}
                  onChange={(e) => setForm({...form, contexte_specifique: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Informations importantes sur le client, besoins spécifiques, historique..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/cockpit/clients')}
                className="px-6 py-2 border border-[#2A3441] rounded-lg hover:bg-[#1A2332] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Création...' : 'Créer le client'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}