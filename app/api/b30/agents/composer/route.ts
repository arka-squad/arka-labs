// B30 Phase 3 - API Agent Composer
// Création d'agents composés à partir de profils/compositions avec contexte

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getB30Engine } from '@/lib/b30/engine';

interface ComposerAgentRequest {
  // Source (un seul requis)
  profil_id?: string;
  composition_id?: string;
  adaptation_id?: string;

  // Intégration projet
  projet_id: string;
  nom: string;
  description?: string;

  // Contextualisation
  adaptation: {
    secteur_activite?: string;
    taille_entreprise?: "startup" | "pme" | "eti" | "ge";
    processus_specifiques?: { [domaine: string]: string };
    contraintes_reglementaires?: string[];
    vocabulaire_metier?: { [terme_generique: string]: string };
    tone_communication?: "professionnel" | "decontracte" | "expert" | "pedagogique";
    niveau_detail?: "synthetique" | "standard" | "detaille";
  };

  // Configuration override
  parametres_override?: {
    temperature?: number;
    max_tokens?: number;
    provider_preference?: "openai" | "anthropic" | "google";
  };

  // Options déploiement
  options_deploiement?: {
    activation_immediate?: boolean;
    maj_automatiques?: boolean;
    mode_debug?: boolean;
  };
}

// ================================
// POST /api/b30/agents/composer
// ================================

