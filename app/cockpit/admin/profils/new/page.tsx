'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Save, Eye, Plus, Trash2, Settings,
  User, Brain, Shield, FileText, Tag, Building, Star
} from 'lucide-react';
import { getCurrentRole } from '../../../../../lib/auth/role';
import ResponsiveWrapper from '../../../components/ResponsiveWrapper';
import AdminNavigation from '../../components/AdminNavigation';
import AdminProtection from '../../components/AdminProtection';

// B30 Créateur de Profil - Wizard 3 étapes
export default function CreateurProfil() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // État du formulaire profil
  const [profil, setProfil] = useState({
    // Étape 1: Identité
    nom: '',
    domaine: '',
    secteurs_cibles: [],
    description_courte: '',
    identity_prompt: '',
    mission_prompt: '',
    personality_prompt: '',
    tags: [],

    // Étape 2: Expertise
    expertise_sections: [],

    // Étape 3: Périmètre
    scope_sections: [],

    // Métadonnées
    visibilite: 'private',
  });

  useEffect(() => {
    setUserRole(getCurrentRole());
  }, []);

  const canCreateProfils = ['admin', 'manager', 'user'].includes(userRole) || userRole === null || userRole === 'viewer'; // Allow creation for now

  const domaines = [
    { value: 'Finance', label: '💼 Finance', icon: '💼' },
    { value: 'RH', label: '👥 RH', icon: '👥' },
    { value: 'Marketing', label: '📈 Marketing', icon: '📈' },
    { value: 'Tech', label: '⚙️ Tech', icon: '⚙️' },
    { value: 'Ventes', label: '💰 Ventes', icon: '💰' },
    { value: 'Operations', label: '🔧 Opérations', icon: '🔧' }
  ];

  const secteurs = [
    'Manufacturing', 'Retail', 'Services', 'E-commerce', 'Tech',
    'Healthcare', 'Education', 'Finance', 'Consulting', 'Real Estate'
  ];

  // Templates expertise pré-définis
  const expertiseTemplates = {
    Finance: [
      {
        nom: 'comptabilite_generale',
        label: 'Comptabilité Générale',
        trigger_keywords: ['comptabilité', 'bilan', 'SIG', 'compte'],
        prompt_template: 'Tu maîtrises la comptabilité générale PME avec expertise en...'
      },
      {
        nom: 'fiscalite_optimisation',
        label: 'Fiscalité & Optimisation',
        trigger_keywords: ['fiscal', 'TVA', 'IS', 'optimisation'],
        prompt_template: 'Tu optimises la fiscalité PME selon les dernières réglementations...'
      }
    ],
    RH: [
      {
        nom: 'recrutement_efficace',
        label: 'Recrutement Efficace',
        trigger_keywords: ['recrutement', 'embauche', 'candidat', 'entretien'],
        prompt_template: 'Tu maîtrises le recrutement PME efficient avec processus structuré...'
      }
    ],
    Tech: [
      {
        nom: 'architecture_review',
        label: 'Architecture Review',
        trigger_keywords: ['architecture', 'design', 'système', 'scalabilité'],
        prompt_template: 'Tu évalues l\'architecture système avec méthodologie C4...'
      }
    ]
  };

  // Templates périmètre pré-définis
  const scopeTemplates = [
    {
      nom: 'responsibilities_core',
      label: 'Responsabilités Core',
      prompt_template: 'Tes responsabilités de base incluent...'
    },
    {
      nom: 'forbidden_actions',
      label: 'Actions Interdites',
      prompt_template: 'Tu ne fais JAMAIS...'
    },
    {
      nom: 'escalation_rules',
      label: 'Règles d\'Escalade',
      prompt_template: 'Tu escalades vers humain quand...'
    }
  ];

  const updateProfil = (field: string, value: any) => {
    setProfil(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !profil.tags.includes(tag)) {
      updateProfil('tags', [...profil.tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateProfil('tags', profil.tags.filter(tag => tag !== tagToRemove));
  };

  const addSecteur = (secteur: string) => {
    if (!profil.secteurs_cibles.includes(secteur)) {
      updateProfil('secteurs_cibles', [...profil.secteurs_cibles, secteur]);
    }
  };

  const removeSecteur = (secteurToRemove: string) => {
    updateProfil('secteurs_cibles', profil.secteurs_cibles.filter(s => s !== secteurToRemove));
  };

  const addExpertiseSection = (template: any = null) => {
    const newSection = {
      id: Date.now().toString(),
      nom: template?.nom || '',
      label: template?.label || '',
      trigger_keywords: template?.trigger_keywords || [],
      prompt: template?.prompt_template || ''
    };

    updateProfil('expertise_sections', [...profil.expertise_sections, newSection]);
  };

  const updateExpertiseSection = (id: string, field: string, value: any) => {
    const updated = profil.expertise_sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    );
    updateProfil('expertise_sections', updated);
  };

  const removeExpertiseSection = (id: string) => {
    updateProfil('expertise_sections', profil.expertise_sections.filter(s => s.id !== id));
  };

  const addScopeSection = (template: any = null) => {
    const newSection = {
      id: Date.now().toString(),
      nom: template?.nom || '',
      label: template?.label || '',
      prompt: template?.prompt_template || ''
    };

    updateProfil('scope_sections', [...profil.scope_sections, newSection]);
  };

  const updateScopeSection = (id: string, field: string, value: any) => {
    const updated = profil.scope_sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    );
    updateProfil('scope_sections', updated);
  };

  const removeScopeSection = (id: string) => {
    updateProfil('scope_sections', profil.scope_sections.filter(s => s.id !== id));
  };

  const handleSave = async (draft = true) => {
    setSaving(true);
    try {
      // Connexion à l'API B30 POST /api/b30/profils
      const response = await fetch('/api/b30/profils', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          nom: profil.nom || 'Profil Test',
          domaine: profil.domaine || 'Finance',
          secteurs_cibles: profil.secteurs_cibles.length > 0 ? profil.secteurs_cibles : ['Manufacturing'],
          niveau_complexite: 'intermediate',
          description_courte: profil.description_courte || 'Description courte du profil créé via le wizard B30',
          competences_cles: profil.expertise_sections.length > 0
            ? profil.expertise_sections.map(s => s.nom)
            : ['Compétence par défaut'],
          exemples_taches: profil.expertise_sections.length > 0
            ? profil.expertise_sections.flatMap(s => s.contenu ? [s.contenu.slice(0, 100)] : [])
            : ['Tâche exemple par défaut', 'Autre tâche exemple'],
          identity_prompt: profil.identity_prompt || 'Tu es un expert spécialisé dans ce domaine avec une grande expérience.',
          mission_prompt: profil.mission_prompt,
          personality_prompt: profil.personality_prompt,
          sections_expertise: profil.expertise_sections,
          sections_scope: profil.scope_sections,
          visibilite: profil.visibilite || 'private',
          tags: profil.tags.length > 0 ? profil.tags : ['wizard-created']
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profil créé:', data);
        // Rediriger vers marketplace
        window.location.href = '/cockpit/admin/profils';
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-8 mb-8">
      <div className={`flex items-center space-x-3 ${currentStep >= 1 ? 'text-orange-400' : 'text-gray-400'}`}>
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200 ${
          currentStep >= 1 ? 'border-orange-400 bg-orange-400 text-white' : 'border-gray-400 text-gray-400'
        }`}>
          {currentStep > 1 ? '✓' : '1'}
        </div>
        <div className="hidden md:block">
          <div className={`font-semibold ${currentStep >= 1 ? 'text-white' : 'text-gray-400'}`}>
            Identité
          </div>
          <div className="text-sm text-gray-500">Informations de base</div>
        </div>
      </div>

      <div className={`flex-1 h-0.5 max-w-16 ${currentStep >= 2 ? 'bg-orange-400' : 'bg-gray-600'} rounded`}></div>

      <div className={`flex items-center space-x-3 ${currentStep >= 2 ? 'text-orange-400' : 'text-gray-400'}`}>
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200 ${
          currentStep >= 2 ? 'border-orange-400 bg-orange-400 text-white' : 'border-gray-400 text-gray-400'
        }`}>
          {currentStep > 2 ? '✓' : '2'}
        </div>
        <div className="hidden md:block">
          <div className={`font-semibold ${currentStep >= 2 ? 'text-white' : 'text-gray-400'}`}>
            Expertise
          </div>
          <div className="text-sm text-gray-500">Sections modulaires</div>
        </div>
      </div>

      <div className={`flex-1 h-0.5 max-w-16 ${currentStep >= 3 ? 'bg-orange-400' : 'bg-gray-600'} rounded`}></div>

      <div className={`flex items-center space-x-3 ${currentStep >= 3 ? 'text-orange-400' : 'text-gray-400'}`}>
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200 ${
          currentStep >= 3 ? 'border-orange-400 bg-orange-400 text-white' : 'border-gray-400 text-gray-400'
        }`}>
          3
        </div>
        <div className="hidden md:block">
          <div className={`font-semibold ${currentStep >= 3 ? 'text-white' : 'text-gray-400'}`}>
            Périmètre
          </div>
          <div className="text-sm text-gray-500">Responsabilités</div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
          <span className="text-4xl">🎯</span>
          <span>Identité du Profil</span>
          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Étape 1/3
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations de base */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du profil *
              </label>
              <input
                type="text"
                value={profil.nom}
                onChange={(e) => updateProfil('nom', e.target.value)}
                placeholder="Expert Comptable PME"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Domaine principal *
              </label>
              <select
                value={profil.domaine}
                onChange={(e) => updateProfil('domaine', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Sélectionner un domaine</option>
                {domaines.map(domaine => (
                  <option key={domaine.value} value={domaine.value}>
                    {domaine.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description courte *
              </label>
              <textarea
                value={profil.description_courte}
                onChange={(e) => updateProfil('description_courte', e.target.value)}
                placeholder="Expert en comptabilité PME avec 15 ans d'expérience industrielle"
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secteurs cibles
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profil.secteurs_cibles.map(secteur => (
                  <span
                    key={secteur}
                    className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm flex items-center space-x-2 font-medium"
                  >
                    <span>{secteur}</span>
                    <Trash2
                      size={14}
                      className="cursor-pointer hover:text-red-300"
                      onClick={() => removeSecteur(secteur)}
                    />
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addSecteur(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Ajouter un secteur</option>
                {secteurs.filter(s => !profil.secteurs_cibles.includes(s)).map(secteur => (
                  <option key={secteur} value={secteur}>{secteur}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompts identité */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Identity Prompt *
              </label>
              <textarea
                value={profil.identity_prompt}
                onChange={(e) => updateProfil('identity_prompt', e.target.value)}
                placeholder="Tu es un expert-comptable avec 15 ans d'expérience PME. Tu combines vision stratégique et maîtrise opérationnelle."
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mission Prompt *
              </label>
              <textarea
                value={profil.mission_prompt}
                onChange={(e) => updateProfil('mission_prompt', e.target.value)}
                placeholder="Ta mission est d'accompagner les dirigeants PME dans leurs décisions financières et optimisations fiscales."
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Style de Communication
              </label>
              <textarea
                value={profil.personality_prompt}
                onChange={(e) => updateProfil('personality_prompt', e.target.value)}
                placeholder="Style professionnel mais accessible. Tu vulgarises sans simplifier."
                rows={2}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
          <span className="text-4xl">🧠</span>
          <span>Sections d'Expertise</span>
          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Étape 2/3
          </span>
        </h2>

        <div className="space-y-6">
          {profil.expertise_sections.map(section => (
            <div key={section.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={section.label}
                  onChange={(e) => updateExpertiseSection(section.id, 'label', e.target.value)}
                  placeholder="Nom de la section"
                  className="text-lg font-semibold bg-transparent text-white border-none outline-none flex-1"
                />
                <button
                  onClick={() => removeExpertiseSection(section.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mots-clés déclencheurs
                  </label>
                  <input
                    type="text"
                    value={section.trigger_keywords?.join(', ') || ''}
                    onChange={(e) => updateExpertiseSection(
                      section.id,
                      'trigger_keywords',
                      e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    )}
                    placeholder="comptabilité, bilan, SIG"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Identifiant technique
                  </label>
                  <input
                    type="text"
                    value={section.nom}
                    onChange={(e) => updateExpertiseSection(section.id, 'nom', e.target.value)}
                    placeholder="comptabilite_generale"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt d'expertise
                </label>
                <textarea
                  value={section.prompt}
                  onChange={(e) => updateExpertiseSection(section.id, 'prompt', e.target.value)}
                  placeholder="Tu maîtrises la comptabilité générale PME avec expertise en..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center space-x-4">
            <button
              onClick={() => addExpertiseSection()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Ajouter Section</span>
            </button>

            {profil.domaine && expertiseTemplates[profil.domaine] && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Templates suggérés:</span>
                {expertiseTemplates[profil.domaine].map(template => (
                  <button
                    key={template.nom}
                    onClick={() => addExpertiseSection(template)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
          <span className="text-4xl">🛡️</span>
          <span>Périmètre & Responsabilités</span>
          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Étape 3/3
          </span>
        </h2>

        <div className="space-y-6">
          {profil.scope_sections.map(section => (
            <div key={section.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={section.label}
                  onChange={(e) => updateScopeSection(section.id, 'label', e.target.value)}
                  placeholder="Nom de la section"
                  className="text-lg font-semibold bg-transparent text-white border-none outline-none flex-1"
                />
                <button
                  onClick={() => removeScopeSection(section.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Identifiant technique
                </label>
                <input
                  type="text"
                  value={section.nom}
                  onChange={(e) => updateScopeSection(section.id, 'nom', e.target.value)}
                  placeholder="responsibilities_core"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Règles de périmètre
                </label>
                <textarea
                  value={section.prompt}
                  onChange={(e) => updateScopeSection(section.id, 'prompt', e.target.value)}
                  placeholder="Tes responsabilités de base incluent..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center space-x-4">
            <button
              onClick={() => addScopeSection()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Ajouter Section</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Templates:</span>
              {scopeTemplates.map(template => (
                <button
                  key={template.nom}
                  onClick={() => addScopeSection(template)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration publication */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Configuration de Publication</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visibilité
                </label>
                <select
                  value={profil.visibilite}
                  onChange={(e) => updateProfil('visibilite', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="private">🔒 Privé</option>
                  <option value="internal">🏢 Interne</option>
                  <option value="public">🌍 Public</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!canCreateProfils) {
    return (
      <AdminProtection allowedRoles={['admin', 'manager']}>
        <div className="console-theme min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Shield size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Accès Restreint</h2>
            <p className="text-gray-400">Vous devez être Manager ou Admin pour créer des profils.</p>
          </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
      <ResponsiveWrapper
        currentPath="/cockpit/admin/profils/new"
        userRole={userRole}
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0"
        innerClassName="max-w-none mx-0"
      >
        {/* Admin Navigation */}
        <AdminNavigation />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/cockpit/admin/profils'}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span className="text-4xl">🟠</span>
              <span>Créer un Profil d'Expertise</span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Aperçu</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Brouillon</span>
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving || !profil.nom || !profil.domaine}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Star size={16} />
              <span>Publier</span>
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 disabled:text-gray-500 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Précédent</span>
          </button>

          <span className="text-gray-400">
            Étape {currentStep} sur 3
          </span>

          <button
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            disabled={currentStep === 3}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 text-white disabled:text-gray-500 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>Suivant</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {saving && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
                <span className="text-white">Sauvegarde en cours...</span>
              </div>
            </div>
          </div>
        )}
      </ResponsiveWrapper>
    </AdminProtection>
  );
}