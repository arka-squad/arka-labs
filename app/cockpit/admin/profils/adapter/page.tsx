'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminNavigation from '../../components/AdminNavigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface ProfilExpertise {
  id: string;
  nom: string;
  domaine: string;
  description_courte: string;
  sections_expertise: ExpertiseSection[];
  sections_scope: ScopeSection[];
}

interface ExpertiseSection {
  id: string;
  nom: string;
  contenu: string;
  keywords: string[];
}

interface ScopeSection {
  id: string;
  nom: string;
  contenu: string;
}

interface ContexteAdaptation {
  secteur_activite: string;
  taille_entreprise: string;
  processus_specifiques: Record<string, string>;
  contraintes_reglementaires: string[];
  vocabulaire_metier: Record<string, string>;
  tone_communication: 'professionnel' | 'decontracte' | 'expert' | 'pedagogique';
  niveau_detail: 'synthetique' | 'standard' | 'detaille';
}

export default function AdapterProfilPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profilId = searchParams?.get('id');

  const [profil, setProfil] = useState<ProfilExpertise | null>(null);
  const [loading, setLoading] = useState(false);
  const [etape, setEtape] = useState(1);

  const [contexte, setContexte] = useState<ContexteAdaptation>({
    secteur_activite: '',
    taille_entreprise: '',
    processus_specifiques: {},
    contraintes_reglementaires: [],
    vocabulaire_metier: {},
    tone_communication: 'professionnel',
    niveau_detail: 'standard'
  });

  const [nouveauProcessus, setNouveauProcessus] = useState({ nom: '', description: '' });
  const [nouveauVocabulaire, setNouveauVocabulaire] = useState({ generique: '', specifique: '' });
  const [nouvelleContrainte, setNouvelleContrainte] = useState('');

  useEffect(() => {
    if (profilId) {
      loadProfil(profilId);
    }
  }, [profilId]);

  const loadProfil = async (id: string) => {
    setLoading(true);
    try {
      // Mock data - sera remplacé par l'API
      const mockProfil: ProfilExpertise = {
        id,
        nom: 'Expert Finance Corporate',
        domaine: 'Finance',
        description_courte: 'Spécialiste en finance d\'entreprise et analyse financière',
        sections_expertise: [
          {
            id: '1',
            nom: 'Analyse Financière',
            contenu: 'Expert en analyse des états financiers, ratios et KPIs financiers',
            keywords: ['analyse', 'ratios', 'kpi', 'bilan', 'compte de résultat']
          },
          {
            id: '2',
            nom: 'Stratégie Financière',
            contenu: 'Conseil en stratégie financière, fusion-acquisition et financement',
            keywords: ['stratégie', 'ma', 'financement', 'investissement']
          }
        ],
        sections_scope: [
          {
            id: '1',
            nom: 'Reporting Executif',
            contenu: 'Préparation de rapports pour la direction et le conseil'
          },
          {
            id: '2',
            nom: 'Formation Équipes',
            contenu: 'Formation des équipes finance sur les meilleures pratiques'
          }
        ]
      };
      setProfil(mockProfil);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
    setLoading(false);
  };

  const ajouterProcessus = () => {
    if (nouveauProcessus.nom && nouveauProcessus.description) {
      setContexte(prev => ({
        ...prev,
        processus_specifiques: {
          ...prev.processus_specifiques,
          [nouveauProcessus.nom]: nouveauProcessus.description
        }
      }));
      setNouveauProcessus({ nom: '', description: '' });
    }
  };

  const ajouterVocabulaire = () => {
    if (nouveauVocabulaire.generique && nouveauVocabulaire.specifique) {
      setContexte(prev => ({
        ...prev,
        vocabulaire_metier: {
          ...prev.vocabulaire_metier,
          [nouveauVocabulaire.generique]: nouveauVocabulaire.specifique
        }
      }));
      setNouveauVocabulaire({ generique: '', specifique: '' });
    }
  };

  const ajouterContrainte = () => {
    if (nouvelleContrainte && !contexte.contraintes_reglementaires.includes(nouvelleContrainte)) {
      setContexte(prev => ({
        ...prev,
        contraintes_reglementaires: [...prev.contraintes_reglementaires, nouvelleContrainte]
      }));
      setNouvelleContrainte('');
    }
  };

  const supprimerProcessus = (nom: string) => {
    setContexte(prev => {
      const nouveauxProcessus = { ...prev.processus_specifiques };
      delete nouveauxProcessus[nom];
      return { ...prev, processus_specifiques: nouveauxProcessus };
    });
  };

  const supprimerVocabulaire = (generique: string) => {
    setContexte(prev => {
      const nouveauVocabulaire = { ...prev.vocabulaire_metier };
      delete nouveauVocabulaire[generique];
      return { ...prev, vocabulaire_metier: nouveauVocabulaire };
    });
  };

  const supprimerContrainte = (contrainte: string) => {
    setContexte(prev => ({
      ...prev,
      contraintes_reglementaires: prev.contraintes_reglementaires.filter(c => c !== contrainte)
    }));
  };

  const genererAgentAdapte = async () => {
    setLoading(true);
    try {
      // Mock génération - sera remplacé par l'API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Redirection vers l'agent généré
      router.push('/cockpit/admin/profils/preview/adapted-123');
    } catch (error) {
      console.error('Erreur génération agent:', error);
    }
    setLoading(false);
  };

  if (!profil && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profil non trouvé</h1>
          <button
            onClick={() => router.push('/cockpit/admin/profils')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
          >
            Retour au Marketplace
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
              <h1 className="text-3xl font-bold">Adapter Profil</h1>
              <div className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm">
                CONTEXTE
              </div>
            </div>
            <p className="text-gray-400">
              Adaptez "{profil?.nom}" à votre contexte métier spécifique
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>Retour</span>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= etape ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step < etape ? 'bg-orange-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration principale */}
          <div className="lg:col-span-2 space-y-6">
            {etape === 1 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Étape 1: Contexte Entreprise
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Secteur d'activité</label>
                      <select
                        value={contexte.secteur_activite}
                        onChange={(e) => setContexte(prev => ({ ...prev, secteur_activite: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      >
                        <option value="">Sélectionnez un secteur</option>
                        <option value="fintech">FinTech</option>
                        <option value="retail">Retail</option>
                        <option value="healthcare">Santé</option>
                        <option value="manufacturing">Industrie</option>
                        <option value="consulting">Conseil</option>
                        <option value="technology">Technology</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Taille entreprise</label>
                      <select
                        value={contexte.taille_entreprise}
                        onChange={(e) => setContexte(prev => ({ ...prev, taille_entreprise: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      >
                        <option value="">Sélectionnez la taille</option>
                        <option value="startup">Startup (1-50)</option>
                        <option value="pme">PME (51-250)</option>
                        <option value="eti">ETI (251-5000)</option>
                        <option value="ge">Grande Entreprise (5000+)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ton de communication</label>
                      <select
                        value={contexte.tone_communication}
                        onChange={(e) => setContexte(prev => ({ ...prev, tone_communication: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      >
                        <option value="professionnel">Professionnel</option>
                        <option value="decontracte">Décontracté</option>
                        <option value="expert">Expert technique</option>
                        <option value="pedagogique">Pédagogique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Niveau de détail</label>
                      <select
                        value={contexte.niveau_detail}
                        onChange={(e) => setContexte(prev => ({ ...prev, niveau_detail: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      >
                        <option value="synthetique">Synthétique</option>
                        <option value="standard">Standard</option>
                        <option value="detaille">Détaillé</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setEtape(2)}
                    disabled={!contexte.secteur_activite || !contexte.taille_entreprise}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {etape === 2 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Étape 2: Processus & Vocabulaire
                </h2>

                <div className="space-y-8">
                  {/* Processus spécifiques */}
                  <div>
                    <h3 className="font-medium mb-4">Processus spécifiques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Nom du processus (ex: recrutement)"
                        value={nouveauProcessus.nom}
                        onChange={(e) => setNouveauProcessus(prev => ({ ...prev, nom: e.target.value }))}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Description spécifique"
                        value={nouveauProcessus.description}
                        onChange={(e) => setNouveauProcessus(prev => ({ ...prev, description: e.target.value }))}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={ajouterProcessus}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-sm"
                    >
                      + Ajouter processus
                    </button>

                    {Object.keys(contexte.processus_specifiques).length > 0 && (
                      <div className="mt-4 space-y-2">
                        {Object.entries(contexte.processus_specifiques).map(([nom, description]) => (
                          <div key={nom} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <div>
                              <span className="font-medium text-sm">{nom}</span>
                              <span className="text-gray-400 text-xs ml-2">{description}</span>
                            </div>
                            <button
                              onClick={() => supprimerProcessus(nom)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vocabulaire métier */}
                  <div>
                    <h3 className="font-medium mb-4">Vocabulaire métier</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Terme générique (ex: opérateur)"
                        value={nouveauVocabulaire.generique}
                        onChange={(e) => setNouveauVocabulaire(prev => ({ ...prev, generique: e.target.value }))}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Terme spécifique (ex: analyste risque)"
                        value={nouveauVocabulaire.specifique}
                        onChange={(e) => setNouveauVocabulaire(prev => ({ ...prev, specifique: e.target.value }))}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={ajouterVocabulaire}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-sm"
                    >
                      + Ajouter vocabulaire
                    </button>

                    {Object.keys(contexte.vocabulaire_metier).length > 0 && (
                      <div className="mt-4 space-y-2">
                        {Object.entries(contexte.vocabulaire_metier).map(([generique, specifique]) => (
                          <div key={generique} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <div>
                              <span className="text-sm">{generique}</span>
                              <span className="text-orange-400 mx-2">→</span>
                              <span className="text-sm font-medium">{specifique}</span>
                            </div>
                            <button
                              onClick={() => supprimerVocabulaire(generique)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    onClick={() => setEtape(3)}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {etape === 3 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Étape 3: Contraintes & Finalisation
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Contraintes réglementaires</h3>
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="text"
                        placeholder="Ex: GDPR, PCI-DSS, SOX..."
                        value={nouvelleContrainte}
                        onChange={(e) => setNouvelleContrainte(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-400 focus:outline-none"
                      />
                      <button
                        onClick={ajouterContrainte}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                      >
                        + Ajouter
                      </button>
                    </div>

                    {contexte.contraintes_reglementaires.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {contexte.contraintes_reglementaires.map((contrainte) => (
                          <div key={contrainte} className="flex items-center space-x-1 px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">
                            <span>{contrainte}</span>
                            <button
                              onClick={() => supprimerContrainte(contrainte)}
                              className="text-purple-400 hover:text-purple-300 ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Résumé de l'adaptation</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><strong>Secteur:</strong> {contexte.secteur_activite || 'Non défini'}</div>
                      <div><strong>Taille:</strong> {contexte.taille_entreprise || 'Non définie'}</div>
                      <div><strong>Ton:</strong> {contexte.tone_communication}</div>
                      <div><strong>Processus:</strong> {Object.keys(contexte.processus_specifiques).length} définis</div>
                      <div><strong>Vocabulaire:</strong> {Object.keys(contexte.vocabulaire_metier).length} adaptations</div>
                      <div><strong>Contraintes:</strong> {contexte.contraintes_reglementaires.length} réglementaires</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setEtape(2)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={genererAgentAdapte}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span>🎯</span>
                        <span>Générer Agent Adapté</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Profil Source</h3>
              {profil && (
                <div>
                  <h4 className="font-medium mb-2">{profil.nom}</h4>
                  <p className="text-sm text-gray-400 mb-4">{profil.description_courte}</p>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-orange-300 mb-1">Expertise ({profil.sections_expertise.length})</h5>
                      {profil.sections_expertise.slice(0, 2).map((section) => (
                        <div key={section.id} className="text-xs text-gray-500 mb-1">
                          • {section.nom}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-orange-300 mb-1">Scope ({profil.sections_scope.length})</h5>
                      {profil.sections_scope.slice(0, 2).map((section) => (
                        <div key={section.id} className="text-xs text-gray-500 mb-1">
                          • {section.nom}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {etape > 1 && (
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Adaptations Prévues</h3>

                <div className="space-y-3 text-sm">
                  {contexte.secteur_activite && (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span>Adaptation secteur {contexte.secteur_activite}</span>
                    </div>
                  )}

                  {Object.keys(contexte.processus_specifiques).length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>{Object.keys(contexte.processus_specifiques).length} processus personnalisés</span>
                    </div>
                  )}

                  {Object.keys(contexte.vocabulaire_metier).length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>{Object.keys(contexte.vocabulaire_metier).length} termes adaptés</span>
                    </div>
                  )}

                  {contexte.contraintes_reglementaires.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span>{contexte.contraintes_reglementaires.length} contraintes réglementaires</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}