export async function POST(request: NextRequest) {
  try {
    const body: ComposerAgentRequest = await request.json();

    // Validation des champs requis
    if (!body.nom?.trim() || body.nom.length < 3 || body.nom.length > 100) {
      return NextResponse.json(
        { error: 'Nom requis, entre 3 et 100 caractères' },
        { status: 400 }
      );
    }

    if (!body.projet_id) {
      return NextResponse.json(
        { error: 'projet_id requis' },
        { status: 400 }
      );
    }

    // Validation qu'une seule source est fournie
    const sources = [body.profil_id, body.composition_id, body.adaptation_id].filter(Boolean);
    if (sources.length !== 1) {
      return NextResponse.json(
        { error: 'Exactement une source requise (profil_id, composition_id, ou adaptation_id)' },
        { status: 400 }
      );
    }

    // TODO: User ID à récupérer depuis JWT
    const userId = 'temp-user-id';

    // Vérification du projet
    const projetCheck = await query(
      'SELECT id, nom, client_nom FROM projets WHERE id = $1',
      [body.projet_id]
    );

    if (projetCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const projet = projetCheck.rows[0];

    // Chargement de la source
    let sourceData: any = null;
    let sourceType: string = '';

    if (body.profil_id) {
      const profilResult = await query(`
        SELECT
          id, nom, domaine, description_courte, identity_prompt,
          mission_prompt, personality_prompt, parametres_base,
          competences_cles, secteurs_cibles
        FROM agent_profils
        WHERE id = $1 AND supprime_le IS NULL
      `, [body.profil_id]);

      if (profilResult.rows.length === 0) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
      }

      sourceData = profilResult.rows[0];
      sourceType = 'profil';

    } else if (body.composition_id) {
      const compositionResult = await query(`
        SELECT
          c.*,
          array_agg(
            json_build_object(
              'profil_id', cp.profil_id,
              'profil_nom', ap.nom,
              'ponderation', cp.ponderation,
              'role', cp.role,
              'identity_prompt', ap.identity_prompt,
              'parametres_base', ap.parametres_base
            )
          ) as profils_composition
        FROM profil_compositions c
        LEFT JOIN composition_profils cp ON c.id = cp.composition_id
        LEFT JOIN agent_profils ap ON cp.profil_id = ap.id
        WHERE c.id = $1 AND c.supprime_le IS NULL
        GROUP BY c.id
      `, [body.composition_id]);

      if (compositionResult.rows.length === 0) {
        return NextResponse.json({ error: 'Composition non trouvée' }, { status: 404 });
      }

      sourceData = compositionResult.rows[0];
      sourceType = 'composition';

    } else if (body.adaptation_id) {
      // TODO: Implémenter chargement adaptation sauvegardée
      return NextResponse.json(
        { error: 'Adaptations sauvegardées non encore implémentées' },
        { status: 501 }
      );
    }

    // Génération de l'agent via le moteur B30
    const engine = getB30Engine();

    // Construction du contexte d'adaptation
    const contexteAdaptation = buildAdaptationContext(body.adaptation, sourceData, sourceType);

    // Application de l'adaptation pour générer la configuration finale
    const configurationFinale = await applyAdaptation(
      sourceData,
      sourceType,
      contexteAdaptation,
      body.parametres_override || {}
    );

    // Calcul des métriques d'adaptation
    const adaptationAppliquee = calculateAdaptationMetrics(
      sourceData,
      sourceType,
      contexteAdaptation
    );

    // Estimation de performance
    const estimationPerformance = estimateAgentPerformance(
      configurationFinale,
      contexteAdaptation,
      sourceType
    );

    // Génération d'un ID unique pour l'agent
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Sauvegarde de l'agent en base
    const agentResult = await query(`
      INSERT INTO agents_composes (
        id, nom, description, projet_id, cree_par,
        source_type, source_id,
        configuration_finale, contexte_adaptation,
        parametres_finaux, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, cree_le
    `, [
      agentId,
      body.nom,
      body.description || '',
      body.projet_id,
      userId,
      sourceType,
      sourceType === 'profil' ? body.profil_id : body.composition_id,
      JSON.stringify(configurationFinale),
      JSON.stringify(contexteAdaptation),
      JSON.stringify({
        ...sourceData.parametres_base,
        ...body.parametres_override
      }),
      body.options_deploiement?.activation_immediate ? 'active' : 'configuring'
    ]);

    const agent = agentResult.rows[0];

    // Actions disponibles selon le statut
    const actionsDisponibles = ['tester', 'configurer', 'dupliquer'];
    if (body.options_deploiement?.activation_immediate) {
      actionsDisponibles.push('deployer');
    }

    const response = {
      agent_id: agent.id,
      nom: body.nom,
      configuration_finale: configurationFinale,
      adaptation_appliquee: adaptationAppliquee,
      estimation_performance: estimationPerformance,
      actions_disponibles: actionsDisponibles,
      cree_le: agent.cree_le
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error composing agent:', error);
    return NextResponse.json(
      {
        error: 'Failed to compose agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ================================
// MÉTHODES D'ADAPTATION
// ================================

function buildAdaptationContext(adaptation: any, sourceData: any, sourceType: string) {
  return {
    ...adaptation,
    source_domaine: sourceType === 'profil' ? sourceData.domaine : sourceData.domaines_combines[0],
    source_secteurs: sourceType === 'profil' ? sourceData.secteurs_cibles : sourceData.secteurs_cibles,
    adaptation_timestamp: new Date().toISOString()
  };
}

async function applyAdaptation(
  sourceData: any,
  sourceType: string,
  contexte: any,
  parametresOverride: any
) {
  let promptFinal = '';
  let sectionsActives: any[] = [];
  let competencesAdaptees: string[] = [];

  if (sourceType === 'profil') {
    // Adaptation d'un profil unique
    promptFinal = adaptProfilPrompt(sourceData, contexte);
    sectionsActives = [
      {
        section_id: 'identity',
        section_nom: 'Identité Core',
        type_section: 'identity',
        contribution_score: 1.0,
        adaptations_appliquees: ['secteur', 'vocabulaire', 'tone'].filter(a => contexte[a])
      }
    ];
    competencesAdaptees = adaptCompetences(sourceData.competences_cles || [], contexte);

  } else if (sourceType === 'composition') {
    // Adaptation d'une composition multi-profils
    const profilsAdaptes = sourceData.profils_composition
      .filter((p: any) => p.profil_id)
      .map((profil: any) => ({
        ...profil,
        prompt_adapte: adaptProfilPrompt(profil, contexte)
      }));

    promptFinal = assembleCompositionPrompt(profilsAdaptes, sourceData.strategie_fusion, contexte);

    sectionsActives = profilsAdaptes.map((profil: any, index: number) => ({
      section_id: profil.profil_id,
      section_nom: profil.profil_nom,
      type_section: 'expertise',
      contribution_score: profil.ponderation,
      adaptations_appliquees: ['composition_blend', 'contextualisation']
    }));

    // Combinaison des compétences de tous les profils
    const toutesCompetences = profilsAdaptes.flatMap((p: any) => p.competences_cles || []);
    competencesAdaptees = [...new Set(toutesCompetences)];
  }

  // Application des paramètres finaux
  const parametresFinaux = {
    temperature: parametresOverride.temperature || sourceData.parametres_base?.temperature || 0.7,
    max_tokens: parametresOverride.max_tokens || sourceData.parametres_base?.max_tokens || 2000,
    top_p: sourceData.parametres_base?.top_p || 0.9,
    provider_preference: parametresOverride.provider_preference || 'openai'
  };

  return {
    prompt_final: promptFinal,
    sections_actives: sectionsActives,
    competences_adaptees: competencesAdaptees,
    contexte_integre: contexte,
    parametres_finaux: parametresFinaux
  };
}

function adaptProfilPrompt(profil: any, contexte: any): string {
  let prompt = profil.identity_prompt || '';

  // Adaptation secteur
  if (contexte.secteur_activite) {
    prompt += `\n\nSPÉCIALISATION SECTEUR: Tu es spécialisé dans le secteur ${contexte.secteur_activite}`;

    if (contexte.contraintes_reglementaires?.length > 0) {
      prompt += ` et maîtrises les contraintes réglementaires suivantes: ${contexte.contraintes_reglementaires.join(', ')}.`;
    }
  }

  // Adaptation taille entreprise
  if (contexte.taille_entreprise) {
    const contextesTaille = {
      startup: 'Tu adaptes tes conseils aux enjeux de startup (agilité, ressources limitées, croissance rapide).',
      pme: 'Tu prends en compte les spécificités des PME (proximité, flexibilité, optimisation des ressources).',
      eti: 'Tu intègres les défis des ETI (croissance structurée, internationalisation, professionnalisation).',
      ge: 'Tu maîtrises les enjeux des grandes entreprises (complexité organisationnelle, gouvernance, conformité).'
    };

    prompt += `\n\nCONTEXTE ENTREPRISE: ${contextesTaille[contexte.taille_entreprise as keyof typeof contextesTaille]}`;
  }

  // Adaptation vocabulaire métier
  if (contexte.vocabulaire_metier && Object.keys(contexte.vocabulaire_metier).length > 0) {
    prompt += '\n\nVOCABULAIRE MÉTIER: Utilise le vocabulaire spécifique suivant:\n';
    Object.entries(contexte.vocabulaire_metier).forEach(([generique, specifique]) => {
      prompt += `- "${generique}" → "${specifique}"\n`;
    });
  }

  // Adaptation processus spécifiques
  if (contexte.processus_specifiques && Object.keys(contexte.processus_specifiques).length > 0) {
    prompt += '\n\nPROCESSUS SPÉCIFIQUES:\n';
    Object.entries(contexte.processus_specifiques).forEach(([domaine, processus]) => {
      prompt += `- ${domaine}: ${processus}\n`;
    });
  }

  // Adaptation style de communication
  if (contexte.tone_communication) {
    const tonesStyles = {
      professionnel: 'Adopte un ton professionnel, structuré et formel.',
      decontracte: 'Utilise un style accessible, convivial et direct.',
      expert: 'Exprime-toi avec l\'autorité d\'un expert reconnu, utilise un vocabulaire technique précis.',
      pedagogique: 'Privilégie une approche pédagogique avec explications détaillées et exemples concrets.'
    };

    prompt += `\n\nSTYLE COMMUNICATION: ${tonesStyles[contexte.tone_communication as keyof typeof tonesStyles]}`;
  }

  // Adaptation niveau de détail
  if (contexte.niveau_detail) {
    const niveauxDetail = {
      synthetique: 'Fournis des réponses concises et synthétiques, va à l\'essentiel.',
      standard: 'Équilibre entre précision et concision selon le contexte.',
      detaille: 'Développe tes réponses avec des explications détaillées, des exemples et des nuances.'
    };

    prompt += `\n\nNIVEAU DÉTAIL: ${niveauxDetail[contexte.niveau_detail as keyof typeof niveauxDetail]}`;
  }

  return prompt;
}

function adaptCompetences(competencesBase: string[], contexte: any): string[] {
  let competencesAdaptees = [...competencesBase];

  // Ajout de compétences sectorielles
  if (contexte.secteur_activite) {
    const competencesSectorielles = getCompetencesSectorielles(contexte.secteur_activite);
    competencesAdaptees.push(...competencesSectorielles);
  }

  // Ajout de compétences selon taille entreprise
  if (contexte.taille_entreprise) {
    const competencesTaille = getCompetencesTaille(contexte.taille_entreprise);
    competencesAdaptees.push(...competencesTaille);
  }

  return [...new Set(competencesAdaptees)]; // Dédoublonnage
}

function assembleCompositionPrompt(
  profilsAdaptes: any[],
  strategie: string,
  contexte: any
): string {
  let promptComposite = '';

  switch (strategie) {
    case 'weighted_blend':
      promptComposite = `Tu es un agent composite combinant les expertises suivantes:\n\n`;
      profilsAdaptes.forEach((profil, index) => {
        promptComposite += `## EXPERTISE ${index + 1} (${Math.round(profil.ponderation * 100)}%): ${profil.profil_nom}\n`;
        promptComposite += profil.prompt_adapte + '\n\n';
      });
      promptComposite += 'INTÉGRATION: Combine harmonieusement ces expertises selon leur pondération pour fournir des réponses complètes et cohérentes.\n\n';
      break;

    case 'sequential':
      promptComposite = `Tu es un agent composite utilisant une approche séquentielle:\n\n`;
      profilsAdaptes.forEach((profil, index) => {
        promptComposite += `## ÉTAPE ${index + 1}: ${profil.profil_nom}\n`;
        promptComposite += profil.prompt_adapte + '\n\n';
      });
      promptComposite += 'WORKFLOW: Applique ces expertises de manière séquentielle selon le contexte de la demande.\n\n';
      break;

    case 'conditional':
      promptComposite = `Tu es un agent composite utilisant une sélection conditionnelle:\n\n`;
      profilsAdaptes.forEach((profil, index) => {
        promptComposite += `## PROFIL CONDITIONNEL ${index + 1}: ${profil.profil_nom}\n`;
        promptComposite += profil.prompt_adapte + '\n\n';
      });
      promptComposite += 'SÉLECTION: Active le profil le plus pertinent selon les mots-clés et le contexte de la demande.\n\n';
      break;

    default:
      promptComposite = profilsAdaptes.map(p => p.prompt_adapte).join('\n\n');
  }

  return promptComposite;
}

// ================================
// MÉTRIQUES ET ESTIMATIONS
// ================================

function calculateAdaptationMetrics(sourceData: any, sourceType: string, contexte: any) {
  let nbModifications = 0;
  let sectionsModifiees: string[] = [];
  let vocabulaireAdapte = 0;
  let processusIntegres = 0;

  // Comptage des adaptations appliquées
  if (contexte.secteur_activite) {
    nbModifications++;
    sectionsModifiees.push('secteur_activite');
  }

  if (contexte.taille_entreprise) {
    nbModifications++;
    sectionsModifiees.push('taille_entreprise');
  }

  if (contexte.vocabulaire_metier) {
    vocabulaireAdapte = Object.keys(contexte.vocabulaire_metier).length;
    nbModifications += vocabulaireAdapte;
    sectionsModifiees.push('vocabulaire_metier');
  }

  if (contexte.processus_specifiques) {
    processusIntegres = Object.keys(contexte.processus_specifiques).length;
    nbModifications += processusIntegres;
    sectionsModifiees.push('processus_specifiques');
  }

  if (contexte.tone_communication) {
    nbModifications++;
    sectionsModifiees.push('style_communication');
  }

  if (contexte.niveau_detail) {
    nbModifications++;
    sectionsModifiees.push('niveau_detail');
  }

  return {
    nb_modifications: nbModifications,
    sections_modifiees: sectionsModifiees,
    vocabulaire_adapte: vocabulaireAdapte,
    processus_integres: processusIntegres
  };
}

function estimateAgentPerformance(
  configuration: any,
  contexte: any,
  sourceType: string
) {
  // Estimation du temps de réponse
  const baseTime = sourceType === 'composition' ? 800 : 500;
  const adaptationComplexity = Object.keys(contexte).length;
  const tempsReponseMoyenMs = baseTime + (adaptationComplexity * 50);

  // Estimation de la pertinence
  let pertinenceAttendue = 3.0; // Base
  if (contexte.secteur_activite) pertinenceAttendue += 0.5;
  if (contexte.vocabulaire_metier && Object.keys(contexte.vocabulaire_metier).length > 0) pertinenceAttendue += 0.3;
  if (contexte.processus_specifiques && Object.keys(contexte.processus_specifiques).length > 0) pertinenceAttendue += 0.4;

  pertinenceAttendue = Math.min(5, pertinenceAttendue);

  // Confiance dans l'adaptation
  let confianceAdaptation = 0.7; // Base
  const nbAdaptations = Object.keys(contexte).filter(k => contexte[k]).length;
  confianceAdaptation += (nbAdaptations * 0.05);
  confianceAdaptation = Math.min(1.0, confianceAdaptation);

  // Score de cohérence
  const scoreCoherence = sourceType === 'profil' ? 0.9 : 0.7; // Profil unique plus cohérent

  return {
    temps_reponse_moyen_ms: tempsReponseMoyenMs,
    pertinence_attendue: Math.round(pertinenceAttendue * 10) / 10,
    confiance_adaptation: Math.round(confianceAdaptation * 100) / 100,
    score_coherence: scoreCoherence
  };
}

// ================================
// DONNÉES SECTORIELLES
// ================================

function getCompetencesSectorielles(secteur: string): string[] {
  const competencesSectorielles: { [key: string]: string[] } = {
    'Manufacturing': ['Lean Manufacturing', 'Qualité industrielle', 'Supply Chain', 'Maintenance prédictive'],
    'Retail': ['Expérience client', 'Merchandising', 'Analytics retail', 'Omnichannel'],
    'FinTech': ['Régulation bancaire', 'KYC/AML', 'Blockchain', 'Paiements digitaux'],
    'HealthTech': ['RGPD Santé', 'Interopérabilité', 'IA médicale', 'Télémédecine'],
    'EdTech': ['Pédagogie numérique', 'LMS', 'Analytics learning', 'Accessibilité']
  };

  return competencesSectorielles[secteur] || [`Expertise ${secteur}`, `Réglementation ${secteur}`];
}

function getCompetencesTaille(taille: string): string[] {
  const competencesTaille: { [key: string]: string[] } = {
    'startup': ['Agilité', 'Bootstrap', 'Product-Market Fit', 'Fundraising'],
    'pme': ['Optimisation ressources', 'Automatisation', 'Croissance durable', 'Management proximité'],
    'eti': ['Structuration processus', 'International', 'Gouvernance avancée', 'Transformation digitale'],
    'ge': ['Compliance', 'Gouvernance complexe', 'Change management', 'Architecture d\'entreprise']
  };

  return competencesTaille[taille] || [];
}