'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Star, User, Calendar } from 'lucide-react';
import AdminNavigation from '../../components/AdminNavigation';

interface ProfilDetail {
  id: string;
  nom: string;
  slug: string;
  domaine: string;
  secteurs_cibles: string[];
  description_courte: string;
  description_longue: string;
  sections_preview: string[];
  competences: string[];
  outils: string[];
  taches_types: string[];
  tags: string[];
  regles_limites: string[];
  prompt_systeme: string;
  prompt_regles_livraisons: string;
  prompt_regles_discussion: string;
  exemples_conversation: { question: string; reponse: string }[];
  note_moyenne?: number;
  nb_evaluations?: number;
  nb_utilisations: number;
  cree_par: string;
  cree_le: string;
  modifie_le?: string;
  visibilite: 'private' | 'internal' | 'public';
  statut: 'draft' | 'active' | 'archived';
}

export default function ProfilDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profilId = params?.id as string;

  const [profil, setProfil] = useState<ProfilDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (profilId) {
      loadProfilDetail(profilId);
    }
  }, [profilId]);

  const loadProfilDetail = async (id: string) => {
    setLoading(true);
    try {
      // Mock data for now - would call API in real implementation
      const mockProfil: ProfilDetail = {
        id,
        nom: 'Expert Comptable PME',
        slug: 'expert-comptable-pme',
        domaine: 'Finance',
        secteurs_cibles: ['Manufacturing', 'Retail'],
        description_courte: 'Expert en comptabilité PME avec 15 ans d\'expérience industrielle. Spécialiste des processus comptables pour les entreprises manufacturières et commerciales.',
        description_longue: 'Expert-comptable diplômé avec 15 années d\'expérience dédiées aux PME industrielles. Maîtrise complète des normes comptables françaises et internationales, avec une expertise particulière dans l\'optimisation fiscale et le contrôle de gestion. Accompagne les dirigeants dans leurs décisions stratégiques grâce à des analyses financières précises et des tableaux de bord personnalisés.',
        sections_preview: ['Comptabilité générale', 'Fiscalité PME', 'Analyse financière', 'Audit interne', 'Reporting financier'],
        competences: ['Comptabilité générale', 'Fiscalité PME', 'Analyse financière', 'Audit interne', 'Reporting financier', 'Contrôle de gestion', 'Consolidation', 'Optimisation fiscale'],
        outils: ['Excel Avancé', 'SAP Business One', 'Sage', 'QuickBooks', 'Power BI', 'Tableau', 'Python Finance'],
        taches_types: ['Établir les comptes annuels', 'Analyser le cashflow', 'Optimiser la fiscalité', 'Mettre en place le contrôle de gestion', 'Créer des tableaux de bord', 'Audit des processus comptables'],
        tags: ['PME', 'Manufacturing', 'Retail', 'Expert-Comptable', '15+ ans exp', 'Diplômé', 'Bilingue'],
        regles_limites: ['Pas de conseil juridique', 'PME < 500 salariés', 'Pas d\'audit externe certifié', 'Focus secteur industriel et commercial'],
        prompt_systeme: 'Tu es un expert-comptable spécialisé dans les PME industrielles et commerciales. Tu maîtrises parfaitement la comptabilité française, l\'optimisation fiscale et le contrôle de gestion. Tu accompagnes les dirigeants avec des conseils précis et pragmatiques, toujours dans le respect de la réglementation.',
        prompt_regles_livraisons: `## Règles de Livrables - Expert Comptable PME

**Format des livrables attendus :**

1. **Analyses financières** : Format Excel avec onglets séparés (Bilan, Compte de résultat, Ratios, Commentaires). Tous les calculs doivent être transparents avec formules visibles.

2. **Rapports comptables** : Document Word structuré avec sommaire, utilisant les templates PME standards. Maximum 10 pages pour les rapports mensuels, 25 pages pour les annuels.

3. **Tableaux de bord** : Format PowerBI ou Excel avec graphiques automatisés, indicateurs KPI colorisés (vert/orange/rouge), mise à jour mensuelle obligatoire.

4. **Déclarations fiscales** : Respect strict des formulaires CERFA officiels, vérification croisée des montants, archivage PDF/A obligatoire.

5. **Recommandations** : Toujours accompagnées d'un chiffrage d'impact, délais de mise en œuvre, et niveau de priorité (critique/important/souhaitable).

**Qualité requise :**
- Aucune approximation sur les montants
- Sources clairement identifiées
- Hypothèses explicites
- Conclusions opérationnelles
- Respect des échéances légales`,
        prompt_regles_discussion: `## Règles de Discussion - Expert Comptable PME

**Ton et approche :**
- Langage professionnel mais accessible, éviter le jargon technique excessif
- Toujours commencer par reformuler la question pour s'assurer de la compréhension
- Poser des questions de clarification avant de donner des conseils définitifs

**Structure de réponse :**
1. **Reformulation** : "Si je comprends bien, vous souhaitez..."
2. **Contexte** : Rappel des éléments importants à considérer
3. **Analyse** : Explications techniques nécessaires
4. **Recommandations** : Actions concrètes prioritaires
5. **Prochaines étapes** : Planning et ressources nécessaires

**Limites à respecter :**
- Ne jamais donner de conseils juridiques : "Pour les aspects juridiques, je vous recommande de consulter votre avocat"
- Ne pas promettre de résultats fiscaux non garantis
- Toujours rappeler les obligations légales et deadlines
- Signaler quand une situation dépasse le cadre PME (>500 salariés)

**Questions obligatoires à poser :**
- Secteur d'activité et taille de l'entreprise
- Chiffre d'affaires approximatif
- Régime fiscal actuel
- Échéances urgentes en cours
- Objectifs business à court/moyen terme

**Escalade :**
- Audit externe certifié → Orienter vers un CAC
- Litiges complexes → Orienter vers un expert judiciaire
- Fiscalité internationale → Orienter vers un spécialiste
- Financement > 500K€ → Orienter vers un expert en corporate finance`,
        exemples_conversation: [
          {
            question: 'Comment optimiser ma fiscalité d\'entreprise cette année ?',
            reponse: 'Pour optimiser votre fiscalité, je vous recommande d\'analyser plusieurs leviers : les amortissements dégressifs pour vos investissements, la déductibilité de certaines charges, et potentiellement un lissage de vos résultats. Pouvez-vous me préciser votre secteur d\'activité et votre chiffre d\'affaires approximatif ?'
          },
          {
            question: 'Mes marges se dégradent, comment identifier les causes ?',
            reponse: 'Une dégradation des marges peut avoir plusieurs origines. Je vais vous aider à mettre en place une analyse ABC de vos coûts et un suivi des marges par produit/service. Nous devrons examiner l\'évolution de vos coûts directs, indirects et la rentabilité par segment d\'activité.'
          }
        ],
        note_moyenne: 4.8,
        nb_evaluations: 156,
        nb_utilisations: 247,
        cree_par: 'Jean Expert',
        cree_le: '2025-09-10T10:00:00Z',
        modifie_le: '2025-09-15T14:30:00Z',
        visibilite: 'public',
        statut: 'active'
      };

      setProfil(mockProfil);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    // TODO: Redirect to agent creation with this profil
    router.push(`/cockpit/admin/profils/adapter?id=${profilId}`);
  };

  const handleCompose = () => {
    router.push(`/cockpit/admin/profils/compose?profil=${profilId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profil) {
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
    <div className="min-h-screen text-white" style={{ backgroundColor: 'var(--bg)' }}>
      <AdminNavigation />

      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Header */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h1 className="text-3xl font-bold">{profil.nom}</h1>
                    <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm">
                      {profil.domaine}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      profil.statut === 'active' ? 'bg-green-900/30 text-green-300' :
                      profil.statut === 'draft' ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {profil.statut === 'active' ? 'Actif' : profil.statut === 'draft' ? 'Brouillon' : 'Archivé'}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {profil.description_courte}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    {profil.note_moyenne && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{profil.note_moyenne}</span>
                        <span>({profil.nb_evaluations} avis)</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{profil.nb_utilisations} utilisations</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Créé par {profil.cree_par}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 ml-6">
                  <button
                    onClick={() => router.push(`/cockpit/admin/profils/${profilId}/edit`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Éditer Profil
                  </button>
                  <button
                    onClick={handleCreateAgent}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Créer Agent
                  </button>
                  <button
                    onClick={handleCompose}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Ajouter à Builder
                  </button>
                </div>
              </div>
            </div>

            {/* Description longue */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <span>📋</span>
                <span>Description détaillée</span>
              </h2>
              <p className="text-gray-300 leading-relaxed">{profil.description_longue}</p>
            </div>

            {/* Grille des compétences et outils */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Compétences */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-orange-300">
                  <span>🎯</span>
                  <span>Compétences</span>
                </h2>
                <div className="space-y-2">
                  {profil.competences.map((competence, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-orange-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{competence}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outils */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-blue-300">
                  <span>🔧</span>
                  <span>Outils Maîtrisés</span>
                </h2>
                <div className="space-y-2">
                  {profil.outils.map((outil, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-blue-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{outil}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tâches types */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-green-300">
                <span>📋</span>
                <span>Exemples de Tâches</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profil.taches_types.map((tache, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{tache}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt système */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <span>🤖</span>
                <span>Configuration IA</span>
              </h2>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300 text-sm font-mono leading-relaxed">{profil.prompt_systeme}</p>
              </div>
            </div>

            {/* Exemples de conversation */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <span>💬</span>
                <span>Exemples de Conversations</span>
              </h2>
              <div className="space-y-4">
                {profil.exemples_conversation.map((exemple, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="mb-3">
                      <span className="text-xs text-gray-400 font-medium">QUESTION</span>
                      <p className="text-gray-300 text-sm mt-1">{exemple.question}</p>
                    </div>
                    <div>
                      <span className="text-xs text-orange-400 font-medium">RÉPONSE</span>
                      <p className="text-gray-300 text-sm mt-1 leading-relaxed">{exemple.reponse}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spécifications & Cadrage */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-cyan-300">
                <span>📋</span>
                <span>Spécifications & Cadrage</span>
              </h2>

              {/* Règles Arka de base */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-3 text-cyan-200">📌 Règles de Base Arka</h3>
                <div className="bg-cyan-900/20 border border-cyan-600/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Connaissance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Pertinence</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Invitation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Faisabilité</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Clarification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Cadrage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">DoD</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Clarté</span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Budgets performances */}
              <div>
                <h3 className="text-md font-medium mb-3 text-cyan-200">⚡ Budgets Performances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-300 mb-2">API Latency</h4>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div className="flex justify-between">
                        <span>P95 Latency</span>
                        <span className="font-mono">&lt; 500ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TTFT</span>
                        <span className="font-mono">&lt; 1500ms</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-orange-300 mb-2">UI Performance</h4>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div className="flex justify-between">
                        <span>LCP (P75)</span>
                        <span className="font-mono">&lt; 2500ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TTI (P75)</span>
                        <span className="font-mono">&lt; 2000ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>A11y Score</span>
                        <span className="font-mono">≥ AA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Règles et Limites */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-red-300">
                <span>⚠️</span>
                <span>Règles et Limites</span>
              </h2>
              <div className="space-y-2">
                {profil.regles_limites.map((regle, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-200 text-sm">{regle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Règles de Livraisons */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center cursor-pointer"
                  onClick={() => setExpandedPrompt(expandedPrompt === 'livraisons' ? null : 'livraisons')}>
                <span className="mr-2">📦</span>
                <span>Règles de Livraisons</span>
                <span className="ml-auto text-orange-400">
                  {expandedPrompt === 'livraisons' ? '▼' : '▶'}
                </span>
              </h2>
              {expandedPrompt === 'livraisons' && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <textarea
                    value={profil.prompt_regles_livraisons || "Règles de livraisons non définies"}
                    readOnly
                    className="w-full h-64 bg-gray-600 text-gray-300 text-sm leading-relaxed p-3 rounded border-none resize-y"
                  />
                </div>
              )}
            </div>

            {/* Règles de Discussion */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center cursor-pointer"
                  onClick={() => setExpandedPrompt(expandedPrompt === 'discussion' ? null : 'discussion')}>
                <span className="mr-2">💬</span>
                <span>Règles de Discussion</span>
                <span className="ml-auto text-orange-400">
                  {expandedPrompt === 'discussion' ? '▼' : '▶'}
                </span>
              </h2>
              {expandedPrompt === 'discussion' && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <textarea
                    value={profil.prompt_regles_discussion || "Règles de discussion non définies"}
                    readOnly
                    className="w-full h-64 bg-gray-600 text-gray-300 text-sm leading-relaxed p-3 rounded border-none resize-y"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Secteurs cibles */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Secteurs Cibles</h3>
              <div className="space-y-2">
                {profil.secteurs_cibles.map((secteur, index) => (
                  <span key={index} className="block px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm">
                    {secteur}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-purple-300">
                <span>🏷️</span>
                <span>Tags</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {profil.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Métadonnées */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Visibilité</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    profil.visibilite === 'public' ? 'bg-green-900/30 text-green-300' :
                    profil.visibilite === 'internal' ? 'bg-blue-900/30 text-blue-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {profil.visibilite === 'public' ? 'Public' :
                     profil.visibilite === 'internal' ? 'Interne' : 'Privé'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Créé le</span>
                  <span className="text-gray-300">{new Date(profil.cree_le).toLocaleDateString('fr-FR')}</span>
                </div>
                {profil.modifie_le && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Modifié le</span>
                    <span className="text-gray-300">{new Date(profil.modifie_le).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">ID</span>
                  <span className="text-gray-300 font-mono text-xs">{profil.id}</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-sm">
                  📊 Analyser Performance
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm">
                  📋 Dupliquer Profil
                </button>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                  📤 Exporter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}