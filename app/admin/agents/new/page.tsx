'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Info, Settings, Layers, Save, Search } from 'lucide-react';
import Link from 'next/link';

interface AgentTemplate {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  capabilities: string[];
  default_config: any;
  base_prompt: string;
}

interface Client {
  id: number;
  nom: string;
}

interface Project {
  id: number;
  nom: string;
  client_id: number;
}

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    domaine: '',
    client_id: '',
    project_id: '',
    wake_prompt: '',
    configuration: {
      temperature: 0.7,
      max_tokens: 2000,
      response_format: 'text',
      custom_instructions: ''
    }
  });

  useEffect(() => {
    fetchTemplates();
    fetchClients();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.client_id) {
      const filtered = projects.filter(p => p.client_id === parseInt(formData.client_id));
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [formData.client_id, projects]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/agents/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: `Agent ${template.name}`,
      role: template.slug,
      domaine: template.category,
      wake_prompt: template.base_prompt,
      configuration: {
        ...prev.configuration,
        ...template.default_config
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        template_id: selectedTemplate?.id,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
        status: 'active'
      };

      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/agents/${data.id}`);
      } else {
        const error = await res.json();
        alert(error.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Erreur lors de la création de l\'agent');
    } finally {
      setLoading(false);
    }
  };

  const templateCategories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/agents"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Créer un nouvel agent</h1>
              <p className="text-sm text-gray-500 mt-1">
                Configurez un agent intelligent pour automatiser vos processus
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Template Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Sélectionner un template
              </h2>
              
              {templateCategories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates
                      .filter(t => t.category === category)
                      .map(template => (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                          {template.capabilities && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.capabilities.slice(0, 3).map((cap, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {cap}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration de l&apos;agent
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;agent *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Assistant RH Principal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({...formData, client_id: e.target.value, project_id: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Projet
                    </label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!formData.client_id}
                    >
                      <option value="">Sélectionner un projet</option>
                      {filteredProjects.map(project => (
                        <option key={project.id} value={project.id}>{project.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions personnalisées
                  </label>
                  <textarea
                    value={formData.wake_prompt}
                    onChange={(e) => setFormData({...formData, wake_prompt: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Instructions spécifiques pour cet agent..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Température (créativité)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.configuration.temperature}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuration: {
                          ...formData.configuration,
                          temperature: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tokens maximum
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="8000"
                      step="100"
                      value={formData.configuration.max_tokens}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuration: {
                          ...formData.configuration,
                          max_tokens: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Context Hierarchy */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Hiérarchie de contexte
              </h3>
              
              <div className="space-y-3">
                <div className="pl-0">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium">Arka Global</span>
                  </div>
                </div>
                
                {formData.client_id && (
                  <div className="pl-4 border-l-2 border-gray-200 ml-1">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Client: {clients.find(c => c.id === parseInt(formData.client_id))?.nom}
                      </span>
                    </div>
                  </div>
                )}
                
                {formData.project_id && (
                  <div className="pl-8 border-l-2 border-gray-200 ml-1">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Projet: {projects.find(p => p.id === parseInt(formData.project_id))?.nom}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className={formData.project_id ? 'pl-12 border-l-2 border-gray-200 ml-1' : formData.client_id ? 'pl-8 border-l-2 border-gray-200 ml-1' : 'pl-4 border-l-2 border-gray-200 ml-1'}>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Agent: {formData.name || 'Nouvel Agent'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Propagation de contexte</p>
                    <p>Les configurations héritent automatiquement des niveaux supérieurs et peuvent être surchargées.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Template Info */}
            {selectedTemplate && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-3">Template sélectionné</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">{selectedTemplate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <p className="font-medium">{selectedTemplate.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Capacités</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTemplate.capabilities?.map((cap, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto mt-6 flex justify-end gap-3">
          <Link
            href="/admin/agents"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || !selectedTemplate || !formData.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Création...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Créer l&apos;agent
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}