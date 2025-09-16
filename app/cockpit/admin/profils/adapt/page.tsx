'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminNavigation from '../../components/AdminNavigation';

interface ProfilBase {
  id: string;
  nom: string;
  domaine: string;
  description_courte: string;
  identity_prompt: string;
  expertise_sections: ExpertiseSection[];
  scope_sections: ScopeSection[];
}

interface ExpertiseSection {
  id: string;
  nom: string;
  trigger_keywords: string[];
  prompt_template: string;
}

interface ScopeSection {
  id: string;
  nom: string;
  category: string;
  prompt_template: string;
}

interface ContexteAdaptation {
  secteur_cible: string;
  taille_organisation: 'startup' | 'pme' | 'corporate' | 'enterprise';
  contexte_specifique: string;
  contraintes_metier: string[];
  objectifs_adaptation: string[];
  tone_souhaite: 'professionnel' | 'decontracte' | 'expert' | 'pedagogique';
}

interface AdaptationSuggestion {
  section_id: string;
  section_nom: string;
  modification_suggéree: string;
  impact_score: number;
  rationale: string;
}

export default function AdaptateurContextePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profil_id = searchParams.get('profil');

  const [etape, setEtape] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profil_base, setProfilBase] = useState<ProfilBase | null>(null);

  // Configuration contexte
  const [contexte, setContexte] = useState<ContexteAdaptation>({
    secteur_cible: '',
    taille_organisation: 'pme',
    contexte_specifique: '',
    contraintes_metier: [],
    objectifs_adaptation: [],
    tone_souhaite: 'professionnel'
  });

  // Adaptations suggérées
  const [suggestions, setSuggestions] = useState<AdaptationSuggestion[]>([]);
  const [adaptations_selectionnees, setAdaptationsSelectionnees] = useState<string[]>([]);

  useEffect(() => {
    if (profil_id) {
      loadProfilBase(profil_id);
    }
  }, [profil_id]);

  const loadProfilBase = async (id: string) => {
    setLoading(true);
    try {
      // Mock data - sera remplacé par l'API
      const mockProfil: ProfilBase = {
        id: id,
        nom: 'Expert Finance Corporate',
        domaine: 'Finance',
        description_courte: 'Spécialiste en finance d\'entreprise et analyse financière',
        identity_prompt: 'Tu es un expert en finance corporate avec 15 ans d\'expérience...',
        expertise_sections: [
          {
            id: 'exp-1',
            nom: 'Analyse financière avancée',
            trigger_keywords: ['analyse', 'ratios', 'financier', 'bilans'],
            prompt_template: 'Analyse les données financières avec rigueur...'
          },
          {
            id: 'exp-2',
            nom: 'Conseil stratégique M&A',
            trigger_keywords: ['fusion', 'acquisition', 'valorisation'],
            prompt_template: 'Pour les opérations de M&A, évalue...'
          }
        ],
        scope_sections: [
          {
            id: 'scope-1',
            nom: 'Périmètre expertise finance',
            category: 'responsibilities',
            prompt_template: 'Je me concentre sur les aspects financiers...'
          },
          {
            id: 'scope-2',
            nom: 'Limites conseil juridique',
            category: 'restrictions',
            prompt_template: 'Je ne fournis pas de conseil juridique...'
          }
        ]
      };
      setProfilBase(mockProfil);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
    setLoading(false);
  };

  const genererSuggestions = async () => {
    setLoading(true);
    try {
      // Mock génération suggestions - sera remplacé par l'API IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockSuggestions: AdaptationSuggestion[] = [
        {
          section_id: 'exp-1',
          section_nom: 'Analyse financière avancée',
          modification_suggéree: 'Adapter les ratios financiers aux spécificités des startups (burn rate, runway, métriques SaaS)',
          impact_score: 0.85,
          rationale: 'Les startups nécessitent des métriques différentes des entreprises traditionnelles'
        },
        {
          section_id: 'identity',
          section_nom: 'Identité profil',
          modification_suggéree: 'Ajuster le ton pour être plus accessible aux entrepreneurs sans formation financière approfondie',
          impact_score: 0.72,
          rationale: 'Le secteur startup valorise un langage plus direct et moins technique'
        },
        {
          section_id: 'scope-1',
          section_nom: 'Périmètre expertise finance',
          modification_suggéree: 'Étendre aux aspects de levée de fonds et financement participatif',
          impact_score: 0.90,
          rationale: 'Les startups ont des besoins spécifiques en financement externe'
        }
      ];

      setSuggestions(mockSuggestions);
      setEtape(3);
    } catch (error) {
      console.error('Erreur génération suggestions:', error);
    }
    setLoading(false);
  };

  const appliquerAdaptations = async () => {
    setLoading(true);
    try {
      // Mock application adaptations - sera remplacé par l'API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirection vers preview profil adapté
      router.push(`/cockpit/admin/profils/preview/adapted-${profil_base?.id}`);
    } catch (error) {
      console.error('Erreur application adaptations:', error);
    }
    setLoading(false);
  };

  const secteurs_disponibles = [
    'Startup/Scale-up',
    'Fintech',
    'E-commerce',
    'SaaS/Tech',
    'Santé/Medtech',
    'Industrie 4.0',
    'Energie/GreenTech',
    'Education/EdTech',
    'Immobilier/PropTech',
    'Autres'
  ];

  const contraintes_communes = [
    'Budget limité',
    'Équipe réduite',
    'Croissance rapide',
    'Réglementation stricte',
    'Concurrence intense',
    'Temps de décision court',
    'Besoin de scalabilité',
    'Contraintes techniques'
  ];

  const objectifs_communs = [
    'Simplifier le langage technique',
    'Accélérer la prise de décision',
    'Adapter aux ressources disponibles',
    'Optimiser pour la croissance',
    'Réduire les risques sectoriels',
    'Améliorer la pertinence contextuelle',
    'Personnaliser les recommandations',
    'Augmenter l\'efficacité opérationnelle'
  ];

  if (!profil_base && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profil non trouvé</h2>
          <button
            onClick={() => router.push('/cockpit/admin/profils')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Retour au marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">🎯</span>
              <h1 className="text-3xl font-bold">Adaptateur de Contexte</h1>
              <div className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">
                IA-POWERED
              </div>
            </div>
            <p className="text-gray-400">
              Adaptez automatiquement un profil à votre secteur et contexte métier
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Retour
          </button>
        </div>

        {/* Profil source */}
        {profil_base && (
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">{profil_base.nom}</h3>
                <p className="text-gray-400 mb-4">{profil_base.description_courte}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📊 {profil_base.expertise_sections.length} sections d'expertise</span>
                  <span>🎯 {profil_base.scope_sections.length} sections de périmètre</span>
                  <span>🏷️ {profil_base.domaine}</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg">
                Profil Source
              </div>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= etape ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step < etape ? 'bg-purple-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {etape === 1 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Étape 1: Contexte Métier
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Secteur cible</label>
                    <select
                      value={contexte.secteur_cible}
                      onChange={(e) => setContexte(prev => ({ ...prev, secteur_cible: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-400 focus:outline-none"
                    >
                      <option value="">Sélectionnez un secteur</option>
                      {secteurs_disponibles.map((secteur) => (
                        <option key={secteur} value={secteur}>{secteur}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Taille organisation</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'startup', label: 'Startup\n(<50)' },
                        { value: 'pme', label: 'PME\n(50-250)' },
                        { value: 'corporate', label: 'Corporate\n(250-5000)' },
                        { value: 'enterprise', label: 'Enterprise\n(5000+)' }
                      ].map((taille) => (
                        <button
                          key={taille.value}
                          onClick={() => setContexte(prev => ({ ...prev, taille_organisation: taille.value as any }))}
                          className={`p-3 rounded-lg border text-center text-sm transition-colors ${
                            contexte.taille_organisation === taille.value
                              ? 'border-purple-400 bg-purple-900/20 text-purple-300'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          {taille.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Contexte spécifique</label>
                    <textarea
                      value={contexte.contexte_specifique}
                      onChange={(e) => setContexte(prev => ({ ...prev, contexte_specifique: e.target.value }))}
                      placeholder="Décrivez le contexte particulier de votre organisation (ex: entreprise en phase de levée de fonds Series A, équipe tech de 15 personnes, marché B2B SaaS...)"
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setEtape(2)}
                    disabled={!contexte.secteur_cible || !contexte.contexte_specifique}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {etape === 2 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Étape 2: Contraintes & Objectifs
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Contraintes métier principales
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {contraintes_communes.map((contrainte) => (
                        <label key={contrainte} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contexte.contraintes_metier.includes(contrainte)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setContexte(prev => ({
                                  ...prev,
                                  contraintes_metier: [...prev.contraintes_metier, contrainte]
                                }));
                              } else {
                                setContexte(prev => ({
                                  ...prev,
                                  contraintes_metier: prev.contraintes_metier.filter(c => c !== contrainte)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                          />
                          <span className="text-sm">{contrainte}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Objectifs d'adaptation
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {objectifs_communs.map((objectif) => (
                        <label key={objectif} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contexte.objectifs_adaptation.includes(objectif)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setContexte(prev => ({
                                  ...prev,
                                  objectifs_adaptation: [...prev.objectifs_adaptation, objectif]
                                }));
                              } else {
                                setContexte(prev => ({
                                  ...prev,
                                  objectifs_adaptation: prev.objectifs_adaptation.filter(o => o !== objectif)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                          />
                          <span className="text-sm">{objectif}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Tone souhaité</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'professionnel', label: '👔 Professionnel', desc: 'Formel et expert' },
                        { value: 'decontracte', label: '😊 Décontracté', desc: 'Accessible et friendly' },
                        { value: 'expert', label: '🎓 Expert', desc: 'Technique et précis' },
                        { value: 'pedagogique', label: '📚 Pédagogique', desc: 'Explicatif et patient' }
                      ].map((tone) => (
                        <button
                          key={tone.value}
                          onClick={() => setContexte(prev => ({ ...prev, tone_souhaite: tone.value as any }))}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            contexte.tone_souhaite === tone.value
                              ? 'border-purple-400 bg-purple-900/20'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="font-medium text-sm">{tone.label}</div>
                          <div className="text-xs text-gray-400 mt-1">{tone.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setEtape(1)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={genererSuggestions}
                    disabled={loading || contexte.contraintes_metier.length === 0}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span>🤖</span>
                        <span>Générer Adaptations IA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {etape === 3 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Étape 3: Adaptations Suggérées par IA
                </h2>

                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.section_id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        adaptations_selectionnees.includes(suggestion.section_id)
                          ? 'border-purple-400 bg-purple-900/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        if (adaptations_selectionnees.includes(suggestion.section_id)) {
                          setAdaptationsSelectionnees(prev =>
                            prev.filter(id => id !== suggestion.section_id)
                          );
                        } else {
                          setAdaptationsSelectionnees(prev => [...prev, suggestion.section_id]);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={adaptations_selectionnees.includes(suggestion.section_id)}
                            onChange={() => {}}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                          />
                          <h4 className="font-medium">{suggestion.section_nom}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded text-xs ${
                            suggestion.impact_score >= 0.8 ? 'bg-green-900/30 text-green-300' :
                            suggestion.impact_score >= 0.6 ? 'bg-yellow-900/30 text-yellow-300' :
                            'bg-emerald-900/30 text-emerald-300'
                          }`}>
                            Impact {Math.round(suggestion.impact_score * 100)}%
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-2">{suggestion.modification_suggéree}</p>
                      <p className="text-sm text-gray-500 italic">💡 {suggestion.rationale}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setEtape(2)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={appliquerAdaptations}
                    disabled={loading || adaptations_selectionnees.length === 0}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Appliquer Adaptations</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Panel droit - Résumé config */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Configuration Actuelle</h3>

              <div className="space-y-4">
                {contexte.secteur_cible && (
                  <div>
                    <span className="text-xs text-gray-400">SECTEUR</span>
                    <div className="text-sm font-medium">{contexte.secteur_cible}</div>
                  </div>
                )}

                <div>
                  <span className="text-xs text-gray-400">TAILLE</span>
                  <div className="text-sm font-medium capitalize">{contexte.taille_organisation}</div>
                </div>

                {contexte.contraintes_metier.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400">CONTRAINTES</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contexte.contraintes_metier.slice(0, 3).map((contrainte) => (
                        <span key={contrainte} className="px-2 py-1 bg-emerald-900/30 text-emerald-300 rounded text-xs">
                          {contrainte}
                        </span>
                      ))}
                      {contexte.contraintes_metier.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          +{contexte.contraintes_metier.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs text-gray-400">TONE</span>
                  <div className="text-sm font-medium capitalize">{contexte.tone_souhaite}</div>
                </div>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Résumé Adaptations</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Suggestions générées</span>
                    <span className="font-medium">{suggestions.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Sélectionnées</span>
                    <span className="font-medium text-purple-300">{adaptations_selectionnees.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Impact moyen</span>
                    <span className="font-medium">
                      {adaptations_selectionnees.length > 0
                        ? Math.round(suggestions
                            .filter(s => adaptations_selectionnees.includes(s.section_id))
                            .reduce((acc, s) => acc + s.impact_score, 0) / adaptations_selectionnees.length * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}