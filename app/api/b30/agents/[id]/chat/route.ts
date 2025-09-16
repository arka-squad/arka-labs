// B30 Phase 3 - API Chat Agent
// Interaction avec agents composés via moteur B30

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getB30Engine } from '@/lib/b30/engine';

interface ChatAgentRequest {
  message: string;
  contexte?: {
    thread_id?: string;
    canal?: "web" | "api" | "teams" | "slack";
    utilisateur_id?: string;
    metadata?: object;
  };
  options?: {
    mode_debug?: boolean;
    trace_sections?: boolean;
    limiter_tokens?: number;
    provider_override?: string;
    temperature_override?: number;
  };
  feedback_precedent?: {
    interaction_id: string;
    rating: number;
    commentaire?: string;
  };
}

// ================================
// POST /api/b30/agents/{id}/chat
// ================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const body: ChatAgentRequest = await request.json();

    // Validation du message
    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    if (body.message.length > 10000) {
      return NextResponse.json(
        { error: 'Message trop long (max 10000 caractères)' },
        { status: 400 }
      );
    }

    // TODO: User ID à récupérer depuis JWT
    const userId = 'temp-user-id';

    // Traitement du feedback précédent si fourni
    if (body.feedback_precedent) {
      await processFeedback(body.feedback_precedent, userId);
    }

    // Récupération de l'agent complet
    const agentQuery = `
      SELECT
        ac.*,
        p.nom as projet_nom,
        p.client_nom
      FROM agents_composes ac
      LEFT JOIN projets p ON ac.projet_id = p.id
      WHERE ac.id = $1 AND ac.supprime_le IS NULL
    `;

    const agentResult = await query(agentQuery, [agentId]);

    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Agent non trouvé' },
        { status: 404 }
      );
    }

    const agent = agentResult.rows[0];

    // Vérification du statut de l'agent
    if (agent.statut === 'archived') {
      return NextResponse.json(
        { error: 'Agent archivé, interaction impossible' },
        { status: 410 }
      );
    }

    if (agent.statut === 'paused') {
      return NextResponse.json(
        { error: 'Agent en pause, veuillez l\'activer d\'abord' },
        { status: 423 }
      );
    }

    const startTime = Date.now();

    // Préparation du contexte conversationnel
    const contexteConversation = await buildConversationContext(
      agentId,
      body.contexte?.thread_id,
      body.contexte || {}
    );

    // Construction de la requête B30 à partir de la configuration de l'agent
    const configurationAgent = JSON.parse(agent.configuration_finale);
    const contexteAdaptation = JSON.parse(agent.contexte_adaptation);

    // Extraction du profil ou composition source pour utiliser le moteur B30
    let b30Request;

    if (agent.source_type === 'profil') {
      b30Request = {
        profil_id: agent.source_id,
        user_query: body.message,
        context: {
          query: body.message,
          keywords: extractKeywords(body.message),
          domain: contexteAdaptation.secteur_activite || 'general',
          urgency: detectUrgency(body.message),
          complexity: detectComplexity(body.message),
          user_context: {
            role: 'agent_user',
            organization_size: mapTailleEntreprise(contexteAdaptation.taille_entreprise),
            industry: contexteAdaptation.secteur_activite ? [contexteAdaptation.secteur_activite] : []
          }
        },
        options: {
          includeDebugInfo: body.options?.mode_debug || false,
          maxTokens: body.options?.limiter_tokens || configurationAgent.parametres_finaux.max_tokens,
          temperature: body.options?.temperature_override || configurationAgent.parametres_finaux.temperature,
          provider: body.options?.provider_override || configurationAgent.parametres_finaux.provider_preference,
          customInstructions: buildCustomInstructions(contexteAdaptation, contexteConversation),
          includeUserContext: true
        }
      };
    } else {
      // Pour les compositions, on simule une exécution adaptée
      b30Request = await buildCompositionRequest(
        agent,
        body.message,
        contexteAdaptation,
        body.options || {}
      );
    }

    // Exécution via le moteur B30
    const engine = getB30Engine();
    let executionResult;

    try {
      executionResult = await engine.execute(b30Request);
    } catch (engineError) {
      console.error('B30 Engine execution failed:', engineError);

      // Fallback avec réponse d'erreur gracieuse
      executionResult = {
        response: "Je rencontre actuellement des difficultés techniques. Pouvez-vous reformuler votre demande ou réessayer dans quelques instants ?",
        execution_success: false,
        metadata: {
          profil_used: { id: agent.source_id, nom: 'Fallback', version: 'error' },
          sections_selected: { count: 0, types: [], average_score: 0 },
          provider_used: 'fallback',
          execution_id: 'error_' + Date.now(),
          created_at: new Date(),
          context_hash: 'error'
        },
        performance: {
          total_time_ms: Date.now() - startTime,
          selection_time_ms: 0,
          assembly_time_ms: 0,
          execution_time_ms: 0,
          tokens_used: 0,
          cache_hit: false
        }
      };
    }

    const endTime = Date.now();

    // Génération de l'ID d'interaction
    const interactionId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Enregistrement de l'interaction
    await saveInteraction({
      id: interactionId,
      agent_id: agentId,
      message: body.message,
      reponse: executionResult.response,
      success: executionResult.execution_success,
      duree_ms: endTime - startTime,
      tokens_utilises: executionResult.performance.tokens_used,
      contexte: body.contexte || {},
      thread_id: body.contexte?.thread_id || interactionId,
      utilisateur_id: userId
    });

    // Mise à jour des statistiques de l'agent
    await updateAgentStats(agentId, executionResult.execution_success, executionResult.performance.tokens_used);

    // Construction des informations debug si demandées
    let debugInfo = undefined;
    if (body.options?.mode_debug && executionResult.debug_info) {
      debugInfo = {
        prompt_final_utilise: executionResult.debug_info.assembled_prompt,
        provider_utilise: executionResult.metadata.provider_used,
        parametres_effectifs: configurationAgent.parametres_finaux,
        contexte_active: Object.keys(contexteAdaptation),
        etapes_raisonnement: executionResult.debug_info.sections_scores?.map((s: any) => ({
          etape: 'Section évaluation',
          section_activee: s.section?.nom || 'Unknown',
          keywords_detectes: s.matched_keywords || [],
          decision: `Score: ${s.score}, Confiance: ${s.confidence}`
        })) || [],
        temps_assemblage_ms: executionResult.performance.assembly_time_ms,
        temps_provider_ms: executionResult.performance.execution_time_ms,
        cache_hit: executionResult.performance.cache_hit
      };
    }

    // Génération d'actions suggérées
    const actionsSuggerees = generateSuggestedActions(
      body.message,
      executionResult.response,
      contexteAdaptation,
      executionResult.execution_success
    );

    // Contexte pour interaction suivante
    const contexteSuivant = {
      thread_id: body.contexte?.thread_id || interactionId,
      etat_conversation: {
        derniere_intention: detectIntention(body.message),
        domaine_actuel: contexteAdaptation.secteur_activite || 'general',
        niveau_detail_prefere: contexteAdaptation.niveau_detail || 'standard'
      },
      historique_decisions: [
        `Message traité: ${body.message.substring(0, 50)}...`,
        `Profil activé: ${executionResult.metadata.profil_used.nom}`,
        `Tokens utilisés: ${executionResult.performance.tokens_used}`
      ]
    };

    // Construction de la réponse finale
    const chatResponse = {
      reponse: executionResult.response,
      interaction: {
        id: interactionId,
        timestamp: new Date().toISOString(),
        duree_ms: endTime - startTime,
        tokens_utilises: executionResult.performance.tokens_used,
        cout_estime: calculateCost(executionResult.performance.tokens_used, executionResult.metadata.provider_used),
        profil_dominant: executionResult.metadata.profil_used.id,
        sections_activees: executionResult.metadata.sections_selected.types,
        ponderation_sections: body.options?.trace_sections ?
          generateSectionWeights(executionResult.debug_info?.sections_scores) : {}
      },
      debug: debugInfo,
      actions_suggerees: actionsSuggerees,
      contexte_suivant: contexteSuivant
    };

    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error('Error in agent chat:', error);
    return NextResponse.json(
      {
        error: 'Chat execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ================================
// GESTION DU CONTEXTE CONVERSATIONNEL
// ================================

async function buildConversationContext(
  agentId: string,
  threadId?: string,
  contexte?: any
): Promise<any> {
  let historiqueRecent = [];

  if (threadId) {
    // Récupération des dernières interactions de la conversation
    const historiqueQuery = `
      SELECT message, reponse, cree_le
      FROM agent_interactions
      WHERE agent_id = $1 AND thread_id = $2
      ORDER BY cree_le DESC
      LIMIT 5
    `;

    const historiqueResult = await query(historiqueQuery, [agentId, threadId]);
    historiqueRecent = historiqueResult.rows.reverse(); // Ordre chronologique
  }

  return {
    thread_id: threadId,
    canal: contexte?.canal || 'api',
    utilisateur_id: contexte?.utilisateur_id,
    historique_recent: historiqueRecent,
    metadata: contexte?.metadata || {}
  };
}

function buildCustomInstructions(contexteAdaptation: any, contexteConversation: any): string {
  let instructions = '';

  // Instructions basées sur l'adaptation
  if (contexteAdaptation.tone_communication) {
    instructions += `Ton de communication: ${contexteAdaptation.tone_communication}. `;
  }

  if (contexteAdaptation.niveau_detail) {
    instructions += `Niveau de détail: ${contexteAdaptation.niveau_detail}. `;
  }

  // Instructions conversationnelles
  if (contexteConversation.historique_recent?.length > 0) {
    instructions += `Contexte conversationnel: Cette interaction fait suite à une conversation en cours. `;
  }

  if (contexteConversation.canal) {
    const canalInstructions = {
      web: 'Format adapté à l\'interface web avec possibilité de formatage riche.',
      api: 'Réponse structurée pour intégration API.',
      teams: 'Format adapté à Microsoft Teams, concis et actionnable.',
      slack: 'Format Slack avec markdown simple et emojis appropriés.'
    };

    instructions += canalInstructions[contexteConversation.canal as keyof typeof canalInstructions] || '';
  }

  return instructions.trim();
}

// ================================
// GESTION DES COMPOSITIONS
// ================================

async function buildCompositionRequest(
  agent: any,
  message: string,
  contexteAdaptation: any,
  options: any
): Promise<any> {
  // Pour les compositions, on simule l'exécution avec le profil principal
  // TODO: Implémenter vraie gestion des compositions dans le moteur B30

  const configurationAgent = JSON.parse(agent.configuration_finale);
  const sectionsActives = configurationAgent.sections_actives;

  // Sélection du profil dominant (plus haute contribution)
  const profilDominant = sectionsActives.reduce((max: any, section: any) =>
    section.contribution_score > max.contribution_score ? section : max
  );

  return {
    profil_id: profilDominant.section_id,
    user_query: message,
    context: {
      query: message,
      keywords: extractKeywords(message),
      domain: contexteAdaptation.secteur_activite || 'general',
      urgency: detectUrgency(message),
      complexity: detectComplexity(message),
      user_context: {
        role: 'composition_user',
        organization_size: mapTailleEntreprise(contexteAdaptation.taille_entreprise),
        industry: contexteAdaptation.secteur_activite ? [contexteAdaptation.secteur_activite] : []
      }
    },
    options: {
      includeDebugInfo: options.mode_debug || false,
      maxTokens: options.limiter_tokens || configurationAgent.parametres_finaux.max_tokens,
      temperature: options.temperature_override || configurationAgent.parametres_finaux.temperature,
      provider: options.provider_override || configurationAgent.parametres_finaux.provider_preference,
      customInstructions: `Configuration composite - Profil dominant: ${profilDominant.section_nom}`,
      includeUserContext: true
    }
  };
}

// ================================
// PERSISTANCE ET ANALYTICS
// ================================

async function saveInteraction(interaction: any) {
  await query(`
    INSERT INTO agent_interactions (
      id, agent_id, message, reponse, success, duree_ms,
      tokens_utilises, contexte, thread_id, utilisateur_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
    interaction.id,
    interaction.agent_id,
    interaction.message,
    interaction.reponse,
    interaction.success,
    interaction.duree_ms,
    interaction.tokens_utilises,
    JSON.stringify(interaction.contexte),
    interaction.thread_id,
    interaction.utilisateur_id
  ]);
}

async function updateAgentStats(
  agentId: string,
  success: boolean,
  tokensUsed: number
) {
  // Mise à jour des statistiques temps réel de l'agent
  await query(`
    UPDATE agents_composes
    SET
      nb_interactions_total = nb_interactions_total + 1,
      nb_interactions_24h = nb_interactions_24h + 1,
      tokens_utilises_total = tokens_utilises_total + $2,
      derniere_activation = NOW(),
      taux_succes = (
        SELECT CASE
          WHEN COUNT(*) = 0 THEN 0.0
          ELSE COUNT(*) FILTER (WHERE success = true)::float / COUNT(*)
        END
        FROM agent_interactions
        WHERE agent_id = $1 AND cree_le > NOW() - INTERVAL '30 days'
      )
    WHERE id = $1
  `, [agentId, tokensUsed]);
}

async function processFeedback(feedback: any, userId: string) {
  // Enregistrement du feedback utilisateur
  await query(`
    UPDATE agent_interactions
    SET rating = $2, commentaire_feedback = $3, feedback_par = $4, feedback_le = NOW()
    WHERE id = $1
  `, [feedback.interaction_id, feedback.rating, feedback.commentaire, userId]);
}

// ================================
// GÉNÉRATION D'ACTIONS SUGGÉRÉES
// ================================

function generateSuggestedActions(
  message: string,
  reponse: string,
  contexteAdaptation: any,
  success: boolean
): any[] {
  const actions = [];

  if (!success) {
    actions.push({
      type: "question_clarification",
      titre: "Préciser la demande",
      description: "Pouvez-vous reformuler ou donner plus de contexte ?",
      pertinence_score: 0.9,
      urgence: "high"
    });

    actions.push({
      type: "escalation",
      titre: "Contact support",
      description: "Contacter l'équipe technique pour assistance",
      pertinence_score: 0.7,
      urgence: "medium"
    });
  } else {
    // Actions basées sur l'intention détectée
    const intention = detectIntention(message);

    switch (intention) {
      case 'audit':
        actions.push({
          type: "action_metier",
          titre: "Planifier audit détaillé",
          description: "Créer un plan d'audit complet avec calendrier",
          pertinence_score: 0.8,
          urgence: "medium"
        });
        break;

      case 'conseil':
        actions.push({
          type: "ressource",
          titre: "Documentation recommandée",
          description: "Accéder aux ressources et guides pertinents",
          pertinence_score: 0.7,
          urgence: "low"
        });
        break;

      case 'formation':
        actions.push({
          type: "action_metier",
          titre: "Programme de formation",
          description: "Élaborer un plan de formation personnalisé",
          pertinence_score: 0.8,
          urgence: "medium"
        });
        break;
    }

    // Action de suivi générale
    actions.push({
      type: "question_clarification",
      titre: "Approfondir le sujet",
      description: "Avez-vous des questions spécifiques sur cette réponse ?",
      pertinence_score: 0.6,
      urgence: "low"
    });
  }

  return actions.sort((a, b) => b.pertinence_score - a.pertinence_score);
}

// ================================
// MÉTHODES UTILITAIRES
// ================================

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['le', 'la', 'les', 'un', 'une', 'de', 'du', 'des', 'et', 'ou', 'pour', 'avec', 'dans', 'sur']);
  return text.toLowerCase()
    .replace(/[^a-zàâäéêëïîôöùûüÿç\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 10);
}

function detectUrgency(text: string): 'low' | 'medium' | 'high' {
  const urgentWords = ['urgent', 'rapidement', 'vite', 'immédiat', 'asap', 'critique', 'bloquant'];
  const textLower = text.toLowerCase();
  return urgentWords.some(word => textLower.includes(word)) ? 'high' : 'medium';
}

function detectComplexity(text: string): 'simple' | 'complex' {
  const complexWords = ['analyse', 'architecture', 'optimisation', 'stratégie', 'audit', 'méthodologie'];
  const textLower = text.toLowerCase();
  return complexWords.some(word => textLower.includes(word)) ? 'complex' : 'simple';
}

function detectIntention(text: string): string {
  const textLower = text.toLowerCase();

  if (['audit', 'auditer', 'analyser', 'évaluer', 'contrôle'].some(word => textLower.includes(word))) {
    return 'audit';
  }

  if (['conseil', 'recommandation', 'avis', 'suggestion'].some(word => textLower.includes(word))) {
    return 'conseil';
  }

  if (['formation', 'apprendre', 'former', 'enseigner', 'expliquer'].some(word => textLower.includes(word))) {
    return 'formation';
  }

  if (['aide', 'support', 'assistance', 'problème'].some(word => textLower.includes(word))) {
    return 'support';
  }

  return 'general';
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

function generateSectionWeights(sectionsScores: any[]): { [key: string]: number } {
  if (!sectionsScores?.length) return {};

  const weights: { [key: string]: number } = {};
  sectionsScores.forEach((score: any) => {
    if (score.section?.id) {
      weights[score.section.id] = score.score || 0;
    }
  });

  return weights;
}

function calculateCost(tokens: number, provider: string): number {
  // Estimation du coût en centimes selon le provider
  const rates = {
    openai: 0.002, // $/1K tokens GPT-4
    anthropic: 0.003,
    google: 0.001
  };

  const rate = rates[provider as keyof typeof rates] || rates.openai;
  return Math.round((tokens / 1000) * rate * 100); // En centimes
}