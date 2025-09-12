'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, Building, User, Mail, Phone, Globe, Edit, Trash2, Archive, CheckCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Client {
  id: string;
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
  statut: 'actif' | 'inactif' | 'archive';
  projets_count?: number;
  projets_actifs?: number;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Client non trouvé');
        }
        throw new Error('Échec du chargement du client');
      }
      
      const data = await response.json();
      setClient(data);
      setForm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'X-Trace-Id': `trace-${Date.now()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la mise à jour');
      }

      setClient(data);
      setForm(data);
      setEditMode(false);
      setSuccess('Client mis à jour avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce client ?')) return;
    
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'X-Trace-Id': `trace-${Date.now()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ...form, statut: 'archive' })
      });

      if (!response.ok) throw new Error('Échec de l\'archivage');
      
      setSuccess('Client archivé');
      router.push('/cockpit/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'archivage');
    }
  };

  const updateContactField = (field: string, value: string) => {
    if (!form) return;
    setForm({
      ...form,
      contact_principal: {
        ...form.contact_principal,
        [field]: value
      }
    });
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'text-green-400 bg-green-500/10';
      case 'inactif': return 'text-yellow-400 bg-yellow-500/10';
      case 'archive': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1621] flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="min-h-screen bg-[#0F1621] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Erreur</h2>
            <p className="text-slate-400">{error}</p>
            <button
              onClick={() => router.push('/cockpit/clients')}
              className="mt-4 px-4 py-2 bg-[#1A2332] rounded-lg hover:bg-[#2A3441] transition-colors"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!client || !form) return null;

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{client.nom}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.statut)}`}>
                  {client.statut}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{client.secteur} • {client.taille}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={handleArchive}
                  className="px-4 py-2 border border-[#2A3441] rounded-lg hover:bg-[#1A2332] transition-colors flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Archiver
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setForm(client);
                    setEditMode(false);
                  }}
                  className="px-4 py-2 border border-[#2A3441] rounded-lg hover:bg-[#1A2332] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-6">
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-400">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400">{success}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1A2332] rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Projets totaux</div>
              <div className="text-2xl font-bold">{client.projets_count || 0}</div>
            </div>
            <div className="bg-[#1A2332] rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Projets actifs</div>
              <div className="text-2xl font-bold text-green-400">{client.projets_actifs || 0}</div>
            </div>
            <div className="bg-[#1A2332] rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Effectifs</div>
              <div className="text-2xl font-bold">{client.effectifs || 'N/A'}</div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informations générales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Nom de l&apos;entreprise</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => setForm({...form, nom: e.target.value})}
                      className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-slate-200">{client.nom}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Secteur</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={form.secteur}
                      onChange={(e) => setForm({...form, secteur: e.target.value})}
                      className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-slate-200">{client.secteur}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Taille</label>
                  {editMode ? (
                    <select
                      value={form.taille}
                      onChange={(e) => setForm({...form, taille: e.target.value as Client['taille']})}
                      className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="TPE">TPE</option>
                      <option value="PME">PME</option>
                      <option value="ETI">ETI</option>
                      <option value="GE">Grande Entreprise</option>
                    </select>
                  ) : (
                    <div className="text-slate-200">{client.taille}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Site web</label>
                  {editMode ? (
                    <input
                      type="url"
                      value={form.site_web || ''}
                      onChange={(e) => setForm({...form, site_web: e.target.value})}
                      className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-slate-200">
                      {client.site_web ? (
                        <a href={client.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {client.site_web}
                        </a>
                      ) : 'N/A'}
                    </div>
                  )}
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
                  <label className="block text-sm font-medium mb-2 text-slate-400">Nom</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={form.contact_principal.nom}
                      onChange={(e) => updateContactField('nom', e.target.value)}
                      className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-slate-200">{client.contact_principal.nom}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Fonction</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={form.contact_principal.fonction}
                      onChange={(e) => updateContactField('fonction', e.target.value)}
                      className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-slate-200">{client.contact_principal.fonction || 'N/A'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Email</label>
                  {editMode ? (
                    <input
                      type="email"
                      value={form.contact_principal.email}
                      onChange={(e) => updateContactField('email', e.target.value)}
                      className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-slate-200">
                      <a href={`mailto:${client.contact_principal.email}`} className="text-blue-400 hover:underline">
                        {client.contact_principal.email}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Téléphone</label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={form.contact_principal.telephone}
                      onChange={(e) => updateContactField('telephone', e.target.value)}
                      className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-slate-200">
                      {client.contact_principal.telephone ? (
                        <a href={`tel:${client.contact_principal.telephone}`} className="text-blue-400 hover:underline">
                          {client.contact_principal.telephone}
                        </a>
                      ) : 'N/A'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contexte */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">Contexte & Notes</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-400">Contexte spécifique</label>
                {editMode ? (
                  <textarea
                    value={form.contexte_specifique}
                    onChange={(e) => setForm({...form, contexte_specifique: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    rows={4}
                  />
                ) : (
                  <div className="text-slate-200 whitespace-pre-wrap">
                    {client.contexte_specifique || 'Aucun contexte spécifique'}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Créé le</span>
                <span>{new Date(client.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Créé par</span>
                <span>{client.created_by}</span>
              </div>
              {client.updated_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Dernière modification</span>
                  <span>{new Date(client.updated_at).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}