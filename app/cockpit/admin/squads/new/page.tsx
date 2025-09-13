'use client';

import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle, Users, Target, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../components/AdminNavigation';
import AdminProtection from '../../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SquadForm {
  name: string;
  mission: string;
  domain: 'RH' | 'Tech' | 'Marketing' | 'Finance' | 'Ops';
}

const initialForm: SquadForm = {
  name: '',
  mission: '',
  domain: 'Tech'
};

export default function AdminNewSquadPage() {
  const router = useRouter();
  const [form, setForm] = useState<SquadForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.domain) {
      setError('Veuillez remplir tous les champs obligatoires (nom et domaine)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/squads', {
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

      const newSquad = await response.json();
      router.push(`/cockpit/admin/squads/${newSquad.id}`);
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
            href="/cockpit/admin/squads"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Nouvelle Squad</h1>
            <p className="text-sm text-gray-300 mt-1">
              Administration - Création d&apos;une nouvelle squad d&apos;agents
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
                <Users className="w-5 h-5 text-gray-400" />
                Informations générales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de la squad *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Ex: Squad RH Alpha, Tech Force, Marketing Pro..."
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Un nom unique et descriptif pour identifier la squad
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Domaine d&apos;expertise *
                  </label>
                  <select
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  >
                    <option value="Tech">🚀 Tech - Développement & Innovation</option>
                    <option value="RH">👥 RH - Ressources Humaines</option>
                    <option value="Marketing">📈 Marketing - Communication & Growth</option>
                    <option value="Finance">💰 Finance - Gestion & Comptabilité</option>
                    <option value="Ops">⚙️ Ops - Opérations & Support</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Domaine principal d&apos;intervention de la squad
                  </p>
                </div>
              </div>
            </div>

            {/* Mission et objectifs */}
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-gray-400" />
                Mission et objectifs
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description de la mission
                  </label>
                  <textarea
                    value={form.mission}
                    onChange={(e) => setForm({ ...form, mission: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Décrivez la mission principale de cette squad, ses objectifs et son périmètre d'intervention..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Optionnel - Décrivez les objectifs et responsabilités de la squad (max 800 caractères)
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">💡 Conseils pour créer une squad efficace</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Choisissez un nom évocateur et mémorable</li>
                    <li>• Définissez clairement le domaine d&apos;expertise</li>
                    <li>• Une mission précise aide les agents à mieux collaborer</li>
                    <li>• Vous pourrez ajouter des agents après la création</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-4">
            <Link
              href="/cockpit/admin/squads"
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
                  Créer la squad
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