// B30 Phase 3 - APIs Compositions Multi-Profils
// Création et gestion des compositions intelligentes

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getB30Engine } from '@/lib/b30/engine';

// ================================
// TYPES & INTERFACES
// ================================

interface CompositionProfil {
  profil_id: string;
  ponderation: number;
  role?: string;
  sections_incluses?: string[];
  sections_exclues?: string[];
  conditions_activation?: {
    keywords_trigger: string[];
    confidence_threshold: number;
  };
  adaptations_locales?: {
    section_id: string;
    modification_prompt: string;
  }[];
}

interface CreateCompositionRequest {
  nom: string;
  description: string;
  profils: CompositionProfil[];
  strategie_fusion: "weighted_blend" | "sequential" | "conditional";
  parametres_fusion?: {
    normalisation_automatique?: boolean;
    transitions_naturelles?: boolean;
    conditions_activation?: any[];
  };
  secteurs_cibles?: string[];
  use_cases: string[];
  statut?: "draft" | "published";
  visibilite?: "private" | "internal" | "public";
}

// ================================
// GET /api/b30/compositions
// ================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Paramètres de requête
    const domaines = searchParams.getAll('domaines[]');
    const cree_par = searchParams.get('cree_par');
    const statut = searchParams.get('statut') || 'published';
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const sort_by = searchParams.get('sort_by') || 'recent';
    const sort_order = searchParams.get('sort_order') || 'desc';

    // Construction de la requête SQL dynamique
    let sqlQuery = `
      SELECT
        c.id,
        c.nom,
        c.description,
        c.domaines_combines,
        c.secteurs_cibles,
        c.strategie_fusion,
        c.parametres_fusion,
        c.use_cases,
        c.coherence_score,
        c.complexity_score,
        c.nb_agents_crees,
        c.note_moyenne,
        c.statut,
        c.visibilite,
        c.cree_par,
        c.cree_le,
        c.modifie_le,

        -- Profils inclus
        array_agg(
          json_build_object(
            'profil_id', cp.profil_id,
            'profil_nom', ap.nom,
            'ponderation', cp.ponderation,
            'role', cp.role
          ) ORDER BY cp.ponderation DESC
        ) as profils_inclus

      FROM profil_compositions c
      LEFT JOIN composition_profils cp ON c.id = cp.composition_id
      LEFT JOIN agent_profils ap ON cp.profil_id = ap.id
      WHERE c.supprime_le IS NULL
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Filtres
    if (domaines.length > 0) {
      sqlQuery += ` AND c.domaines_combines && $${paramIndex}`;
      queryParams.push(domaines);
      paramIndex++;
    }

    if (cree_par) {
      sqlQuery += ` AND c.cree_par = $${paramIndex}`;
      queryParams.push(cree_par);
      paramIndex++;
    }

    if (statut !== 'all') {
      sqlQuery += ` AND c.statut = $${paramIndex}`;
      queryParams.push(statut);
      paramIndex++;
    }

    // Grouper par composition
    sqlQuery += ` GROUP BY c.id`;

    // Pagination cursor
    if (cursor) {
      const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString());
      sqlQuery += ` HAVING c.cree_le < $${paramIndex}`;
      queryParams.push(cursorData.timestamp);
      paramIndex++;
    }

    // Tri
    const sortFields = {
      nom: 'c.nom',
      note: 'c.note_moyenne',
      usage: 'c.nb_agents_crees',
      recent: 'c.cree_le'
    };

    const sortField = sortFields[sort_by as keyof typeof sortFields] || sortFields.recent;
    sqlQuery += ` ORDER BY ${sortField} ${sort_order.toUpperCase()}`;

    // Limite
    sqlQuery += ` LIMIT $${paramIndex}`;
    queryParams.push(limit + 1); // +1 pour vérifier s'il y a une page suivante

    const result = await query(sqlQuery, queryParams);

    const hasNext = result.rows.length > limit;
    const compositions = hasNext ? result.rows.slice(0, -1) : result.rows;

    // Calcul du cursor suivant
    const nextCursor = hasNext ?
      Buffer.from(JSON.stringify({
        timestamp: compositions[compositions.length - 1].cree_le
      })).toString('base64') : null;

    // Statistiques compositions
    const statsQuery = `
      SELECT
        COUNT(*) as nb_total,
        array_agg(DISTINCT unnest(domaines_combines)) as domaines_uniques,
        AVG(note_moyenne) as note_moyenne_globale
      FROM profil_compositions
      WHERE supprime_le IS NULL AND statut = 'published'
    `;

    const statsResult = await query(statsQuery);
    const stats = statsResult.rows[0];

    return NextResponse.json({
      compositions: compositions.map(comp => ({
        ...comp,
        profils_inclus: comp.profils_inclus.filter((p: any) => p.profil_id), // Filtrer les nulls
        domaines_combines: comp.domaines_combines || [],
        secteurs_cibles: comp.secteurs_cibles || [],
        use_cases: comp.use_cases || []
      })),
      pagination: {
        cursor: nextCursor,
        has_next: hasNext,
        has_previous: !!cursor,
        total_count: parseInt(stats.nb_total)
      },
      stats_compositions: {
        nb_total: parseInt(stats.nb_total),
        combinaisons_populaires: [] // TODO: Calculer combinaisons populaires
      }
    });

  } catch (error) {
    console.error('Error fetching compositions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compositions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// POST /api/b30/compositions
// ================================

export async function POST(request: NextRequest) {
  try {
    const body: CreateCompositionRequest = await request.json();

    // Validation de base
    if (!body.nom?.trim() || body.nom.length < 5 || body.nom.length > 200) {
      return NextResponse.json(
        { error: 'Nom requis, entre 5 et 200 caractères' },
        { status: 400 }
      );
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { error: 'Description requise' },
        { status: 400 }
      );
    }

    if (!body.profils || body.profils.length < 2 || body.profils.length > 5) {
      return NextResponse.json(
        { error: 'Entre 2 et 5 profils requis pour la composition' },
        { status: 400 }
      );
    }

    if (!body.use_cases || body.use_cases.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un cas d\'usage requis' },
        { status: 400 }
      );
    }

    // Validation pondération totale = 1.0
    const totalPonderation = body.profils.reduce((sum, p) => sum + p.ponderation, 0);
    if (Math.abs(totalPonderation - 1.0) > 0.01) {
      return NextResponse.json(
        { error: 'La somme des pondérations doit être égale à 1.0' },
        { status: 400 }
      );
    }

    // Vérification existence des profils
    const profilIds = body.profils.map(p => p.profil_id);
    const profilsCheck = await query(
      'SELECT id, nom, domaine FROM agent_profils WHERE id = ANY($1) AND supprime_le IS NULL',
      [profilIds]
    );

    if (profilsCheck.rows.length !== profilIds.length) {
      const foundIds = profilsCheck.rows.map(p => p.id);
      const missingIds = profilIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { error: 'Profils non trouvés', missing_profils: missingIds },
        { status: 404 }
      );
    }

    // Calcul domaines combinés
    const domainesCombines = [...new Set(profilsCheck.rows.map(p => p.domaine))];

    // TODO: User ID à récupérer depuis JWT
    const userId = 'temp-user-id';

    // Génération slug unique
    const baseSlug = body.nom.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existingCheck = await query(
        'SELECT id FROM profil_compositions WHERE slug = $1',
        [slug]
      );
      if (existingCheck.rows.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calcul scores de cohérence et complexité
    const coherenceScore = await calculateCoherenceScore(body.profils, profilsCheck.rows);
    const complexityScore = calculateComplexityScore(body.strategie_fusion, body.profils.length);

    // Création de la composition
    const createResult = await query(`
      INSERT INTO profil_compositions (
        nom, slug, description, domaines_combines, secteurs_cibles,
        strategie_fusion, parametres_fusion, use_cases,
        coherence_score, complexity_score, statut, visibilite,
        cree_par
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, version, cree_le
    `, [
      body.nom,
      slug,
      body.description,
      domainesCombines,
      body.secteurs_cibles || [],
      body.strategie_fusion,
      JSON.stringify(body.parametres_fusion || {}),
      body.use_cases,
      coherenceScore,
      complexityScore,
      body.statut || 'draft',
      body.visibilite || 'private',
      userId
    ]);

    const composition = createResult.rows[0];

    // Insertion des profils de la composition
    for (const profil of body.profils) {
      await query(`
        INSERT INTO composition_profils (
          composition_id, profil_id, ponderation, role,
          sections_incluses, sections_exclues, conditions_activation,
          adaptations_locales
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        composition.id,
        profil.profil_id,
        profil.ponderation,
        profil.role,
        profil.sections_incluses || [],
        profil.sections_exclues || [],
        JSON.stringify(profil.conditions_activation || {}),
        JSON.stringify(profil.adaptations_locales || [])
      ]);
    }

    // Génération du profil composite via B30 Engine
    const engine = getB30Engine();
    const profilComposite = await generateCompositeProfile(engine, body, profilsCheck.rows);

    // Analyse des conflits
    const conflitsDetectes = await analyzeCompositionConflicts(body.profils, profilsCheck.rows);

    return NextResponse.json({
      id: composition.id,
      nom: body.nom,
      profil_composite: profilComposite,
      validation: {
        coherence_profils: coherenceScore,
        conflicts_detectes: conflitsDetectes,
        risques_identifies: generateRiskAssessment(body.strategie_fusion, body.profils),
        recommandations: generateRecommendations(conflitsDetectes, coherenceScore)
      },
      estimation_performance: {
        temps_reponse_estime_ms: estimateResponseTime(complexityScore, body.profils.length),
        complexite_gestion: mapComplexityToLevel(complexityScore),
        maintenance_effort: estimateMaintenanceEffort(body.strategie_fusion, conflitsDetectes.length)
      },
      cree_le: composition.cree_le
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating composition:', error);
    return NextResponse.json(
      { error: 'Failed to create composition', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// MÉTHODES UTILITAIRES
// ================================

async function calculateCoherenceScore(profils: CompositionProfil[], profilsData: any[]): Promise<number> {
  // Calcul basique basé sur la compatibilité des domaines
  // TODO: Implémenter analyse sémantique plus sophistiquée
  const domaines = profilsData.map(p => p.domaine);
  const domainesUniques = new Set(domaines);

  // Plus il y a de domaines différents, plus la cohérence diminue
  const coherenceBase = 1 - ((domainesUniques.size - 1) * 0.2);

  // Ajustement selon les pondérations
  const pondérationEquilibrée = Math.min(...profils.map(p => p.ponderation)) > 0.15;
  const bonusEquilibre = pondérationEquilibrée ? 0.1 : 0;

  return Math.max(0.1, Math.min(1.0, coherenceBase + bonusEquilibre));
}

function calculateComplexityScore(strategie: string, nbProfils: number): number {
  const strategieComplexity = {
    weighted_blend: 0.3,
    sequential: 0.6,
    conditional: 0.9
  };

  const baseComplexity = strategieComplexity[strategie as keyof typeof strategieComplexity] || 0.5;
  const nbProfilsComplexity = (nbProfils - 2) * 0.1;

  return Math.min(1.0, baseComplexity + nbProfilsComplexity);
}

async function generateCompositeProfile(engine: any, composition: CreateCompositionRequest, profilsData: any[]): Promise<any> {
  // Génération simplifiée du profil composite
  // TODO: Utiliser vraiment le B30 Engine pour l'assemblage

  const competencesCombinees = profilsData.flatMap(p => p.competences_cles || []);
  const exemplesMissions = composition.use_cases;

  return {
    prompt_fusionne: `Profil composite "${composition.nom}" combinant ${profilsData.length} expertises: ${profilsData.map(p => p.nom).join(', ')}`,
    competences_combinees: [...new Set(competencesCombinees)],
    exemples_missions: exemplesMissions,
    parametres_recommandes: {
      temperature: 0.7,
      max_tokens: 3000,
      strategy: composition.strategie_fusion
    }
  };
}

async function analyzeCompositionConflicts(profils: CompositionProfil[], profilsData: any[]): Promise<any[]> {
  const conflicts = [];

  // Détection conflits de pondération
  const pondérationDominante = Math.max(...profils.map(p => p.ponderation));
  if (pondérationDominante > 0.7) {
    conflicts.push({
      type: "dominant_profile",
      severity: "medium",
      profils_impliques: [profils.find(p => p.ponderation === pondérationDominante)?.profil_id],
      description: "Un profil domine fortement la composition (>70%)",
      resolution_automatique: "Rééquilibrer les pondérations",
      resolution_manuelle_requise: false
    });
  }

  // TODO: Ajouter d'autres détections (keywords overlap, contradictory rules, etc.)

  return conflicts;
}

function generateRiskAssessment(strategie: string, profils: CompositionProfil[]): string[] {
  const risks = [];

  if (strategie === 'conditional' && profils.some(p => !p.conditions_activation)) {
    risks.push("Stratégie conditionnelle sans conditions définies");
  }

  if (profils.length > 3) {
    risks.push("Composition complexe avec nombreux profils - maintenance difficile");
  }

  const pondérationMin = Math.min(...profils.map(p => p.ponderation));
  if (pondérationMin < 0.1) {
    risks.push("Profils avec pondération très faible - impact limité");
  }

  return risks;
}

function generateRecommendations(conflicts: any[], coherenceScore: number): string[] {
  const recommendations = [];

  if (coherenceScore < 0.6) {
    recommendations.push("Considérer des profils plus compatibles pour améliorer la cohérence");
  }

  if (conflicts.length > 0) {
    recommendations.push("Résoudre les conflits détectés avant publication");
  }

  recommendations.push("Tester la composition avec des cas d'usage réels");

  return recommendations;
}

function estimateResponseTime(complexityScore: number, nbProfils: number): number {
  const baseTime = 500; // ms
  const complexityMultiplier = 1 + complexityScore;
  const profilMultiplier = 1 + (nbProfils - 1) * 0.2;

  return Math.round(baseTime * complexityMultiplier * profilMultiplier);
}

function mapComplexityToLevel(score: number): "simple" | "moderate" | "complex" {
  if (score < 0.4) return "simple";
  if (score < 0.7) return "moderate";
  return "complex";
}

function estimateMaintenanceEffort(strategie: string, nbConflicts: number): "low" | "medium" | "high" {
  let effort = 0;

  if (strategie === 'conditional') effort += 2;
  else if (strategie === 'sequential') effort += 1;

  effort += nbConflicts;

  if (effort < 2) return "low";
  if (effort < 4) return "medium";
  return "high";
}