// B30 API - Individual Profil Operations
// GET /api/b30/profils/[id] - Get profil details
// PUT /api/b30/profils/[id] - Update profil
// DELETE /api/b30/profils/[id] - Delete profil

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRole } from '../../../../../lib/auth/role';
import {
  ProfilExpertise,
  UpdateProfilRequest,
  VALIDATION_RULES,
  generateProfilSlug
} from '../../../../../lib/db/models/profil';

// ================================
// GET /api/b30/profils/[id]
// ================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profilId = params.id;
    const userRole = getCurrentRole();

    // TODO: Replace with real database query
    const profil = await getProfilById(profilId);

    if (!profil) {
      return NextResponse.json(
        { error: 'Profil not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canView = canUserViewProfil(profil, userRole);
    if (!canView) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view this profil' },
        { status: 403 }
      );
    }

    // Add user-specific metadata
    const response = {
      ...profil,
      actions_disponibles: getAvailableActions(profil, userRole),
      can_edit: canUserEditProfil(profil, userRole),
      can_delete: canUserDeleteProfil(profil, userRole)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching profil:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profil', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// PUT /api/b30/profils/[id]
// ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profilId = params.id;
    const body = await request.json() as UpdateProfilRequest;
    const userRole = getCurrentRole();

    // Get existing profil
    const existingProfil = await getProfilById(profilId);
    if (!existingProfil) {
      return NextResponse.json(
        { error: 'Profil not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canEdit = canUserEditProfil(existingProfil, userRole);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this profil' },
        { status: 403 }
      );
    }

    // Validate update request
    const validation = validateUpdateProfilRequest(body, existingProfil);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Determine if this is a major update requiring new version
    const requiresNewVersion = shouldCreateNewVersion(body, existingProfil);

    // TODO: Get actual user ID from auth context
    const userId = 'temp-user-id';

    // Create updated profil object
    const updatedProfil = await updateProfilInDatabase(
      existingProfil,
      body,
      userId,
      requiresNewVersion
    );

    return NextResponse.json({
      success: true,
      profil: updatedProfil,
      version_created: requiresNewVersion,
      actions_disponibles: getAvailableActions(updatedProfil, userRole)
    });

  } catch (error) {
    console.error('Error updating profil:', error);
    return NextResponse.json(
      { error: 'Failed to update profil', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// DELETE /api/b30/profils/[id]
// ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profilId = params.id;
    const userRole = getCurrentRole();

    // Get existing profil
    const existingProfil = await getProfilById(profilId);
    if (!existingProfil) {
      return NextResponse.json(
        { error: 'Profil not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canDelete = canUserDeleteProfil(existingProfil, userRole);
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this profil' },
        { status: 403 }
      );
    }

    // Check if profil is in use
    const isInUse = await checkProfilInUse(profilId);
    if (isInUse) {
      return NextResponse.json(
        { error: 'Cannot delete profil: currently in use by active agents' },
        { status: 409 }
      );
    }

    // Soft delete the profil
    await softDeleteProfil(profilId);

    return NextResponse.json({
      success: true,
      message: 'Profil deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting profil:', error);
    return NextResponse.json(
      { error: 'Failed to delete profil', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

async function getProfilById(id: string): Promise<ProfilExpertise | null> {
  // TODO: Implement real PostgreSQL query with sections
  // Mock data for now
  if (id === 'prof-001') {
    return {
      id: 'prof-001',
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
      methodologie: 'Approche méthodique basée sur les normes comptables françaises...',
      outils_maitrises: ['SAP', 'QuickBooks', 'Excel'],
      exemples_taches: [
        'Établissement des comptes annuels',
        'Analyse des ratios financiers',
        'Optimisation fiscale PME'
      ],
      cas_usage: ['Audit comptable trimestriel', 'Préparation budget prévisionnel'],
      limites_explicites: ['Pas de conseil juridique', 'Pas d\'audit externe certifié'],
      identity_prompt: 'Tu es un expert-comptable spécialisé dans les PME avec 15 ans d\'expérience...',
      mission_prompt: 'Ta mission est d\'accompagner les dirigeants PME dans leur gestion financière...',
      personality_prompt: 'Tu es rigoureux, pédagogue et pragmatique...',
      prompt_regles_livraisons: '## Règles de Livraisons - Expert Comptable PME\n\n**Format de livrables :**\n- Rapports comptables au format PDF avec tableaux Excel joints\n- Analyses financières avec graphiques et KPIs visuels\n- Recommandations actionables avec timeline précise\n\n**Standards qualité :**\n- Vérification croisée sur tous les calculs\n- Sources et références pour chaque donnée\n- Résumé exécutif de maximum 2 pages\n\n**Escalade :**\n- Audit externe certifié → Orienter vers un CAC\n- Litiges complexes → Orienter vers un expert judiciaire\n- Fiscalité internationale → Orienter vers un spécialiste\n- Financement > 500K€ → Orienter vers un expert en corporate finance',
      prompt_regles_discussion: '## Règles de Discussion - Expert Comptable PME\n\n**Communication :**\n- Vulgariser les termes techniques\n- Toujours demander le contexte business avant de répondre\n- Proposer des solutions graduées (court/moyen/long terme)\n\n**Limites éthiques :**\n- Ne jamais conseiller d\'optimisation fiscale agressive\n- Rappeler les obligations légales en cas d\'irrégularité détectée\n- Orienter vers un avocat pour tout aspect juridique\n\n**Pédagogie :**\n- Expliquer les "pourquoi" derrière chaque recommandation\n- Donner des exemples concrets sectoriels\n- Proposer des outils de suivi simples',
      specifications_cadrage: ['Connaissance', 'Pertinence', 'Invitation', 'Faisabilité', 'Clarification', 'Cadrage', 'DoD', 'Clarté'],
      parametres_base: { temperature: 0.3, max_tokens: 2000, top_p: 0.9 },
      statut: 'published',
      visibilite: 'public',
      nb_utilisations: 247,
      note_moyenne: 4.8,
      nb_evaluations: 156,
      sections: [
        {
          id: 'section-1',
          profil_id: 'prof-001',
          nom: 'Analyse financière approfondie',
          type_section: 'expertise',
          category: undefined,
          ordre: 1,
          trigger_keywords: ['analyse', 'ratios', 'financier', 'bilan'],
          trigger_weight: 0.8,
          prompt_template: 'Pour l\'analyse financière, je procède méthodiquement...',
          exemple_utilisation: 'Analyse des ratios de liquidité et de rentabilité',
          dependencies: [],
          exclusions: [],
          description: 'Section d\'expertise pour l\'analyse financière avancée',
          est_obligatoire: false,
          est_active: true,
          cree_par: 'user-123',
          cree_le: new Date('2025-09-10'),
          modifie_le: new Date('2025-09-15')
        }
      ],
      cree_par: 'user-123',
      cree_le: new Date('2025-09-10'),
      modifie_le: new Date('2025-09-15'),
      est_version_principale: true
    };
  }
  return null;
}

function canUserViewProfil(profil: ProfilExpertise, userRole: string): boolean {
  // Public profils are viewable by everyone
  if (profil.visibilite === 'public' && profil.statut === 'published') {
    return true;
  }

  // Internal profils viewable by logged users
  if (profil.visibilite === 'internal' && profil.statut === 'published') {
    return true; // Assuming user is logged in if they have a role
  }

  // Private profils only by owner or admin
  if (profil.visibilite === 'private') {
    return profil.cree_par === 'current-user' || ['admin'].includes(userRole);
  }

  // Draft profils only by owner or admin/manager
  if (profil.statut === 'draft') {
    return profil.cree_par === 'current-user' || ['admin', 'manager'].includes(userRole);
  }

  return false;
}

function canUserEditProfil(profil: ProfilExpertise, userRole: string): boolean {
  // Owner can always edit
  if (profil.cree_par === 'current-user') {
    return true;
  }

  // Admins can edit anything
  if (userRole === 'admin') {
    return true;
  }

  return false;
}

function canUserDeleteProfil(profil: ProfilExpertise, userRole: string): boolean {
  // Only owner or admin can delete
  return profil.cree_par === 'current-user' || userRole === 'admin';
}

function getAvailableActions(profil: ProfilExpertise, userRole: string): ('voir' | 'utiliser' | 'editer' | 'dupliquer')[] {
  const actions: ('voir' | 'utiliser' | 'editer' | 'dupliquer')[] = ['voir'];

  if (profil.statut === 'published' || ['admin', 'manager'].includes(userRole)) {
    actions.push('utiliser');
  }

  if (canUserEditProfil(profil, userRole)) {
    actions.push('editer');
  }

  if (['admin', 'manager'].includes(userRole)) {
    actions.push('dupliquer');
  }

  return actions;
}

function validateUpdateProfilRequest(
  body: UpdateProfilRequest,
  existingProfil: ProfilExpertise
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation nom (if provided)
  if (body.nom !== undefined) {
    if (body.nom.length < VALIDATION_RULES.profil.nom.min) {
      errors.push(`Le nom doit contenir au moins ${VALIDATION_RULES.profil.nom.min} caractères`);
    }
    if (body.nom.length > VALIDATION_RULES.profil.nom.max) {
      errors.push(`Le nom ne peut pas dépasser ${VALIDATION_RULES.profil.nom.max} caractères`);
    }
  }

  // Validation description (if provided)
  if (body.description_courte !== undefined) {
    if (body.description_courte.length < VALIDATION_RULES.profil.description_courte.min) {
      errors.push(`La description courte doit contenir au moins ${VALIDATION_RULES.profil.description_courte.min} caractères`);
    }
    if (body.description_courte.length > VALIDATION_RULES.profil.description_courte.max) {
      errors.push(`La description courte ne peut pas dépasser ${VALIDATION_RULES.profil.description_courte.max} caractères`);
    }
  }

  // Validation identity_prompt (if provided)
  if (body.identity_prompt !== undefined) {
    if (body.identity_prompt.length < VALIDATION_RULES.profil.identity_prompt.min) {
      errors.push(`Le prompt d'identité doit contenir au moins ${VALIDATION_RULES.profil.identity_prompt.min} caractères`);
    }
    if (body.identity_prompt.length > VALIDATION_RULES.profil.identity_prompt.max) {
      errors.push(`Le prompt d'identité ne peut pas dépasser ${VALIDATION_RULES.profil.identity_prompt.max} caractères`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function shouldCreateNewVersion(body: UpdateProfilRequest, existing: ProfilExpertise): boolean {
  // Major changes that require new version
  const majorChanges = [
    'identity_prompt',
    'mission_prompt',
    'prompt_regles_livraisons',
    'prompt_regles_discussion',
    'sections_expertise',
    'sections_scope'
  ];

  return majorChanges.some(field => body[field as keyof UpdateProfilRequest] !== undefined);
}

async function updateProfilInDatabase(
  existingProfil: ProfilExpertise,
  updates: UpdateProfilRequest,
  userId: string,
  createNewVersion: boolean
): Promise<ProfilExpertise> {
  // TODO: Implement real PostgreSQL update with transaction

  const updatedProfil: ProfilExpertise = {
    ...existingProfil,
    ...updates,
    modifie_par: userId,
    modifie_le: new Date()
  };

  // Update slug if name changed
  if (updates.nom && updates.nom !== existingProfil.nom) {
    updatedProfil.slug = generateProfilSlug(updates.nom);
  }

  // Create new version if needed
  if (createNewVersion) {
    const versionParts = existingProfil.version.split('.');
    const majorVersion = parseInt(versionParts[0]);
    updatedProfil.version = `${majorVersion + 1}.0.0`;
  }

  console.log('Mock: Updated profil in database:', updatedProfil.nom);

  return updatedProfil;
}

async function checkProfilInUse(profilId: string): Promise<boolean> {
  // TODO: Check if profil is used by any active agents
  // For now, return false (not in use)
  return false;
}

async function softDeleteProfil(profilId: string): Promise<void> {
  // TODO: Implement soft delete in database
  console.log('Mock: Soft deleted profil:', profilId);
}