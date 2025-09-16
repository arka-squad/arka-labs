'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavigation from '../../components/AdminNavigation';

interface ReferenceItem {
  id: string;
  name: string;
  category: 'skills' | 'tools' | 'tasks' | 'tags' | 'rules' | 'specifications';
  description?: string;
  domain?: string;
  is_active: boolean;
  usage_count: number;
}

interface ReferencesResponse {
  skills: ReferenceItem[];
  tools: ReferenceItem[];
  tasks: ReferenceItem[];
  tags: ReferenceItem[];
  rules: ReferenceItem[];
  specifications: ReferenceItem[];
}

export default function ProfilComposerPage() {
  const router = useRouter();
  const [etapeActuelle, setEtapeActuelle] = useState(1);
  const [loading, setLoading] = useState(false);

  // Données de référence depuis l'API
  const [references, setReferences] = useState<ReferencesResponse | null>(null);

  // États pour le profil en construction
  const [assemblage, setAssemblage] = useState({
    competences: [] as string[],
    outils: [] as string[],
    taches: [] as string[],
    tags: [] as string[],
    regles: [] as string[],
    specifications: [] as string[]
  });

  // États pour l'Étape 2 - Informations du profil
  const [profilInfo, setProfilInfo] = useState({
    nom: '',
    domaine: '',
    secteurs_cibles: [] as string[],
    niveau_complexite: 'intermediate',
    visibilite: 'private',
    description_courte: '',
    description_complete: '',
    methodologie: '',
    identity_prompt: '',
    mission_prompt: '',
    personality_prompt: ''
  });

  // États pour l'ajout personnalisé
  const [nouvelleCompetence, setNouvelleCompetence] = useState('');
  const [nouvelOutil, setNouvelOutil] = useState('');
  const [nouvelleTache, setNouvelleTache] = useState('');
  const [nouveauTag, setNouveauTag] = useState('');
  const [nouvelleRegle, setNouvelleRegle] = useState('');

  // Charger les données de référence
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const response = await fetch('/api/b30/references');
        if (!response.ok) throw new Error('Erreur chargement références');
        const data = await response.json();
        setReferences(data);
      } catch (error) {
        console.error('Erreur chargement références:', error);
      }
    };
    loadReferences();
  }, []);

  // Ajouter une nouvelle compétence
  const ajouterCompetence = async () => {
    if (!nouvelleCompetence.trim()) return;
    try {
      const response = await fetch('/api/b30/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nouvelleCompetence.trim(),
          category: 'skills'
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (references) {
          setReferences({
            ...references,
            skills: [...references.skills, result.reference]
          });
        }
        setAssemblage(prev => ({
          ...prev,
          competences: [...prev.competences, result.reference.id]
        }));
        setNouvelleCompetence('');
      }
    } catch (error) {
      console.error('Erreur ajout compétence:', error);
    }
  };

  // Fonctions similaires pour outils, tâches, tags, règles
  const ajouterOutil = async () => {
    if (!nouvelOutil.trim()) return;
    try {
      const response = await fetch('/api/b30/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nouvelOutil.trim(),
          category: 'tools'
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (references) {
          setReferences({
            ...references,
            tools: [...references.tools, result.reference]
          });
        }
        setAssemblage(prev => ({
          ...prev,
          outils: [...prev.outils, result.reference.id]
        }));
        setNouvelOutil('');
      }
    } catch (error) {
      console.error('Erreur ajout outil:', error);
    }
  };

  const ajouterTache = async () => {
    if (!nouvelleTache.trim()) return;
    try {
      const response = await fetch('/api/b30/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nouvelleTache.trim(),
          category: 'tasks'
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (references) {
          setReferences({
            ...references,
            tasks: [...references.tasks, result.reference]
          });
        }
        setAssemblage(prev => ({
          ...prev,
          taches: [...prev.taches, result.reference.id]
        }));
        setNouvelleTache('');
      }
    } catch (error) {
      console.error('Erreur ajout tâche:', error);
    }
  };

  const ajouterTag = async () => {
    if (!nouveauTag.trim()) return;
    try {
      const response = await fetch('/api/b30/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nouveauTag.trim(),
          category: 'tags'
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (references) {
          setReferences({
            ...references,
            tags: [...references.tags, result.reference]
          });
        }
        setAssemblage(prev => ({
          ...prev,
          tags: [...prev.tags, result.reference.id]
        }));
        setNouveauTag('');
      }
    } catch (error) {
      console.error('Erreur ajout tag:', error);
    }
  };

  const ajouterRegle = async () => {
    if (!nouvelleRegle.trim()) return;
    try {
      const response = await fetch('/api/b30/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nouvelleRegle.trim(),
          category: 'rules'
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (references) {
          setReferences({
            ...references,
            rules: [...references.rules, result.reference]
          });
        }
        setAssemblage(prev => ({
          ...prev,
          regles: [...prev.regles, result.reference.id]
        }));
        setNouvelleRegle('');
      }
    } catch (error) {
      console.error('Erreur ajout règle:', error);
    }
  };

  // Calculer score qualité
  const calculerScore = () => {
    let score = 0;

    // Critères Étape 1 (60 points)
    if (assemblage.competences.length >= 3) score += 15;
    if (assemblage.outils.length >= 2) score += 10;
    if (assemblage.taches.length >= 3) score += 15;
    if (assemblage.tags.length >= 2) score += 10;
    if (assemblage.regles.length >= 1) score += 5;
    if (assemblage.specifications.length >= 4) score += 5;

    // Critères Étape 2 (40 points)
    if (profilInfo.nom.length >= 5) score += 10;
    if (profilInfo.domaine) score += 5;
    if (profilInfo.description_courte.length >= 20) score += 10;
    if (profilInfo.identity_prompt.length >= 50) score += 15;

    return Math.min(score, 100);
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: 'var(--bg)' }}>
      <AdminNavigation />

      <div className="px-6">
        {/* Header avec progression 3 étapes */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">🔧</span>
              <h1 className="text-3xl font-bold">Builder de Profils</h1>
              <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm">
                BUILDER
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              Composez des profils en assemblant des briques d&apos;expertise réutilisables
            </p>

            {/* Indicateur de progression 3 étapes */}
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((etape) => (
                <div key={etape} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    etape === etapeActuelle ? 'bg-orange-600 text-white' :
                    etape < etapeActuelle ? 'bg-green-600 text-white' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {etape}
                  </div>
                  {etape < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      etape < etapeActuelle ? 'bg-green-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/cockpit/admin/profils')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Retour
          </button>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-12 gap-6">

          {/* COLONNE GAUCHE */}
          <div className="col-span-8 space-y-6">

            {/* Zone d'assemblage (toujours visible) */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">⚡</span>
                <h2 className="text-xl font-bold">Assemblage du Profil</h2>
                <span className="text-sm text-gray-400">
                  ({assemblage.competences.length + assemblage.outils.length + assemblage.taches.length + assemblage.tags.length + assemblage.regles.length + assemblage.specifications.length} éléments)
                </span>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {/* Compétences */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <h3 className="font-medium text-red-300">Compétences</h3>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 min-h-[120px]">
                    {assemblage.competences.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune compétence sélectionnée</p>
                    ) : (
                      <div className="space-y-1">
                        {assemblage.competences.map(id => {
                          const item = references?.skills.find(s => s.id === id);
                          return item ? (
                            <div key={id} className="flex items-center justify-between text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded">
                              <span>{item.name}</span>
                              <button
                                onClick={() => setAssemblage(prev => ({
                                  ...prev,
                                  competences: prev.competences.filter(cid => cid !== id)
                                }))}
                                className="hover:text-red-200"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Outils */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <h3 className="font-medium text-blue-300">Outils</h3>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 min-h-[120px]">
                    {assemblage.outils.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucun outil sélectionné</p>
                    ) : (
                      <div className="space-y-1">
                        {assemblage.outils.map(id => {
                          const item = references?.tools.find(t => t.id === id);
                          return item ? (
                            <div key={id} className="flex items-center justify-between text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                              <span>{item.name}</span>
                              <button
                                onClick={() => setAssemblage(prev => ({
                                  ...prev,
                                  outils: prev.outils.filter(oid => oid !== id)
                                }))}
                                className="hover:text-blue-200"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tâches */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <h3 className="font-medium text-orange-300">Tâches</h3>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 min-h-[120px]">
                    {assemblage.taches.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune tâche sélectionnée</p>
                    ) : (
                      <div className="space-y-1">
                        {assemblage.taches.map(id => {
                          const item = references?.tasks.find(t => t.id === id);
                          return item ? (
                            <div key={id} className="flex items-center justify-between text-xs bg-orange-900/30 text-orange-300 px-2 py-1 rounded">
                              <span>{item.name}</span>
                              <button
                                onClick={() => setAssemblage(prev => ({
                                  ...prev,
                                  taches: prev.taches.filter(tid => tid !== id)
                                }))}
                                className="hover:text-orange-200"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <h3 className="font-medium text-yellow-300">Tags</h3>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 min-h-[120px]">
                    {assemblage.tags.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucun tag sélectionné</p>
                    ) : (
                      <div className="space-y-1">
                        {assemblage.tags.map(id => {
                          const item = references?.tags.find(t => t.id === id);
                          return item ? (
                            <div key={id} className="flex items-center justify-between text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded">
                              <span>{item.name}</span>
                              <button
                                onClick={() => setAssemblage(prev => ({
                                  ...prev,
                                  tags: prev.tags.filter(tid => tid !== id)
                                }))}
                                className="hover:text-yellow-200"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Règles */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <h3 className="font-medium text-purple-300">Règles</h3>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 min-h-[120px]">
                    {assemblage.regles.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune règle sélectionnée</p>
                    ) : (
                      <div className="space-y-1">
                        {assemblage.regles.map(id => {
                          const item = references?.rules.find(r => r.id === id);
                          return item ? (
                            <div key={id} className="flex items-center justify-between text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                              <span>{item.name}</span>
                              <button
                                onClick={() => setAssemblage(prev => ({
                                  ...prev,
                                  regles: prev.regles.filter(rid => rid !== id)
                                }))}
                                className="hover:text-purple-200"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Spécifications & Cadrage */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                    <h3 className="font-medium text-cyan-300">Spécifications</h3>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 min-h-[120px]">
                    {assemblage.specifications.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune spécification sélectionnée</p>
                    ) : (
                      <div className="space-y-1">
                        {assemblage.specifications.map(id => {
                          const item = references?.specifications.find(s => s.id === id);
                          return item ? (
                            <div key={id} className="flex items-center justify-between text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded">
                              <span>{item.name}</span>
                              <button
                                onClick={() => setAssemblage(prev => ({
                                  ...prev,
                                  specifications: prev.specifications.filter(sid => sid !== id)
                                }))}
                                className="hover:text-cyan-200"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 1: Bibliothèque de Briques */}
            {etapeActuelle === 1 && (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">📚</span>
                  <h2 className="text-xl font-bold">Étape 1: Bibliothèque de Briques</h2>
                </div>

                <p className="text-gray-400 mb-6">
                  Glissez-déposez les briques pour construire votre profil
                </p>

                {/* Filtres */}
                <div className="flex space-x-4 mb-6">
                  <select className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option>Tous les secteurs</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Tech</option>
                  </select>
                  <select className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option>Tous les types</option>
                    <option>Compétences</option>
                    <option>Outils</option>
                    <option>Tâches</option>
                  </select>
                </div>

                {!references ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Chargement des références...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-8">
                    {/* COLONNE GAUCHE */}
                    <div className="space-y-6">
                      {/* Compétences */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-red-300">🎯 Compétences</h3>
                          <span className="text-sm text-gray-400">{references.skills.length} disponibles</span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={nouvelleCompetence}
                            onChange={(e) => setNouvelleCompetence(e.target.value)}
                            placeholder="Nouvelle compétence..."
                            className="flex-1 px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                            onKeyPress={(e) => e.key === 'Enter' && ajouterCompetence()}
                          />
                          <button
                            onClick={ajouterCompetence}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            +
                          </button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {references.skills.map(skill => (
                            <label key={skill.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-700/50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={assemblage.competences.includes(skill.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      competences: [...prev.competences, skill.id]
                                    }));
                                  } else {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      competences: prev.competences.filter(id => id !== skill.id)
                                    }));
                                  }
                                }}
                                className="text-red-600"
                              />
                              <span>{skill.name}</span>
                              {skill.domain && <span className="text-xs text-gray-400">({skill.domain})</span>}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Outils */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-blue-300">🛠️ Outils</h3>
                          <span className="text-sm text-gray-400">{references.tools.length} disponibles</span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={nouvelOutil}
                            onChange={(e) => setNouvelOutil(e.target.value)}
                            placeholder="Nouvel outil..."
                            className="flex-1 px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                            onKeyPress={(e) => e.key === 'Enter' && ajouterOutil()}
                          />
                          <button
                            onClick={ajouterOutil}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          >
                            +
                          </button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {references.tools.map(tool => (
                            <label key={tool.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-700/50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={assemblage.outils.includes(tool.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      outils: [...prev.outils, tool.id]
                                    }));
                                  } else {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      outils: prev.outils.filter(id => id !== tool.id)
                                    }));
                                  }
                                }}
                                className="text-blue-600"
                              />
                              <span>{tool.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Exemples de tâches */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-orange-300">📋 Exemples de tâches</h3>
                          <span className="text-sm text-gray-400">{references.tasks.length} disponibles</span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={nouvelleTache}
                            onChange={(e) => setNouvelleTache(e.target.value)}
                            placeholder="Nouvelle tâche..."
                            className="flex-1 px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                            onKeyPress={(e) => e.key === 'Enter' && ajouterTache()}
                          />
                          <button
                            onClick={ajouterTache}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm"
                          >
                            +
                          </button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {references.tasks.map(task => (
                            <label key={task.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-700/50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={assemblage.taches.includes(task.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      taches: [...prev.taches, task.id]
                                    }));
                                  } else {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      taches: prev.taches.filter(id => id !== task.id)
                                    }));
                                  }
                                }}
                                className="text-orange-600"
                              />
                              <span>{task.name}</span>
                              {task.domain && <span className="text-xs text-gray-400">({task.domain})</span>}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* COLONNE DROITE */}
                    <div className="space-y-6">
                      {/* Tags */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-yellow-300">🏷️ Tags</h3>
                          <span className="text-sm text-gray-400">{references.tags.length} disponibles</span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={nouveauTag}
                            onChange={(e) => setNouveauTag(e.target.value)}
                            placeholder="Nouveau tag..."
                            className="flex-1 px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                            onKeyPress={(e) => e.key === 'Enter' && ajouterTag()}
                          />
                          <button
                            onClick={ajouterTag}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                          >
                            +
                          </button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {references.tags.map(tag => (
                            <label key={tag.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-700/50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={assemblage.tags.includes(tag.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      tags: [...prev.tags, tag.id]
                                    }));
                                  } else {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      tags: prev.tags.filter(id => id !== tag.id)
                                    }));
                                  }
                                }}
                                className="text-yellow-600"
                              />
                              <span>{tag.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Règles & Limites */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-purple-300">⚠️ Règles & Limites</h3>
                          <span className="text-sm text-gray-400">{references.rules.length} disponibles</span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={nouvelleRegle}
                            onChange={(e) => setNouvelleRegle(e.target.value)}
                            placeholder="Nouvelle règle..."
                            className="flex-1 px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                            onKeyPress={(e) => e.key === 'Enter' && ajouterRegle()}
                          />
                          <button
                            onClick={ajouterRegle}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                          >
                            +
                          </button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {references.rules.map(rule => (
                            <label key={rule.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-700/50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={assemblage.regles.includes(rule.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      regles: [...prev.regles, rule.id]
                                    }));
                                  } else {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      regles: prev.regles.filter(id => id !== rule.id)
                                    }));
                                  }
                                }}
                                className="text-purple-600"
                              />
                              <span>{rule.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Spécifications & Cadrage */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-cyan-300">⚙️ Spécifications & Cadrage</h3>
                          <span className="text-sm text-gray-400">{references.specifications.length} disponibles</span>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {references.specifications.map(spec => (
                            <label key={spec.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-700/50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={assemblage.specifications?.includes(spec.id) || false}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      specifications: [...(prev.specifications || []), spec.id]
                                    }));
                                  } else {
                                    setAssemblage(prev => ({
                                      ...prev,
                                      specifications: (prev.specifications || []).filter(id => id !== spec.id)
                                    }));
                                  }
                                }}
                                className="text-cyan-600"
                              />
                              <span>{spec.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setEtapeActuelle(2)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                  >
                    Continuer vers Étape 2 →
                  </button>
                </div>
              </div>
            )}

            {/* Étape 2: Configuration du Profil */}
            {etapeActuelle === 2 && (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">⚙️</span>
                  <h2 className="text-xl font-bold">Étape 2: Configuration du Profil</h2>
                </div>

                <div className="space-y-6">
                  {/* Informations générales */}
                  <div className="bg-gray-900/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Informations générales</h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nom du profil *</label>
                          <input
                            type="text"
                            value={profilInfo.nom}
                            onChange={(e) => setProfilInfo(prev => ({ ...prev, nom: e.target.value }))}
                            placeholder="Ex: Expert Comptable PME"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Domaine *</label>
                          <select
                            value={profilInfo.domaine}
                            onChange={(e) => setProfilInfo(prev => ({ ...prev, domaine: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Sélectionner...</option>
                            <option value="Finance">Finance</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Ressources Humaines">Ressources Humaines</option>
                            <option value="Opérations">Opérations</option>
                            <option value="Technologie">Technologie</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Niveau de complexité</label>
                          <select
                            value={profilInfo.niveau_complexite}
                            onChange={(e) => setProfilInfo(prev => ({ ...prev, niveau_complexite: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="beginner">Débutant</option>
                            <option value="intermediate">Intermédiaire</option>
                            <option value="advanced">Avancé</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Visibilité</label>
                          <select
                            value={profilInfo.visibilite}
                            onChange={(e) => setProfilInfo(prev => ({ ...prev, visibilite: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="private">Privé</option>
                            <option value="internal">Interne</option>
                            <option value="public">Public</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="bg-gray-900/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Descriptions</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Description courte *</label>
                        <textarea
                          value={profilInfo.description_courte}
                          onChange={(e) => setProfilInfo(prev => ({ ...prev, description_courte: e.target.value }))}
                          placeholder="Décrivez brièvement le profil et ses spécialités..."
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">{profilInfo.description_courte.length}/150 caractères</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description complète</label>
                        <textarea
                          value={profilInfo.description_complete}
                          onChange={(e) => setProfilInfo(prev => ({ ...prev, description_complete: e.target.value }))}
                          placeholder="Description détaillée du profil, de son expertise et de ses domaines d'intervention..."
                          rows={4}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-y"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Méthodologie</label>
                        <textarea
                          value={profilInfo.methodologie}
                          onChange={(e) => setProfilInfo(prev => ({ ...prev, methodologie: e.target.value }))}
                          placeholder="Décrivez l'approche méthodologique utilisée par ce profil..."
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-y"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuration IA */}
                  <div className="bg-gray-900/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Configuration IA</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Prompt d'identité *</label>
                        <textarea
                          value={profilInfo.identity_prompt}
                          onChange={(e) => setProfilInfo(prev => ({ ...prev, identity_prompt: e.target.value }))}
                          placeholder="Tu es un expert en... Définis qui est l'IA et son expertise..."
                          rows={4}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-y"
                        />
                        <p className="text-xs text-gray-400 mt-1">Définit le rôle et l'expertise de l'IA</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Prompt de mission</label>
                        <textarea
                          value={profilInfo.mission_prompt}
                          onChange={(e) => setProfilInfo(prev => ({ ...prev, mission_prompt: e.target.value }))}
                          placeholder="Ta mission est de... Définis les objectifs et la mission principale..."
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-y"
                        />
                        <p className="text-xs text-gray-400 mt-1">Objectifs et mission principale</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Prompt de personnalité</label>
                        <textarea
                          value={profilInfo.personality_prompt}
                          onChange={(e) => setProfilInfo(prev => ({ ...prev, personality_prompt: e.target.value }))}
                          placeholder="Tu es rigoureux, pédagogue... Définis le style et la personnalité..."
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-y"
                        />
                        <p className="text-xs text-gray-400 mt-1">Style de communication et personnalité</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation étapes */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setEtapeActuelle(1)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-medium"
                  >
                    ← Retour Étape 1
                  </button>

                  <button
                    onClick={() => setEtapeActuelle(3)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                  >
                    Continuer → Étape 3
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3: Prévisualisation */}
            {etapeActuelle === 3 && (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">👁️</span>
                  <h2 className="text-xl font-bold">Étape 3: Prévisualisation</h2>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">{profilInfo.nom || 'Profil Sans Nom'}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      profilInfo.visibilite === 'public' ? 'bg-green-900/30 text-green-300' :
                      profilInfo.visibilite === 'internal' ? 'bg-blue-900/30 text-blue-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {profilInfo.visibilite === 'public' ? 'Public' :
                       profilInfo.visibilite === 'internal' ? 'Interne' : 'Privé'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Colonne gauche - Informations générales */}
                    <div className="space-y-6">
                      {/* Informations de base */}
                      <div>
                        <h4 className="font-semibold text-blue-300 mb-3">📋 Informations générales</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Domaine:</span>
                            <span className="text-white">{profilInfo.domaine || 'Non défini'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Complexité:</span>
                            <span className="text-white">{
                              profilInfo.niveau_complexite === 'beginner' ? 'Débutant' :
                              profilInfo.niveau_complexite === 'intermediate' ? 'Intermédiaire' :
                              profilInfo.niveau_complexite === 'advanced' ? 'Avancé' : 'Expert'
                            }</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Éléments:</span>
                            <span className="text-white">{assemblage.competences.length + assemblage.outils.length + assemblage.taches.length + assemblage.tags.length + assemblage.regles.length + assemblage.specifications.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="font-semibold text-green-300 mb-3">📝 Description</h4>
                        <div className="bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {profilInfo.description_courte || 'Aucune description fournie'}
                          </p>
                          {profilInfo.description_complete && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {profilInfo.description_complete}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Méthodologie */}
                      {profilInfo.methodologie && (
                        <div>
                          <h4 className="font-semibold text-purple-300 mb-3">⚙️ Méthodologie</h4>
                          <div className="bg-gray-800 rounded-lg p-4">
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {profilInfo.methodologie}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Colonne droite - Éléments assemblés */}
                    <div className="space-y-6">
                      {/* Compétences */}
                      {assemblage.competences.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-300 mb-3">🎯 Compétences ({assemblage.competences.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {assemblage.competences.map(id => {
                              const item = references?.skills.find(s => s.id === id);
                              return item ? (
                                <span key={id} className="px-3 py-1 rounded-full text-xs bg-red-900/30 text-red-300 border border-red-700">
                                  {item.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Outils */}
                      {assemblage.outils.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-blue-300 mb-3">🛠️ Outils ({assemblage.outils.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {assemblage.outils.map(id => {
                              const item = references?.tools.find(t => t.id === id);
                              return item ? (
                                <span key={id} className="px-3 py-1 rounded-full text-xs bg-blue-900/30 text-blue-300 border border-blue-700">
                                  {item.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tâches */}
                      {assemblage.taches.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-orange-300 mb-3">📋 Tâches ({assemblage.taches.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {assemblage.taches.map(id => {
                              const item = references?.tasks.find(t => t.id === id);
                              return item ? (
                                <span key={id} className="px-3 py-1 rounded-full text-xs bg-orange-900/30 text-orange-300 border border-orange-700">
                                  {item.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {assemblage.tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-yellow-300 mb-3">🏷️ Tags ({assemblage.tags.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {assemblage.tags.map(id => {
                              const item = references?.tags.find(t => t.id === id);
                              return item ? (
                                <span key={id} className="px-3 py-1 rounded-full text-xs bg-yellow-900/30 text-yellow-300 border border-yellow-700">
                                  {item.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Règles & Limites */}
                      {assemblage.regles.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-purple-300 mb-3">⚠️ Règles & Limites ({assemblage.regles.length})</h4>
                          <div className="space-y-1">
                            {assemblage.regles.map(id => {
                              const item = references?.rules.find(r => r.id === id);
                              return item ? (
                                <div key={id} className="text-xs text-purple-300 bg-purple-900/20 px-2 py-1 rounded border-l-2 border-purple-500">
                                  • {item.name}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Spécifications & Cadrage */}
                      {assemblage.specifications.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-cyan-300 mb-3">⚙️ Spécifications & Cadrage ({assemblage.specifications.length})</h4>
                          <div className="grid grid-cols-2 gap-1">
                            {assemblage.specifications.map(id => {
                              const item = references?.specifications.find(s => s.id === id);
                              return item ? (
                                <span key={id} className="px-2 py-1 rounded text-xs bg-cyan-900/30 text-cyan-300 border border-cyan-700">
                                  {item.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configuration IA */}
                  <div className="mt-8 space-y-4">
                    <h4 className="font-semibold text-indigo-300 mb-3">🤖 Configuration IA</h4>

                    {/* Identity Prompt */}
                    {profilInfo.identity_prompt && (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-indigo-200 mb-2">Prompt d'identité</h5>
                        <p className="text-xs text-gray-300 leading-relaxed font-mono">
                          {profilInfo.identity_prompt}
                        </p>
                      </div>
                    )}

                    {/* Mission & Personality (en 2 colonnes si les deux existent) */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {profilInfo.mission_prompt && (
                        <div className="bg-gray-800 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-indigo-200 mb-2">Prompt de mission</h5>
                          <p className="text-xs text-gray-300 leading-relaxed font-mono">
                            {profilInfo.mission_prompt}
                          </p>
                        </div>
                      )}

                      {profilInfo.personality_prompt && (
                        <div className="bg-gray-800 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-indigo-200 mb-2">Prompt de personnalité</h5>
                          <p className="text-xs text-gray-300 leading-relaxed font-mono">
                            {profilInfo.personality_prompt}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions finales */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setEtapeActuelle(2)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-medium"
                  >
                    ← Retour Étape 2
                  </button>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        // TODO: Sauvegarder en brouillon
                        console.log('Sauvegarde brouillon:', { assemblage, profilInfo });
                      }}
                      className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors font-medium"
                    >
                      💾 Sauver en Brouillon
                    </button>

                    <button
                      onClick={() => {
                        setLoading(true);
                        // TODO: Générer et publier le profil
                        setTimeout(() => {
                          console.log('Profil généré:', { assemblage, profilInfo });
                          router.push('/cockpit/admin/profils');
                        }, 2000);
                      }}
                      disabled={loading || !profilInfo.nom || !profilInfo.domaine || !profilInfo.identity_prompt}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Génération...</span>
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>Générer & Publier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* COLONNE DROITE - Sidebar */}
          <div className="col-span-4 space-y-6">

            {/* Statut du Profil */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
              <h3 className="font-medium text-blue-300 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Statut du Profil
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nom:</span>
                  <span className="text-white">{profilInfo.nom || 'Non défini'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Domaine:</span>
                  <span className="text-white">{profilInfo.domaine || 'Non défini'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Description:</span>
                  <span className="text-white">{profilInfo.description_courte ? `${profilInfo.description_courte.length} caractères` : 'Vide'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Compétences:</span>
                  <span className="text-white">{assemblage.competences.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Visibilité:</span>
                  <span className="text-white">{profilInfo.visibilite}</span>
                </div>
              </div>
            </div>

            {/* Métriques Qualité */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
              <h3 className="font-medium text-yellow-300 mb-3 flex items-center">
                <span className="mr-2">⭐</span>
                Métriques Qualité
              </h3>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Score Global</span>
                  <span className="text-lg font-bold text-yellow-300">{calculerScore()}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${calculerScore()}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="mr-2 text-red-400">●</span>
                  <span className="text-gray-400">Compétences</span>
                  <span className="ml-auto text-white">{assemblage.competences.length} briques</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-blue-400">●</span>
                  <span className="text-gray-400">Outils</span>
                  <span className="ml-auto text-white">{assemblage.outils.length} briques</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-orange-400">●</span>
                  <span className="text-gray-400">Tâches</span>
                  <span className="ml-auto text-white">{assemblage.taches.length} briques</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-yellow-400">●</span>
                  <span className="text-gray-400">Tags</span>
                  <span className="ml-auto text-white">{assemblage.tags.length} briques</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-purple-400">●</span>
                  <span className="text-gray-400">Règles</span>
                  <span className="ml-auto text-white">{assemblage.regles.length} briques</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-cyan-400">●</span>
                  <span className="text-gray-400">Spécifications</span>
                  <span className="ml-auto text-white">{assemblage.specifications.length} briques</span>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
              <h3 className="font-medium text-green-300 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Recommandations
              </h3>
              <div className="space-y-2 text-sm">
                {assemblage.competences.length < 3 && (
                  <div className="text-yellow-300">• Ajoutez au moins une compétence</div>
                )}
                {assemblage.outils.length < 2 && (
                  <div className="text-blue-300">• Définissez des limites claires pour éviter les dérives</div>
                )}
                {assemblage.taches.length < 1 && (
                  <div className="text-orange-300">• Spécifiez les outils techniques maîtrisés</div>
                )}
                {calculerScore() >= 75 && (
                  <div className="text-green-300">• Profil prêt pour la génération! 🎉</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
              <h3 className="font-medium text-red-300 mb-3 flex items-center">
                <span className="mr-2">🎬</span>
                Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/cockpit/admin/profils')}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm flex items-center justify-center"
                >
                  🔙 Retour Marketplace
                </button>

                <button
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  🗂️ Nouveau Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}