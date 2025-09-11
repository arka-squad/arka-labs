'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, Users, Target, Calendar, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  nom: string;
  client_nom?: string;
  status: string;
}

interface SquadForm {
  nom: string;
  type: 'development' | 'design' | 'marketing' | 'data' | 'security' | 'mixed';
  description: string;
  objectifs: string[];
  project_id?: number;
  capacity: number;
  specialties: string[];
  availability: 'full-time' | 'part-time' | 'on-demand';
  status: 'active' | 'standby' | 'disbanded';
  configuration: {
    auto_assignment: boolean;
    max_concurrent_tasks: number;
    notification_preferences: string[];
    tools_access: string[];
  };
}

const initialForm: SquadForm = {
  nom: '',
  type: 'development',
  description: '',
  objectifs: [],
  project_id: undefined,
  capacity: 5,
  specialties: [],
  availability: 'full-time',
  status: 'active',
  configuration: {
    auto_assignment: true,
    max_concurrent_tasks: 3,
    notification_preferences: ['email', 'in-app'],
    tools_access: []
  }
};

export default function NewSquadPage() {
  const router = useRouter();
  const [form, setForm] = useState<SquadForm>(initialForm);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newObjectif, setNewObjectif] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await fetch('/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'X-Trace-Id': `trace-${Date.now()}`
        }
      });

      if (!response.ok) throw new Error('Échec du chargement des projets');
      
      const data = await response.json();
      setProjects(data.items || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nom.trim() || !form.description.trim()) {
      setError('Le nom et la description sont obligatoires');
      return;
    }

    if (form.objectifs.length === 0) {
      setError('Au moins un objectif est requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/squads', {
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
        throw new Error(data.error || 'Échec de la création de la squad');
      }

      router.push(`/cockpit/squads/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const addObjectif = () => {
    if (newObjectif.trim()) {
      setForm(prev => ({
        ...prev,
        objectifs: [...prev.objectifs, newObjectif.trim()]
      }));
      setNewObjectif('');
    }
  };

  const removeObjectif = (index: number) => {
    setForm(prev => ({
      ...prev,
      objectifs: prev.objectifs.filter((_, i) => i !== index)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setForm(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  return (
    
      <div className="min-h-screen bg-[#0F1621] text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A3441]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/cockpit/squads')}
              className="p-2 hover:bg-[#1A2332] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Nouvelle Squad</h1>
              <p className="text-slate-400 text-sm mt-1">Créer une nouvelle équipe autonome</p>
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
            {/* Informations de base */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Informations de base
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom de la squad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({...form, nom: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Squad Alpha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type de squad <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value as SquadForm['type']})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="development">Développement</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="data">Data & Analytics</option>
                    <option value="security">Sécurité</option>
                    <option value="mixed">Mixte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Projet assigné
                  </label>
                  <select
                    value={form.project_id || ''}
                    onChange={(e) => setForm({...form, project_id: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    disabled={projectsLoading}
                  >
                    <option value="">Aucun projet (squad libre)</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.nom} {project.client_nom && `(${project.client_nom})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Capacité (nombre de membres)
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({...form, capacity: parseInt(e.target.value) || 5})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Disponibilité
                  </label>
                  <select
                    value={form.availability}
                    onChange={(e) => setForm({...form, availability: e.target.value as SquadForm['availability']})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="full-time">Temps plein</option>
                    <option value="part-time">Temps partiel</option>
                    <option value="on-demand">Sur demande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Statut
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value as SquadForm['status']})}
                    className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="standby">En attente</option>
                    <option value="disbanded">Dissoute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Mission et rôle de la squad..."
                />
              </div>
            </div>

            {/* Objectifs */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5" />
                Objectifs <span className="text-red-500">*</span>
              </h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjectif}
                  onChange={(e) => setNewObjectif(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjectif())}
                  className="flex-1 px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Ajouter un objectif..."
                />
                <button
                  type="button"
                  onClick={addObjectif}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>

              <div className="space-y-2">
                {form.objectifs.map((obj, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0F1621] rounded-lg">
                    <span>{obj}</span>
                    <button
                      type="button"
                      onClick={() => removeObjectif(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {form.objectifs.length === 0 && (
                  <p className="text-slate-400 text-sm">Aucun objectif défini</p>
                )}
              </div>
            </div>

            {/* Spécialités */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Spécialités
              </h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                  className="flex-1 px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="React, Node.js, Python, DevOps..."
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.specialties.map((spec, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-1">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="text-blue-300 hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-[#1A2332] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configuration avancée
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.configuration.auto_assignment}
                    onChange={(e) => setForm({
                      ...form,
                      configuration: {
                        ...form.configuration,
                        auto_assignment: e.target.checked
                      }
                    })}
                    className="w-4 h-4 rounded"
                  />
                  <span>Assignation automatique des tâches</span>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tâches concurrentes maximum
                  </label>
                  <input
                    type="number"
                    value={form.configuration.max_concurrent_tasks}
                    onChange={(e) => setForm({
                      ...form,
                      configuration: {
                        ...form.configuration,
                        max_concurrent_tasks: parseInt(e.target.value) || 3
                      }
                    })}
                    className="w-full max-w-xs px-4 py-2 bg-[#0F1621] border border-[#2A3441] rounded-lg focus:border-blue-500 focus:outline-none"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/cockpit/squads')}
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
                {loading ? 'Création...' : 'Créer la squad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    
  );
}