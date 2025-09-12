'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Info, Settings, Layers, Save, Search, User, Building, Briefcase, Zap, Cpu } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Client {
  id: string;
  nom: string;
}

interface Project {
  id: string;
  nom: string;
  client_id: string;
}

interface AgentForm {
  name: string;
  role: string;
  domaine: string;
  client_id: string;
  project_id: string;
  instructions_personnalisees: string;
  temperature: number;
  max_tokens: number;
}

const initialForm: AgentForm = {
  name: '',
  role: '',
  domaine: 'Tech',
  client_id: '',
  project_id: '',
  instructions_personnalisees: '',
  temperature: 0.7,
  max_tokens: 2000
};

const domaines = [
  { value: 'Tech', label: '🚀 Tech - Développement & Innovation', color: 'border-blue-500/50 bg-blue-500/10' },
  { value: 'RH', label: '👥 RH - Ressources Humaines', color: 'border-green-500/50 bg-green-500/10' },
  { value: 'Marketing', label: '📈 Marketing - Communication & Growth', color: 'border-purple-500/50 bg-purple-500/10' },
  { value: 'Finance', label: '💰 Finance - Gestion & Comptabilité', color: 'border-yellow-500/50 bg-yellow-500/10' },
  { value: 'Ops', label: '⚙️ Ops - Opérations & Support', color: 'border-gray-500/50 bg-gray-500/10' },
  { value: 'Autre', label: '🔧 Autre - Domaine spécialisé', color: 'border-orange-500/50 bg-orange-500/10' }
];

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AgentForm>(initialForm);

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (form.client_id) {
      const clientProjects = projects.filter(p => p.client_id === form.client_id);
      setFilteredProjects(clientProjects);
      // Reset project selection when client changes
      if (!clientProjects.find(p => p.id === form.project_id)) {
        setForm(prev => ({ ...prev, project_id: '' }));
      }
    } else {
      setFilteredProjects([]);
      setForm(prev => ({ ...prev, project_id: '' }));
    }
  }, [form.client_id, projects]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.role || !form.domaine) {
      setError('Veuillez remplir tous les champs obligatoires (nom, rôle et domaine)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/agents', {
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

      const newAgent = await response.json();
      router.push(`/cockpit/admin/agents/${newAgent.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDomaine = () => domaines.find(d => d.value === form.domaine) || domaines[0];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/cockpit/admin/agents"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Nouvel Agent IA</h1>
                <p className="text-sm text-gray-300 mt-1">
                  Administration - Création d&apos;un nouvel agent intelligent
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          <div className="space-y-8">
            {/* Agent Identity */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-gray-400" />
                  Identité de l&apos;agent
                </h2>
                <p className="text-sm text-gray-400">
                  Définissez qui est cet agent et quel sera son rôle principal
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom de l&apos;agent *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Ex: Assistant RH Principal, Dev Lead Bot..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rôle spécialisé *
                    </label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Ex: Développeur React, Recruteur Senior..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Domaine d&apos;expertise *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {domaines.map((domaine) => (
                      <div key={domaine.value} className="relative">
                        <input
                          type="radio"
                          id={domaine.value}
                          name="domaine"
                          value={domaine.value}
                          checked={form.domaine === domaine.value}
                          onChange={(e) => setForm({ ...form, domaine: e.target.value })}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={domaine.value}
                          className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            form.domaine === domaine.value
                              ? `${domaine.color} border-opacity-100`
                              : 'border-gray-600 bg-gray-800 hover:bg-gray-750'
                          } peer-focus:ring-2 peer-focus:ring-blue-500`}
                        >
                          <div className="text-sm font-medium text-white">
                            {domaine.label}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Assignment */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  Affectation projet
                </h2>
                <p className="text-sm text-gray-400">
                  Optionnel - Assignez cet agent à un client et un projet spécifique
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Client
                    </label>
                    <select
                      value={form.client_id}
                      onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    >
                      <option value="">Aucun client spécifique</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Projet
                    </label>
                    <select
                      value={form.project_id}
                      onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                      disabled={!form.client_id}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!form.client_id ? 'Sélectionnez d\'abord un client' : 'Aucun projet spécifique'}
                      </option>
                      {filteredProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-gray-400" />
                  Configuration avancée
                </h2>
                <p className="text-sm text-gray-400">
                  Personnalisez le comportement et les instructions spécifiques de l&apos;agent
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instructions personnalisées
                  </label>
                  <textarea
                    value={form.instructions_personnalisees}
                    onChange={(e) => setForm({ ...form, instructions_personnalisees: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Instructions spécifiques pour cet agent..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Ces instructions seront ajoutées au prompt de base de l&apos;agent
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Zap className="w-4 h-4 inline mr-1" />
                      Température (créativité)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={form.temperature}
                        onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Précis (0)</span>
                        <span className="text-white font-medium">{form.temperature}</span>
                        <span>Créatif (1)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Cpu className="w-4 h-4 inline mr-1" />
                      Tokens maximum
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="4000"
                      step="100"
                      value={form.max_tokens}
                      onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Limite de longueur pour les réponses de l&apos;agent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              href="/cockpit/admin/agents"
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Créer l&apos;agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}