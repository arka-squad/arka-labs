// B30 Phase 3 - API Preview Composition
// Prévisualisation et test de compositions multi-profils

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getB30Engine } from '@/lib/b30/engine';

interface PreviewCompositionRequest {
  scenario_test: string;
  contexte?: {
    secteur?: string;
    taille_entreprise?: string;
    contraintes?: string[];
    objectifs?: string[];
  };
  options?: {
    include_reasoning?: boolean;
    test_fallback?: boolean;
    simulate_load?: boolean;
  };
}

// ================================
// POST /api/b30/compositions/{id}/preview
// ================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const compositionId = params.id;
    const body: PreviewCompositionRequest = await request.json();

    // Validation
    if (!body.scenario_test?.trim()) {
      return NextResponse.json(
        { error: 'Scenario de test requis' },
        { status: 400 }
      );
    }

    // Récupération de la composition complète
    const compositionQuery = `
      SELECT
        c.*,
        array_agg(
          json_build_object(
            'profil_id', cp.profil_id,
            'profil_nom', ap.nom,
            'ponderation', cp.ponderation,
            'role', cp.role,
            'sections_incluses', cp.sections_incluses,
            'sections_exclues', cp.sections_exclues,
            'conditions_activation', cp.conditions_activation,
            'adaptations_locales', cp.adaptations_locales,
            'prompt_system', ap.identity_prompt,
            'domaine', ap.domaine
          )
        ) as profils_composition
      FROM profil_compositions c
      LEFT JOIN composition_profils cp ON c.id = cp.composition_id
      LEFT JOIN agent_profils ap ON cp.profil_id = ap.id
      WHERE c.id = $1 AND c.supprime_le IS NULL
      GROUP BY c.id
    `;

    const compositionResult = await query(compositionQuery, [compositionId]);

    if (compositionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Composition non trouvée' },
        { status: 404 }
      );
    }

    const composition = compositionResult.rows[0];
    const profils = composition.profils_composition.filter((p: any) => p.profil_id);

    // Simulation de sélection de profil selon la stratégie
    const simulation = await simulateCompositionExecution(
      composition,
      profils,
      body.scenario_test,
      body.contexte || {}
    );

    // Génération de réponse simulée via B30 Engine
    const engine = getB30Engine();
    let reponseSimulee = '';
    let promptFinalUtilise = '';

    try {
      // Construction du contexte pour le moteur B30
      const contexteProfil = {
        query: body.scenario_test,
        keywords: extractKeywords(body.scenario_test),
        domain: body.contexte?.secteur || 'general',
        urgency: detectUrgency(body.scenario_test),
        complexity: detectComplexity(body.scenario_test),
        user_context: body.contexte ? {
          role: 'preview_user',
          organization_size: mapTailleEntreprise(body.contexte.taille_entreprise),
          industry: [body.contexte.secteur || 'general']
        } : undefined
      };

      // Simulation avec le profil dominant
      const profilDominant = profils.find((p: any) =>
        p.profil_id === simulation.profil_active_principal
      );

      if (profilDominant) {
        // Création d'un profil temporaire pour la simulation
        const profilSimulation = {
          id: profilDominant.profil_id,
          nom: profilDominant.profil_nom,
          identity_prompt: profilDominant.prompt_system,
          domaine: profilDominant.domaine,
          sections: [] // TODO: Charger les sections réelles
        };

        const executionRequest = {
          profil_id: profilDominant.profil_id,
          user_query: body.scenario_test,
          context: contexteProfil,
          options: {
            includeDebugInfo: body.options?.include_reasoning || false,
            maxTokens: 1500,
            temperature: 0.7
          }
        };

        // Note: En mode preview, on simule la réponse plutôt que d'appeler vraiment l'IA
        reponseSimulee = generateSimulatedResponse(
          composition.strategie_fusion,
          profilDominant,
          body.scenario_test,
          body.contexte
        );

        promptFinalUtilise = `Composition "${composition.nom}" - Profil dominant: ${profilDominant.profil_nom}\n\nScénario: ${body.scenario_test}`;
      }

    } catch (engineError) {
      console.warn('Engine simulation failed, using mock response:', engineError);
      reponseSimulee = generateFallbackResponse(body.scenario_test);
      promptFinalUtilise = 'Mock prompt for preview';
    }

    // Analyse de performance
    const analysePerformance = analyzePreviewPerformance(
      reponseSimulee,
      body.scenario_test,
      composition.strategie_fusion,
      simulation
    );

    // Construction de la trace de raisonnement si demandée
    let traceRaisonnement = undefined;
    if (body.options?.include_reasoning) {
      traceRaisonnement = buildReasoningTrace(
        composition.strategie_fusion,
        profils,
        simulation,
        body.scenario_test
      );
    }

    // Recommandations d'amélioration
    const recommandationsAmelioration = generateImprovementRecommendations(
      analysePerformance,
      composition,
      simulation
    );

    // Construction de la réponse
    const response = {
      simulation: {
        profil_active_principal: simulation.profil_active_principal,
        profils_support: simulation.profils_support,
        ponderation_effective: simulation.ponderation_effective,
        sections_utilisees: simulation.sections_utilisees
      },
      reponse_simulee: reponseSimulee,
      prompt_final_utilise: promptFinalUtilise,
      analyse_performance: analysePerformance,
      trace_raisonnement: traceRaisonnement,
      recommandations_amelioration: recommandationsAmelioration
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in composition preview:', error);
    return NextResponse.json(
      {
        error: 'Failed to preview composition',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ================================
// MÉTHODES DE SIMULATION
// ================================

async function simulateCompositionExecution(
  composition: any,
  profils: any[],
  scenario: string,
  contexte: any
) {
  const keywords = extractKeywords(scenario);

  // Simulation selon la stratégie
  switch (composition.strategie_fusion) {
    case 'weighted_blend':
      return simulateWeightedBlend(profils, keywords);

    case 'sequential':
      return simulateSequential(profils, keywords, contexte);

    case 'conditional':
      return simulateConditional(profils, keywords, contexte);

    default:
      return simulateWeightedBlend(profils, keywords);
  }
}

function simulateWeightedBlend(profils: any[], keywords: string[]) {
  // Dans une stratégie weighted_blend, tous les profils contribuent selon leur pondération
  const profilDominant = profils.reduce((max, profil) =>
    profil.ponderation > max.ponderation ? profil : max
  );

  const ponderation_effective: { [key: string]: number } = {};
  profils.forEach(profil => {
    ponderation_effective[profil.profil_id] = profil.ponderation;
  });

  const sections_utilisees = profils.flatMap(profil => [
    {
      profil_id: profil.profil_id,
      section_nom: 'Expertise principale',
      contribution_score: profil.ponderation
    }
  ]);

  return {
    profil_active_principal: profilDominant.profil_id,
    profils_support: profils
      .filter(p => p.profil_id !== profilDominant.profil_id)
      .map(p => p.profil_id),
    ponderation_effective,
    sections_utilisees
  };
}

function simulateSequential(profils: any[], keywords: string[], contexte: any) {
  // En séquentiel, on sélectionne le premier profil le plus pertinent
  const profilPrincipal = profils[0]; // Simplification

  return {
    profil_active_principal: profilPrincipal.profil_id,
    profils_support: [],
    ponderation_effective: {
      [profilPrincipal.profil_id]: 1.0
    },
    sections_utilisees: [
      {
        profil_id: profilPrincipal.profil_id,
        section_nom: 'Workflow principal',
        contribution_score: 1.0
      }
    ]
  };
}

function simulateConditional(profils: any[], keywords: string[], contexte: any) {
  // En conditionnel, on sélectionne selon les conditions d'activation
  for (const profil of profils) {
    const conditions = profil.conditions_activation || {};
    const trigger_keywords = conditions.keywords_trigger || [];

    // Vérifier si les keywords matchent
    const matchingKeywords = keywords.filter(k =>
      trigger_keywords.some((tk: string) => k.toLowerCase().includes(tk.toLowerCase()))
    );

    if (matchingKeywords.length > 0) {
      return {
        profil_active_principal: profil.profil_id,
        profils_support: [],
        ponderation_effective: {
          [profil.profil_id]: 1.0
        },
        sections_utilisees: [
          {
            profil_id: profil.profil_id,
            section_nom: 'Expertise conditionnelle',
            contribution_score: 1.0
          }
        ]
      };
    }
  }

  // Fallback au profil avec la plus forte pondération
  const fallbackProfil = profils.reduce((max, profil) =>
    profil.ponderation > max.ponderation ? profil : max
  );

  return {
    profil_active_principal: fallbackProfil.profil_id,
    profils_support: [],
    ponderation_effective: {
      [fallbackProfil.profil_id]: 1.0
    },
    sections_utilisees: [
      {
        profil_id: fallbackProfil.profil_id,
        section_nom: 'Fallback expertise',
        contribution_score: 1.0
      }
    ]
  };
}

// ================================
// GÉNÉRATION DE CONTENU SIMULÉ
// ================================

function generateSimulatedResponse(
  strategie: string,
  profilDominant: any,
  scenario: string,
  contexte: any
): string {
  const strategiePrefix = {
    weighted_blend: "En combinant plusieurs expertises,",
    sequential: "Selon une approche étape par étape,",
    conditional: "Après analyse du contexte spécifique,"
  };

  const prefix = strategiePrefix[strategie as keyof typeof strategiePrefix] || "En tant qu'expert,";

  return `${prefix} voici mon analyse du scénario "${scenario}":

**Analyse du besoin :**
Selon l'expertise ${profilDominant.profil_nom}, ce scénario nécessite une approche ${strategie === 'conditional' ? 'adaptée au contexte' : 'méthodique'}.

**Recommandations :**
1. Évaluation préliminaire des contraintes${contexte?.contraintes ? ` (notamment : ${contexte.contraintes.join(', ')})` : ''}
2. Mise en place d'une méthodologie adaptée au secteur${contexte?.secteur ? ` ${contexte.secteur}` : ''}
3. Suivi et ajustements selon les retours

**Livrables suggérés :**
- Plan d'action détaillé
- Indicateurs de performance${contexte?.objectifs ? ` alignés sur : ${contexte.objectifs.join(', ')}` : ''}
- Points de contrôle réguliers

Cette réponse est générée en mode prévisualisation et combine l'expertise ${profilDominant.profil_nom} selon la stratégie ${strategie}.`;
}

function generateFallbackResponse(scenario: string): string {
  return `[SIMULATION] Réponse générée pour le scénario : "${scenario}"

Cette prévisualisation montre comment la composition réagirait à ce cas d'usage. En production, la réponse serait générée par l'IA selon les profils configurés.

**Points clés identifiés :**
- Analyse du contexte fourni
- Application de la stratégie de composition
- Intégration des expertises sélectionnées
- Génération de recommandations adaptées

Pour une réponse complète, veuillez tester avec un agent déployé.`;
}

// ================================
// ANALYSE DE PERFORMANCE
// ================================

function analyzePreviewPerformance(
  reponse: string,
  scenario: string,
  strategie: string,
  simulation: any
) {
  // Calculs basiques de qualité (simulation)
  const pertinenceTechnique = calculateTechnicalRelevance(reponse, scenario);
  const qualiteCoherence = calculateCoherence(reponse, strategie);
  const completudeReponse = calculateCompleteness(reponse);

  const scoreGlobal = (pertinenceTechnique + qualiteCoherence + completudeReponse) / 3;

  return {
    pertinence_technique: pertinenceTechnique,
    qualite_coherence: qualiteCoherence,
    completude_reponse: completudeReponse,
    score_global: parseFloat(scoreGlobal.toFixed(1))
  };
}

function calculateTechnicalRelevance(reponse: string, scenario: string): number {
  // Score basique basé sur la longueur et présence de mots-clés techniques
  const scenarioWords = scenario.toLowerCase().split(/\s+/);
  const reponseWords = reponse.toLowerCase().split(/\s+/);

  const commonWords = scenarioWords.filter(word =>
    word.length > 3 && reponseWords.includes(word)
  );

  const relevanceRatio = commonWords.length / Math.max(scenarioWords.length, 1);
  return Math.min(5, Math.max(1, Math.round((3 + relevanceRatio * 2) * 10) / 10));
}

function calculateCoherence(reponse: string, strategie: string): number {
  // Score basé sur la structure et cohérence de la réponse
  const hasStructure = reponse.includes('**') || reponse.includes('-') || reponse.includes('1.');
  const appropriateLength = reponse.length >= 200 && reponse.length <= 2000;

  let baseScore = 3;
  if (hasStructure) baseScore += 0.5;
  if (appropriateLength) baseScore += 0.5;

  // Bonus selon stratégie
  if (strategie === 'weighted_blend' && reponse.includes('combinant')) baseScore += 0.5;
  if (strategie === 'conditional' && reponse.includes('contexte')) baseScore += 0.5;

  return Math.min(5, Math.max(1, Math.round(baseScore * 10) / 10));
}

function calculateCompleteness(reponse: string): number {
  // Score basé sur la présence d'éléments complets
  const hasAnalysis = reponse.toLowerCase().includes('analyse');
  const hasRecommendations = reponse.toLowerCase().includes('recommandation');
  const hasDeliverables = reponse.toLowerCase().includes('livrable');
  const hasStructuredContent = (reponse.match(/\*\*/g) || []).length >= 4;

  let score = 2;
  if (hasAnalysis) score += 0.7;
  if (hasRecommendations) score += 0.7;
  if (hasDeliverables) score += 0.6;
  if (hasStructuredContent) score += 0.5;

  return Math.min(5, Math.max(1, Math.round(score * 10) / 10));
}

// ================================
// MÉTHODES UTILITAIRES
// ================================

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['le', 'la', 'les', 'un', 'une', 'de', 'du', 'des', 'et', 'ou']);
  return text.toLowerCase()
    .replace(/[^a-zàâäéêëïîôöùûüÿç\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 10);
}

function detectUrgency(text: string): 'low' | 'medium' | 'high' {
  const urgentWords = ['urgent', 'rapidement', 'vite', 'immédiat', 'asap', 'critique'];
  return urgentWords.some(word => text.toLowerCase().includes(word)) ? 'high' : 'medium';
}

function detectComplexity(text: string): 'simple' | 'complex' {
  const complexWords = ['analyse', 'architecture', 'optimisation', 'stratégie', 'audit'];
  return complexWords.some(word => text.toLowerCase().includes(word)) ? 'complex' : 'simple';
}

function mapTailleEntreprise(taille?: string): string {
  const mapping = {
    'startup': 'startup',
    'pme': 'small',
    'eti': 'medium',
    'ge': 'enterprise'
  };
  return mapping[taille as keyof typeof mapping] || 'medium';
}

function buildReasoningTrace(
  strategie: string,
  profils: any[],
  simulation: any,
  scenario: string
) {
  const trace = [
    {
      etape: "Analyse du scénario",
      profil_selectionne: "N/A",
      raison: `Extraction des mots-clés du scénario: "${scenario}"`,
      confidence: 0.9
    },
    {
      etape: "Sélection de stratégie",
      profil_selectionne: "N/A",
      raison: `Application de la stratégie "${strategie}"`,
      confidence: 1.0
    },
    {
      etape: "Activation du profil principal",
      profil_selectionne: simulation.profil_active_principal,
      raison: `Profil sélectionné selon ${strategie === 'weighted_blend' ? 'pondération maximale' : 'critères de correspondance'}`,
      confidence: 0.8
    }
  ];

  if (simulation.profils_support.length > 0) {
    trace.push({
      etape: "Activation des profils support",
      profil_selectionne: simulation.profils_support.join(', '),
      raison: "Profils complémentaires selon la stratégie de composition",
      confidence: 0.7
    });
  }

  return trace;
}

function generateImprovementRecommendations(
  performance: any,
  composition: any,
  simulation: any
): string[] {
  const recommendations = [];

  if (performance.score_global < 3) {
    recommendations.push("Améliorer la cohérence entre les profils de la composition");
  }

  if (performance.pertinence_technique < 3) {
    recommendations.push("Ajouter des mots-clés plus spécifiques aux profils");
  }

  if (simulation.profils_support.length === 0 && composition.strategie_fusion === 'weighted_blend') {
    recommendations.push("Vérifier l'équilibrage des pondérations pour une meilleure utilisation des profils");
  }

  if (composition.strategie_fusion === 'conditional') {
    recommendations.push("Affiner les conditions d'activation pour une sélection plus précise");
  }

  recommendations.push("Tester avec différents scénarios pour valider la robustesse");

  return recommendations;
}