'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, Users, Target, Building, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../../components/AdminNavigation';
import AdminProtection from '../../../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SquadForm {
  name: string;
  mission: string;
  domain: 'RH' | 'Tech' | 'Marketing' | 'Finance' | 'Ops';
  status?: string;
  slug?: string;
}

interface SquadData extends SquadForm {
  id: string;
  slug: string;
  status: string;
}

export default function AdminSquadEditPage() {
  const router = useRouter();
  const params = useParams();
  const squadId = params.id as string;

  const [squadData, setSquadData] = useState<SquadData | null>(null);
  const [form, setForm] = useState<SquadForm>({
    name: '',
    mission: '',
    domain: 'Tech'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchSquad = async () => {
      try {
        const response = await fetch(`/api/admin/squads/${squadId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement');
        }
        const data = await response.json();
        const squadData = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          mission: data.mission || '',
          domain: data.domain,
          status: data.status
        };
        setSquadData(squadData);
        setForm({
          name: squadData.name,
          mission: squadData.mission,
          domain: squadData.domain as SquadForm['domain']
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (squadId) {
      fetchSquad();
    }
  }, [squadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name || !form.domain) {
      setError('Veuillez remplir tous les champs obligatoires (nom et domaine)');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/squads/${squadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-Id': `trace-${Date.now()}`
        },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          mission: form.mission,
          domain: form.domain
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la modification');
      }

      router.push(`/cockpit/admin/squads/${squadId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/squads/${squadId}`, {
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

      router.push('/cockpit/admin/squads');
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

  if (error && !squadData) {
    return (
      <AdminProtection allowedRoles={['admin', 'manager']}>
        <div className="min-h-screen console-theme flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <Link href="/cockpit/admin/squads" className="text-blue-400 hover:text-blue-300">
              ← Retour aux squads
            </Link>
          </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
      <div className="min-h-screen console-theme">
        {/* Admin Navigation */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <AdminNavigation />

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href={`/cockpit/admin/squads/${squadId}`}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Modifier la squad</h1>
                <p className="text-sm text-gray-300 mt-1">
                  Administration - Modification d&apos;une squad d&apos;agents
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
                    <h3 className="text-sm font-medium text-gray-300 mb-2">💡 Conseils pour modifier une squad efficace</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Vérifiez que le nom reste évocateur et mémorable</li>
                      <li>• Ajustez le domaine si nécessaire selon l&apos;évolution</li>
                      <li>• Une mission à jour aide les agents à mieux collaborer</li>
                      <li>• Les modifications impactent les agents existants</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-4">
              <Link
                href={`/cockpit/admin/squads/${squadId}`}
                className="px-4 py-2 text-gray-700 hover:text-white transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Modifier la squad
                  </>
                )}
              </button>
            </div>
          </form>
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
                  <h3 className="text-lg font-semibold text-white">Supprimer la squad</h3>
                  <p className="text-sm text-gray-400">Cette action est irréversible</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer la squad "{squadData?.name}" ?
                Tous les membres seront également dissociés.
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
    </AdminProtection>
  );
}