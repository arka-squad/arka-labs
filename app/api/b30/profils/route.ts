// B30 API - CRUD Profils d'Expertise
// GET /api/b30/profils - Marketplace profils avec filtres
// POST /api/b30/profils - Création nouveau profil

import { NextRequest, NextResponse } from 'next/server';

// Mock role function for now
function getCurrentRole() {
  return 'admin'; // TODO: Implement real auth
}

// Mock types for now
interface ProfilsQuery {
  domaine?: string;
  secteur?: string[];
  niveau?: string;
  statut?: string;
  cree_par?: string;
  tags?: string[];
  recherche?: string;
  note_min?: number;
  cursor?: string;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

interface CreateProfilRequest {
  nom: string;
  domaine: string;
  secteurs_cibles?: string[];
  niveau_complexite: string;
  tags?: string[];
  description_courte: string;
  description_complete?: string;
  competences_cles: string[];
  methodologie?: string;
  outils_maitrises?: string[];
  exemples_taches: string[];
  cas_usage?: string[];
  limites_explicites?: string[];
  identity_prompt: string;
  mission_prompt?: string;
  personality_prompt?: string;
  prompt_regles_livraisons?: string;
  prompt_regles_discussion?: string;
  specifications_cadrage?: string[];
  parametres_base?: any;
  visibilite: string;
  sections_expertise?: any[];
  sections_scope?: any[];
}

interface ProfilExpertise {
  id: string;
  nom: string;
  slug: string;
  version: string;
  domaine: string;
  secteurs_cibles: string[];
  niveau_complexite: string;
  tags: string[];
  description_courte: string;
  description_complete?: string;
  competences_cles: string[];
  methodologie?: string;
  outils_maitrises?: string[];
  exemples_taches: string[];
  cas_usage?: string[];
  limites_explicites?: string[];
  identity_prompt: string;
  mission_prompt?: string;
  personality_prompt?: string;
  prompt_regles_livraisons?: string;
  prompt_regles_discussion?: string;
  specifications_cadrage?: string[];
  parametres_base?: any;
  statut: string;
  visibilite: string;
  nb_utilisations: number;
  nb_evaluations?: number;
  note_moyenne?: number;
  sections: any[];
  cree_par: string;
  cree_le: Date;
  modifie_le: Date;
  est_version_principale: boolean;
}

interface ProfilMarketplace {
  id: string;
  nom: string;
  slug: string;
  domaine: string;
  secteurs_cibles: string[];
  niveau_complexite: string;
  description_courte: string;
  tags: string[];
  note_moyenne?: number;
  nb_evaluations?: number;
  nb_utilisations: number;
  score_popularite: number;
  cree_par: string;
  cree_le: Date;
  modifie_le: Date;
  nb_sections_expertise: number;
  sections_preview: string[];
  actions_disponibles: string[];
}

interface ProfilsResponse {
  profils: ProfilMarketplace[];
  pagination: any;
  filtres_appliques: any;
  suggestions_recherche?: string[];
}

const VALIDATION_RULES = {
  profil: {
    nom: { min: 3, max: 100 },
    description_courte: { min: 20, max: 250 },
    identity_prompt: { min: 50, max: 2000 },
    competences_cles: { min: 1, max: 10 },
    exemples_taches: { min: 2, max: 20 }
  }
};

function generateProfilSlug(nom: string): string {
  return nom.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

function calculateProfilScore(profil: ProfilExpertise): number {
  return Math.round((profil.nb_utilisations * 0.3) + ((profil.note_moyenne || 0) * 20));
}

// ================================
// GET /api/b30/profils - Marketplace
// ================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const query: ProfilsQuery = {
      domaine: searchParams.get('domaine') as any || undefined,
      secteur: searchParams.getAll('secteur'),
      niveau: searchParams.get('niveau') as any || undefined,
      statut: searchParams.get('statut') as any || 'published',
      cree_par: searchParams.get('cree_par') || undefined,
      tags: searchParams.getAll('tags'),
      recherche: searchParams.get('recherche') || undefined,
      note_min: searchParams.get('note_min') ? Number(searchParams.get('note_min')) : undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: Math.min(Number(searchParams.get('limit') || 20), 50),
      sort_by: searchParams.get('sort_by') as any || 'recent',
      sort_order: searchParams.get('sort_order') as any || 'desc'
    };

