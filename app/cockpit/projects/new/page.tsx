'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, Calendar, DollarSign, User, FileText } from 'lucide-react';
import ResponsiveWrapper from '../../components/ResponsiveWrapper';

interface Client {
  id: string;
  nom: string;
  secteur: string;
  taille: string;
}

interface ProjectForm {
  nom: string;
  description: string;
  client_id: string;
  budget: number | '';
  deadline: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  tags: string[];
  requirements: string[];
}

const initialForm: ProjectForm = {
  nom: '',
  description: '',
  client_id: '',
  budget: '',
  deadline: '',
  priority: 'normal',
  status: 'active',
  tags: [],
  requirements: []
};

export default function NewProjectPage() {
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const response = await fetch('/api/admin/clients', {
        headers: { 'X-Trace-Id': `trace-${Date.now()}` },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Échec du chargement des clients');
      
      const data = await response.json();
      setClients(data.items || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nom.trim() || !form.client_id) {
      setError('Le nom du projet et le client sont obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...form,
        budget: form.budget === '' ? undefined : Number(form.budget),
        deadline: form.deadline || undefined
      };

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'X-Trace-Id': `trace-${Date.now()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de création du projet');
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/cockpit/projects';
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, tags }));
  };

  const handleRequirementsChange = (value: string) => {
    const requirements = value.split('\n').map(req => req.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, requirements }));
  };

  if (success) {
    return (
      <ResponsiveWrapper>
        <div className="min-h-screen text-white p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-8 text-center">
              <div className="text-green-400 text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-2">Projet créé avec succès !</h2>
              <p className="text-gray-400 mb-4">Redirection vers la liste des projets...</p>
            </div>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper>
      <div className="min-h-screen text-white">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/cockpit/projects'}
                className="flex items-center space-x-2 text-gray-400 hover:text-white"
              >
                <ArrowLeft size={16} />
                <span>Retour aux projets</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <div>
                <h1 className="text-3xl font-bold">Créer un nouveau projet</h1>
                <p className="text-gray-400">Configurez un nouveau projet pour la collaboration client</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <FileText size={20} />
                  <span>Informations de base</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom du projet *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nom}
                      onChange={(e) => setForm(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Saisir le nom du projet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Client *
                    </label>
                    <select
                      required
                      value={form.client_id}
                      onChange={(e) => setForm(prev => ({ ...prev, client_id: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={clientsLoading}
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.nom} ({client.secteur})
                        </option>
                      ))}
                    </select>
                    {clientsLoading && (
                      <p className="text-sm text-gray-400 mt-1">Chargement des clients...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                      placeholder="Description du projet..."
                    />
                  </div>
                </div>
              </div>

              {/* Project Settings */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <User size={20} />
                  <span>Paramètres du projet</span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priorité
                      </label>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Faible</option>
                        <option value="normal">Normale</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Statut
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Actif</option>
                        <option value="paused">En pause</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Budget (€)
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.budget}
                        onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value ? parseFloat(e.target.value) : '' }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Échéance
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Détails supplémentaires</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={form.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="web, mobile, api"
                  />
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-900/30 text-blue-300 text-sm rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exigences (une par ligne)
                  </label>
                  <textarea
                    value={form.requirements.join('\n')}
                    onChange={(e) => handleRequirementsChange(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                    placeholder="Exigence 1&#10;Exigence 2&#10;Exigence 3"
                  />
                  {form.requirements.length > 0 && (
                    <div className="mt-2 text-sm text-gray-400">
                      {form.requirements.length} exigence(s) ajoutée(s)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => window.location.href = '/cockpit/projects'}
                className="px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={loading || !form.nom.trim() || !form.client_id}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition-colors"
              >
                <Save size={16} />
                <span>{loading ? 'Création...' : 'Créer le projet'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ResponsiveWrapper>
  );
}