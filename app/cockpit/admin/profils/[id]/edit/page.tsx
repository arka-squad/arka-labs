'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Plus, Trash2, Eye } from 'lucide-react';
import AdminNavigation from '../../../components/AdminNavigation';

interface ProfilEdit {
  id: string;
  nom: string;
  domaine: string;
  secteurs_cibles: string[];
  niveau_complexite: string;
  tags: string[];
  description_courte: string;
  description_complete?: string;
  competences_cles: string[];
  methodologie?: string;
  outils_maitrises: string[];
  exemples_taches: string[];
  cas_usage: string[];
  limites_explicites: string[];
  identity_prompt: string;
  mission_prompt?: string;
  personality_prompt?: string;
  prompt_regles_livraisons?: string;
  prompt_regles_discussion?: string;
  specifications_cadrage: string[];
  visibilite: string;
  sections_expertise: any[];
  sections_scope: any[];
}

export default function EditProfilPage() {
  const params = useParams();
  const router = useRouter();
  const profilId = params?.id as string;

  const [profil, setProfil] = useState<ProfilEdit>({
    id: '',
    nom: '',
    domaine: 'Finance',
    secteurs_cibles: [],
    niveau_complexite: 'intermediate',
    tags: [],
    description_courte: '',
    description_complete: '',
    competences_cles: [],
    methodologie: '',
    outils_maitrises: [],
    exemples_taches: [],
    cas_usage: [],
    limites_explicites: [],
    identity_prompt: '',
    mission_prompt: '',
    personality_prompt: '',
    prompt_regles_livraisons: '',
    prompt_regles_discussion: '',
    specifications_cadrage: [],
    visibilite: 'private',
    sections_expertise: [],
    sections_scope: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newCompetence, setNewCompetence] = useState('');
  const [newTache, setNewTache] = useState('');
  const [newOutil, setNewOutil] = useState('');
  const [newLimite, setNewLimite] = useState('');
  const [newCasUsage, setNewCasUsage] = useState('');
  const [newSpecification, setNewSpecification] = useState('');

  useEffect(() => {
    if (profilId) {
      loadProfil(profilId);
    }
  }, [profilId]);

  const loadProfil = async (id: string) => {
    setLoading(true);
    try {
      // Mock data - sera remplacé par API
      const mockProfil: ProfilEdit = {
        id,
        nom: 'Expert Comptable PME',
        domaine: 'Finance',
        secteurs_cibles: ['Manufacturing', 'Retail'],
        niveau_complexite: 'advanced',
        tags: ['comptabilité', 'pme', 'audit'],
        description_courte: 'Expert en comptabilité PME avec 15 ans d\'expérience industrielle',
        description_complete: 'Spécialiste de la comptabilité pour PME industrielles et commerciales avec une expertise approfondie des processus comptables, de la fiscalité et de l\'analyse financière.',
        competences_cles: ['Comptabilité générale', 'Fiscalité PME', 'Analyse financière', 'Audit interne'],
        methodologie: 'Approche méthodique basée sur les bonnes pratiques comptables et l\'analyse des besoins spécifiques de chaque entreprise.',
        outils_maitrises: ['SAP', 'QuickBooks', 'Excel', 'Sage'],
        exemples_taches: [
          'Établissement des comptes annuels',
          'Analyse des ratios financiers',
          'Optimisation fiscale PME',
          'Mise en place de procédures comptables'
        ],
        cas_usage: ['Audit comptable trimestriel', 'Préparation budget prévisionnel', 'Consolidation comptable'],
        limites_explicites: ['Pas de conseil juridique', 'Pas d\'audit externe certifié'],
        identity_prompt: 'Tu es un expert-comptable spécialisé dans les PME avec 15 ans d\'expérience.',
        mission_prompt: 'Ta mission est d\'accompagner les dirigeants PME dans leur gestion financière.',
        personality_prompt: 'Tu es rigoureux, pédagogue et pragmatique.',
        prompt_regles_livraisons: '## Règles de Livraisons - Expert Comptable PME\n\n**Format de livrables :**\n- Rapports comptables au format PDF avec tableaux Excel joints\n- Analyses financières avec graphiques et KPIs visuels\n- Recommandations actionables avec timeline précise\n\n**Standards qualité :**\n- Vérification croisée sur tous les calculs\n- Sources et références pour chaque donnée\n- Résumé exécutif de maximum 2 pages\n\n**Escalade :**\n- Audit externe certifié → Orienter vers un CAC\n- Litiges complexes → Orienter vers un expert judiciaire\n- Fiscalité internationale → Orienter vers un spécialiste\n- Financement > 500K€ → Orienter vers un expert en corporate finance',
        prompt_regles_discussion: '## Règles de Discussion - Expert Comptable PME\n\n**Communication :**\n- Vulgariser les termes techniques\n- Toujours demander le contexte business avant de répondre\n- Proposer des solutions graduées (court/moyen/long terme)\n\n**Limites éthiques :**\n- Ne jamais conseiller d\'optimisation fiscale agressive\n- Rappeler les obligations légales en cas d\'irrégularité détectée\n- Orienter vers un avocat pour tout aspect juridique\n\n**Pédagogie :**\n- Expliquer les "pourquoi" derrière chaque recommandation\n- Donner des exemples concrets sectoriels\n- Proposer des outils de suivi simples',
        specifications_cadrage: ['Connaissance', 'Pertinence', 'Invitation', 'Faisabilité', 'Clarification', 'Cadrage', 'DoD', 'Clarté'],
        visibilite: 'public',
        sections_expertise: [],
        sections_scope: []
      };

      setProfil(mockProfil);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock save - sera remplacé par API PUT
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Profil sauvegardé:', profil);
      router.push(`/cockpit/admin/profils/${profilId}`);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const addToArray = (field: keyof ProfilEdit, value: string, setValue: (val: string) => void) => {
    if (value.trim()) {
      setProfil(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromArray = (field: keyof ProfilEdit, index: number) => {
    setProfil(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: 'var(--bg)' }}>
      <AdminNavigation />

      <div className="max-w-none mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Édition du Profil</h1>
              <p className="text-gray-400">Modifiez tous les aspects du profil</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/cockpit/admin/profils/${profilId}`)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Aperçu</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Informations générales</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du profil *</label>
                  <input
                    type="text"
                    value={profil.nom}
                    onChange={(e) => setProfil(prev => ({ ...prev, nom: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Domaine *</label>
                  <select
                    value={profil.domaine}
                    onChange={(e) => setProfil(prev => ({ ...prev, domaine: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                  >
                    <option value="Finance">Finance</option>
                    <option value="RH">RH</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Tech">Tech</option>
                    <option value="Legal">Legal</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Niveau de complexité</label>
                  <select
                    value={profil.niveau_complexite}
                    onChange={(e) => setProfil(prev => ({ ...prev, niveau_complexite: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                  >
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Visibilité</label>
                  <select
                    value={profil.visibilite}
                    onChange={(e) => setProfil(prev => ({ ...prev, visibilite: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                  >
                    <option value="private">Privé</option>
                    <option value="internal">Interne</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Tags</h2>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nouveau tag"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                />
                <button
                  onClick={() => addToArray('tags', newTag, setNewTag)}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profil.tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm">
                    <span>{tag}</span>
                    <button
                      onClick={() => removeFromArray('tags', index)}
                      className="text-orange-400 hover:text-orange-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences clés */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Compétences clés</h2>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newCompetence}
                  onChange={(e) => setNewCompetence(e.target.value)}
                  placeholder="Nouvelle compétence"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                />
                <button
                  onClick={() => addToArray('competences_cles', newCompetence, setNewCompetence)}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {profil.competences_cles.map((competence, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <span className="text-sm">{competence}</span>
                    <button
                      onClick={() => removeFromArray('competences_cles', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Secteurs cibles */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Secteurs cibles</h2>

              <div className="flex flex-wrap gap-2">
                {['Manufacturing', 'Retail', 'Services', 'FinTech', 'Healthcare', 'E-commerce', 'SaaS'].map((secteur) => (
                  <button
                    key={secteur}
                    onClick={() => {
                      if (profil.secteurs_cibles.includes(secteur)) {
                        setProfil(prev => ({
                          ...prev,
                          secteurs_cibles: prev.secteurs_cibles.filter(s => s !== secteur)
                        }));
                      } else {
                        setProfil(prev => ({
                          ...prev,
                          secteurs_cibles: [...prev.secteurs_cibles, secteur]
                        }));
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      profil.secteurs_cibles.includes(secteur)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {secteur}
                  </button>
                ))}
              </div>
            </div>

            {/* Spécifications & Cadrage */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Spécifications & Cadrage</h2>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newSpecification}
                  onChange={(e) => setNewSpecification(e.target.value)}
                  placeholder="Nouvelle spécification"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                />
                <button
                  onClick={() => addToArray('specifications_cadrage', newSpecification, setNewSpecification)}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profil.specifications_cadrage.map((spec, index) => (
                  <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm">
                    <span>{spec}</span>
                    <button
                      onClick={() => removeFromArray('specifications_cadrage', index)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne du milieu */}
          <div className="space-y-6">

            {/* Outils maîtrisés */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Outils maîtrisés</h2>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newOutil}
                  onChange={(e) => setNewOutil(e.target.value)}
                  placeholder="Nouvel outil"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                />
                <button
                  onClick={() => addToArray('outils_maitrises', newOutil, setNewOutil)}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profil.outils_maitrises.map((outil, index) => (
                  <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    <span>{outil}</span>
                    <button
                      onClick={() => removeFromArray('outils_maitrises', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exemples de tâches */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Exemples de tâches</h2>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTache}
                  onChange={(e) => setNewTache(e.target.value)}
                  placeholder="Nouvelle tâche"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                />
                <button
                  onClick={() => addToArray('exemples_taches', newTache, setNewTache)}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {profil.exemples_taches.map((tache, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <span className="text-sm">{tache}</span>
                    <button
                      onClick={() => removeFromArray('exemples_taches', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cas d'usage */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Cas d'usage</h2>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newCasUsage}
                  onChange={(e) => setNewCasUsage(e.target.value)}
                  placeholder="Nouveau cas d'usage"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                />
                <button
                  onClick={() => addToArray('cas_usage', newCasUsage, setNewCasUsage)}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {profil.cas_usage.map((cas, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <span className="text-sm">{cas}</span>
                    <button
                      onClick={() => removeFromArray('cas_usage', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Règles et Limites */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Règles et Limites</h2>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newLimite}
                  onChange={(e) => setNewLimite(e.target.value)}
                  placeholder="Nouvelle règle/limite"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
                />
                <button
                  onClick={() => addToArray('limites_explicites', newLimite, setNewLimite)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {profil.limites_explicites.map((limite, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-900/20 border border-red-800 rounded-lg">
                    <span className="text-sm text-red-200">{limite}</span>
                    <button
                      onClick={() => removeFromArray('limites_explicites', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne de droite (plus large pour les prompts) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Descriptions */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Descriptions</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description courte *</label>
                  <textarea
                    value={profil.description_courte}
                    onChange={(e) => setProfil(prev => ({ ...prev, description_courte: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description complète</label>
                  <textarea
                    value={profil.description_complete}
                    onChange={(e) => setProfil(prev => ({ ...prev, description_complete: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Méthodologie</label>
                  <textarea
                    value={profil.methodologie}
                    onChange={(e) => setProfil(prev => ({ ...prev, methodologie: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Configuration IA */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Configuration IA</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prompt d'identité *</label>
                  <textarea
                    value={profil.identity_prompt}
                    onChange={(e) => setProfil(prev => ({ ...prev, identity_prompt: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prompt de mission</label>
                  <textarea
                    value={profil.mission_prompt}
                    onChange={(e) => setProfil(prev => ({ ...prev, mission_prompt: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prompt de personnalité</label>
                  <textarea
                    value={profil.personality_prompt}
                    onChange={(e) => setProfil(prev => ({ ...prev, personality_prompt: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">📦 Règles de Livraisons</label>
                  <textarea
                    value={profil.prompt_regles_livraisons}
                    onChange={(e) => setProfil(prev => ({ ...prev, prompt_regles_livraisons: e.target.value }))}
                    rows={8}
                    placeholder="Définissez les règles et formats pour les livrables..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">💬 Règles de Discussion</label>
                  <textarea
                    value={profil.prompt_regles_discussion}
                    onChange={(e) => setProfil(prev => ({ ...prev, prompt_regles_discussion: e.target.value }))}
                    rows={8}
                    placeholder="Définissez les règles de communication et d'interaction..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}