    // Get user role for permissions
    const userRole = getCurrentRole();
    const canViewAll = ['admin', 'manager'].includes(userRole);

    // TODO: Replace with real database query
    const profils = await getProfilsFromDatabase(query, canViewAll);

    const response: ProfilsResponse = {
      profils: profils.data.map(profil => mapToMarketplaceProfil(profil, userRole)),
      pagination: {
        cursor: profils.nextCursor,
        has_next: profils.hasNext,
        has_previous: profils.hasPrevious,
        total_count: profils.totalCount
      },
      filtres_appliques: query,
      suggestions_recherche: profils.suggestions
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching profils:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profils', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// POST /api/b30/profils - Create
// ================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateProfilRequest;

    // Get user info
    const userRole = getCurrentRole();
    const canCreate = ['admin', 'manager', 'user'].includes(userRole) || userRole === null; // Allow creation for now

    if (!canCreate) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create profils' },
        { status: 403 }
      );
    }

    // Validate request body
    const validation = validateCreateProfilRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Generate slug if needed
    const slug = generateProfilSlug(body.nom);

    // TODO: Get actual user ID from auth context
    const userId = 'temp-user-id';

    // Create profil object
    const newProfil: Omit<ProfilExpertise, 'id' | 'sections'> = {
      nom: body.nom,
      slug,
      version: '1.0.0',
      domaine: body.domaine,
      secteurs_cibles: body.secteurs_cibles || [],
      niveau_complexite: body.niveau_complexite,
      tags: body.tags || [],
      description_courte: body.description_courte,
      description_complete: body.description_complete,
      competences_cles: body.competences_cles,
      methodologie: body.methodologie,
      outils_maitrises: body.outils_maitrises || [],
      exemples_taches: body.exemples_taches,
      cas_usage: body.cas_usage || [],
      limites_explicites: body.limites_explicites || [],
      identity_prompt: body.identity_prompt,
      mission_prompt: body.mission_prompt,
      personality_prompt: body.personality_prompt,
      prompt_regles_livraisons: body.prompt_regles_livraisons,
      prompt_regles_discussion: body.prompt_regles_discussion,
      specifications_cadrage: body.specifications_cadrage || [],
      parametres_base: body.parametres_base || {},
      statut: 'draft', // Always start as draft
      visibilite: body.visibilite,
      nb_utilisations: 0,
      nb_evaluations: 0,
      cree_par: userId,
      cree_le: new Date(),
      modifie_le: new Date(),
      est_version_principale: true
    };

    // TODO: Replace with real database insert
    const createdProfil = await createProfilInDatabase(newProfil, body.sections_expertise, body.sections_scope);

    return NextResponse.json({
      success: true,
      profil: {
        id: createdProfil.id,
        slug: createdProfil.slug,
        statut: createdProfil.statut,
        actions_disponibles: getAvailableActions(createdProfil, userRole)
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating profil:', error);
    return NextResponse.json(
      { error: 'Failed to create profil', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

async function getProfilsFromDatabase(query: ProfilsQuery, canViewAll: boolean) {
  // TODO: Implement real PostgreSQL query
  // For now, return mock data structure

  const mockProfils: ProfilExpertise[] = [
    {
      id: '1',
      nom: 'Expert Comptable PME',
      slug: 'expert-comptable-pme',
      version: '1.0.0',
      domaine: 'Finance',
      secteurs_cibles: ['Manufacturing', 'Retail'],
      niveau_complexite: 'advanced',
      tags: ['comptabilité', 'pme', 'audit'],
      description_courte: 'Expert en comptabilité PME avec 15 ans d\'expérience industrielle',
      description_complete: 'Spécialiste de la comptabilité pour PME industrielles et commerciales...',
      competences_cles: ['Comptabilité générale', 'Fiscalité PME', 'Analyse financière'],
      outils_maitrises: ['SAP', 'QuickBooks', 'Excel'],
      exemples_taches: [
        'Établissement des comptes annuels',
        'Analyse des ratios financiers',
        'Optimisation fiscale PME'
      ],
      cas_usage: ['Audit comptable trimestriel', 'Préparation budget prévisionnel'],
      limites_explicites: ['Pas de conseil juridique', 'Pas d\'audit externe certifié'],
      identity_prompt: 'Tu es un expert-comptable spécialisé dans les PME...',
      mission_prompt: 'Ta mission est d\'accompagner les dirigeants PME...',
      personality_prompt: 'Tu es rigoureux, pédagogue et pragmatique...',
      prompt_regles_livraisons: '## Règles de Livraisons - Expert Comptable PME\n\n**Format de livrables :**\n- Rapports comptables au format PDF avec tableaux Excel joints\n- Analyses financières avec graphiques et KPIs visuels\n- Recommandations actionables avec timeline précise',
      prompt_regles_discussion: '## Règles de Discussion - Expert Comptable PME\n\n**Communication :**\n- Vulgariser les termes techniques\n- Toujours demander le contexte business avant de répondre\n- Proposer des solutions graduées (court/moyen/long terme)',
      specifications_cadrage: ['Connaissance', 'Pertinence', 'Invitation', 'Faisabilité', 'Clarification', 'Cadrage', 'DoD', 'Clarté'],
      parametres_base: { temperature: 0.3, max_tokens: 2000 },
      statut: 'published',
      visibilite: 'public',
      nb_utilisations: 247,
      note_moyenne: 4.8,
      nb_evaluations: 156,
      sections: [],
      cree_par: 'user-123',
      cree_le: new Date('2025-09-10'),
      modifie_le: new Date('2025-09-15'),
      est_version_principale: true
    }
    // Add more mock profils as needed
  ];

  // Apply filters (simplified for mock)
  let filteredProfils = mockProfils;

  if (query.domaine) {
    filteredProfils = filteredProfils.filter(p => p.domaine === query.domaine);
  }

  if (query.recherche) {
    const searchTerm = query.recherche.toLowerCase();
    filteredProfils = filteredProfils.filter(p =>
      p.nom.toLowerCase().includes(searchTerm) ||
      p.description_courte.toLowerCase().includes(searchTerm)
    );
  }

  if (query.note_min) {
    filteredProfils = filteredProfils.filter(p =>
      p.note_moyenne && p.note_moyenne >= query.note_min!
    );
  }

  // Apply pagination (simplified)
  const limit = query.limit || 20;
  const offset = 0; // TODO: Implement cursor-based pagination

  return {
    data: filteredProfils.slice(offset, offset + limit),
    totalCount: filteredProfils.length,
    hasNext: filteredProfils.length > offset + limit,
    hasPrevious: offset > 0,
    nextCursor: filteredProfils.length > offset + limit ? 'next-cursor' : undefined,
    suggestions: query.recherche ? ['expert comptable', 'audit finance', 'pme'] : undefined
  };
}

async function createProfilInDatabase(
  profil: Omit<ProfilExpertise, 'id' | 'sections'>,
  sectionsExpertise?: any[],
  sectionsScope?: any[]
) {
  // TODO: Implement real PostgreSQL insert with transaction
  const newProfil = {
    ...profil,
    id: `prof-${Date.now()}`, // Temporary ID generation
    sections: []
  };

  console.log('Mock: Created profil in database:', newProfil.nom);

  return newProfil;
}

function mapToMarketplaceProfil(profil: ProfilExpertise, userRole: string): ProfilMarketplace {
  return {
    id: profil.id,
    nom: profil.nom,
    slug: profil.slug,
    domaine: profil.domaine,
    secteurs_cibles: profil.secteurs_cibles,
    niveau_complexite: profil.niveau_complexite,
    description_courte: profil.description_courte,
    tags: profil.tags,
    note_moyenne: profil.note_moyenne,
    nb_evaluations: profil.nb_evaluations,
    nb_utilisations: profil.nb_utilisations,
    score_popularite: calculateProfilScore(profil),
    cree_par: profil.cree_par,
    cree_le: profil.cree_le,
    modifie_le: profil.modifie_le,
    nb_sections_expertise: profil.sections.filter(s => s.type_section === 'expertise').length,
    sections_preview: profil.sections.slice(0, 3).map(s => s.nom),
    actions_disponibles: getAvailableActions(profil, userRole)
  };
}

function getAvailableActions(profil: ProfilExpertise, userRole: string): ('voir' | 'utiliser' | 'editer' | 'dupliquer')[] {
  const actions: ('voir' | 'utiliser' | 'editer' | 'dupliquer')[] = ['voir'];

  if (profil.statut === 'published' || ['admin', 'manager'].includes(userRole)) {
    actions.push('utiliser');
  }

  if (profil.cree_par === 'current-user' || ['admin'].includes(userRole)) {
    actions.push('editer');
  }

  if (['admin', 'manager'].includes(userRole)) {
    actions.push('dupliquer');
  }

  return actions;
}

function validateCreateProfilRequest(body: CreateProfilRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation nom
  if (!body.nom || body.nom.length < VALIDATION_RULES.profil.nom.min) {
    errors.push(`Le nom doit contenir au moins ${VALIDATION_RULES.profil.nom.min} caractères`);
  }
  if (body.nom && body.nom.length > VALIDATION_RULES.profil.nom.max) {
    errors.push(`Le nom ne peut pas dépasser ${VALIDATION_RULES.profil.nom.max} caractères`);
  }

  // Validation description
  if (!body.description_courte || body.description_courte.length < VALIDATION_RULES.profil.description_courte.min) {
    errors.push(`La description courte doit contenir au moins ${VALIDATION_RULES.profil.description_courte.min} caractères`);
  }
  if (body.description_courte && body.description_courte.length > VALIDATION_RULES.profil.description_courte.max) {
    errors.push(`La description courte ne peut pas dépasser ${VALIDATION_RULES.profil.description_courte.max} caractères`);
  }

  // Validation identity_prompt
  if (!body.identity_prompt || body.identity_prompt.length < VALIDATION_RULES.profil.identity_prompt.min) {
    errors.push(`Le prompt d'identité doit contenir au moins ${VALIDATION_RULES.profil.identity_prompt.min} caractères`);
  }
  if (body.identity_prompt && body.identity_prompt.length > VALIDATION_RULES.profil.identity_prompt.max) {
    errors.push(`Le prompt d'identité ne peut pas dépasser ${VALIDATION_RULES.profil.identity_prompt.max} caractères`);
  }

  // Validation compétences
  if (!body.competences_cles || body.competences_cles.length < VALIDATION_RULES.profil.competences_cles.min) {
    errors.push(`Au moins ${VALIDATION_RULES.profil.competences_cles.min} compétence clé requise`);
  }
  if (body.competences_cles && body.competences_cles.length > VALIDATION_RULES.profil.competences_cles.max) {
    errors.push(`Maximum ${VALIDATION_RULES.profil.competences_cles.max} compétences clés autorisées`);
  }

  // Validation exemples tâches
  if (!body.exemples_taches || body.exemples_taches.length < VALIDATION_RULES.profil.exemples_taches.min) {
    errors.push(`Au moins ${VALIDATION_RULES.profil.exemples_taches.min} exemples de tâches requis`);
  }
  if (body.exemples_taches && body.exemples_taches.length > VALIDATION_RULES.profil.exemples_taches.max) {
    errors.push(`Maximum ${VALIDATION_RULES.profil.exemples_taches.max} exemples de tâches autorisés`);
  }

  // Validation domaine
  if (!body.domaine) {
    errors.push('Le domaine d\'expertise est requis');
  }

  // Validation niveau
  if (!body.niveau_complexite) {
    errors.push('Le niveau de complexité est requis');
  }

  // Validation visibilité
  if (!body.visibilite) {
    errors.push('La visibilité est requise');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}