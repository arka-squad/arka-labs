// B30 API - Marketplace Profils
// GET /api/b30/marketplace - Public marketplace avec statistiques
// Endpoint optimisé pour la page marketplace avec analytics

import { NextRequest, NextResponse } from 'next/server';

// Types pour le marketplace
type DomaineExpertise = 'Finance' | 'RH' | 'Marketing' | 'Tech' | 'Legal' | 'Operations' | 'Strategy';

interface ProfilsQuery {
  domaine?: DomaineExpertise;
  secteur?: string[];
  niveau?: 'beginner' | 'intermediate' | 'advanced';
  statut?: string;
  tags?: string[];
  recherche?: string;
  note_min?: number;
  cursor?: string;
  limit?: number;
  sort_by?: 'usage' | 'note' | 'recent' | 'nom';
  sort_order?: 'asc' | 'desc';
}

interface ProfilMarketplace {
  id: string;
  nom: string;
  slug: string;
  domaine: DomaineExpertise;
  secteurs_cibles: string[];
  niveau_complexite: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  description_courte: string;
  nb_utilisations: number;
  note_moyenne?: number;
  nb_evaluations?: number;
  score_popularite: number;
  cree_par: string;
  cree_le: Date;
  modifie_le: Date;
  nb_sections_expertise: number;
  sections_preview: string[];
  actions_disponibles: ('voir' | 'utiliser' | 'editer' | 'dupliquer')[];
}

export interface MarketplaceResponse {
  profils: ProfilMarketplace[];
  pagination: {
    cursor?: string;
    has_next: boolean;
    has_previous: boolean;
    total_count: number;
  };
  filtres_appliques: Partial<ProfilsQuery>;
  statistiques: MarketplaceStats;
  suggestions_recherche?: string[];
}

export interface MarketplaceStats {
  total_profils: number;
  par_domaine: Record<DomaineExpertise, {
    count: number;
    note_moyenne: number;
    nb_utilisations: number;
  }>;
  par_niveau: Record<string, number>;
  profils_populaires: string[]; // IDs des profils les plus utilisés
  nouveautes: string[]; // IDs des profils récents
  tendances_recherche: string[];
}

// ================================
// GET /api/b30/marketplace
// ================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters (same as profils endpoint but with defaults for marketplace)
    const query: ProfilsQuery = {
      domaine: searchParams.get('domaine') as any || undefined,
      secteur: searchParams.getAll('secteur'),
      niveau: searchParams.get('niveau') as any || undefined,
      statut: 'published', // Marketplace only shows published profils
      tags: searchParams.getAll('tags'),
      recherche: searchParams.get('recherche') || undefined,
      note_min: searchParams.get('note_min') ? Number(searchParams.get('note_min')) : undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: Math.min(Number(searchParams.get('limit') || 20), 50),
      sort_by: searchParams.get('sort_by') as any || 'usage', // Default to most used
      sort_order: searchParams.get('sort_order') as any || 'desc'
    };

    const userRole = 'admin'; // TODO: Implement real auth

    // Get profils for marketplace
    const profils = await getMarketplaceProfils(query);

    // Get marketplace statistics
    const stats = await getMarketplaceStats();

    // Build response
    const response: MarketplaceResponse = {
      profils: profils.data.map(profil => mapToMarketplaceProfil(profil, userRole)),
      pagination: {
        cursor: profils.nextCursor,
        has_next: profils.hasNext,
        has_previous: profils.hasPrevious,
        total_count: profils.totalCount
      },
      filtres_appliques: query,
      statistiques: stats,
      suggestions_recherche: profils.suggestions
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching marketplace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

async function getMarketplaceProfils(query: ProfilsQuery) {
  // TODO: Implement real PostgreSQL query optimized for marketplace
  // Focus on published profils with good ratings and usage

  // Mock data for marketplace
  const mockProfils = [
    {
      id: 'prof-001',
      nom: 'Expert Comptable PME',
      slug: 'expert-comptable-pme',
      domaine: 'Finance' as DomaineExpertise,
      secteurs_cibles: ['Manufacturing', 'Retail'],
      niveau_complexite: 'advanced' as const,
      tags: ['comptabilité', 'pme', 'audit'],
      description_courte: 'Expert en comptabilité PME avec 15 ans d\'expérience industrielle',
      nb_utilisations: 247,
      note_moyenne: 4.8,
      nb_evaluations: 156,
      score_popularite: 92,
      cree_par: 'jean-expert',
      cree_le: new Date('2025-09-10'),
      modifie_le: new Date('2025-09-15'),
      nb_sections_expertise: 5,
      sections_preview: ['Analyse financière', 'Audit comptable', 'Fiscalité PME'],
      actions_disponibles: ['voir', 'utiliser', 'dupliquer'] as const
    },
    {
      id: 'prof-002',
      nom: 'Expert RH Transformation',
      slug: 'expert-rh-transformation',
      domaine: 'RH' as DomaineExpertise,
      secteurs_cibles: ['Services', 'Manufacturing'],
      niveau_complexite: 'advanced' as const,
      tags: ['rh', 'transformation', 'change-management'],
      description_courte: 'DRH expérimentée spécialisée PME croissance et transformation',
      nb_utilisations: 189,
      note_moyenne: 4.9,
      nb_evaluations: 89,
      score_popularite: 88,
      cree_par: 'marie-rh',
      cree_le: new Date('2025-09-08'),
      modifie_le: new Date('2025-09-14'),
      nb_sections_expertise: 6,
      sections_preview: ['Recrutement efficace', 'Formation équipes', 'Relations sociales'],
      actions_disponibles: ['voir', 'utiliser', 'dupliquer'] as const
    },
    {
      id: 'prof-003',
      nom: 'Expert Marketing Digital ROI',
      slug: 'expert-marketing-digital-roi',
      domaine: 'Marketing' as DomaineExpertise,
      secteurs_cibles: ['E-commerce', 'Services', 'Retail'],
      niveau_complexite: 'intermediate' as const,
      tags: ['marketing-digital', 'roi', 'growth'],
      description_courte: 'Spécialisé growth marketing PME avec ROI mesurable',
      nb_utilisations: 134,
      note_moyenne: 4.6,
      nb_evaluations: 67,
      score_popularite: 78,
      cree_par: 'paul-marketing',
      cree_le: new Date('2025-09-05'),
      modifie_le: new Date('2025-09-12'),
      nb_sections_expertise: 4,
      sections_preview: ['SEO/SEA', 'Social Ads', 'Conversion', 'Analytics'],
      actions_disponibles: ['voir', 'utiliser', 'dupliquer'] as const
    },
    {
      id: 'prof-004',
      nom: 'Architecte Solution Cloud',
      slug: 'architecte-solution-cloud',
      domaine: 'Tech' as DomaineExpertise,
      secteurs_cibles: ['SaaS', 'Fintech', 'E-commerce'],
      niveau_complexite: 'advanced' as const,
      tags: ['cloud', 'architecture', 'devops'],
      description_courte: 'Architecte cloud senior spécialisé solutions scalables enterprise',
      nb_utilisations: 98,
      note_moyenne: 4.9,
      nb_evaluations: 45,
      score_popularite: 85,
      cree_par: 'alex-tech',
      cree_le: new Date('2025-09-01'),
      modifie_le: new Date('2025-09-10'),
      nb_sections_expertise: 7,
      sections_preview: ['Architecture AWS', 'DevOps CI/CD', 'Monitoring'],
      actions_disponibles: ['voir', 'utiliser', 'dupliquer'] as const
    }
  ];

  // Apply filters
  let filteredProfils = mockProfils;

  if (query.domaine) {
    filteredProfils = filteredProfils.filter(p => p.domaine === query.domaine);
  }

  if (query.niveau) {
    filteredProfils = filteredProfils.filter(p => p.niveau_complexite === query.niveau);
  }

  if (query.recherche) {
    const searchTerm = query.recherche.toLowerCase();
    filteredProfils = filteredProfils.filter(p =>
      p.nom.toLowerCase().includes(searchTerm) ||
      p.description_courte.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  if (query.note_min) {
    filteredProfils = filteredProfils.filter(p =>
      p.note_moyenne && p.note_moyenne >= query.note_min!
    );
  }

  if (query.tags && query.tags.length > 0) {
    filteredProfils = filteredProfils.filter(p =>
      query.tags!.some(tag => p.tags.includes(tag))
    );
  }

  // Apply sorting
  if (query.sort_by === 'usage') {
    filteredProfils.sort((a, b) =>
      query.sort_order === 'desc' ? b.nb_utilisations - a.nb_utilisations : a.nb_utilisations - b.nb_utilisations
    );
  } else if (query.sort_by === 'note') {
    filteredProfils.sort((a, b) => {
      const noteA = a.note_moyenne || 0;
      const noteB = b.note_moyenne || 0;
      return query.sort_order === 'desc' ? noteB - noteA : noteA - noteB;
    });
  } else if (query.sort_by === 'recent') {
    filteredProfils.sort((a, b) =>
      query.sort_order === 'desc'
        ? b.modifie_le.getTime() - a.modifie_le.getTime()
        : a.modifie_le.getTime() - b.modifie_le.getTime()
    );
  } else if (query.sort_by === 'nom') {
    filteredProfils.sort((a, b) =>
      query.sort_order === 'desc' ? b.nom.localeCompare(a.nom) : a.nom.localeCompare(b.nom)
    );
  }

  // Apply pagination
  const limit = query.limit || 20;
  const offset = 0; // TODO: Implement cursor-based pagination

  return {
    data: filteredProfils.slice(offset, offset + limit),
    totalCount: filteredProfils.length,
    hasNext: filteredProfils.length > offset + limit,
    hasPrevious: offset > 0,
    nextCursor: filteredProfils.length > offset + limit ? 'next-cursor' : undefined,
    suggestions: generateSearchSuggestions(query.recherche)
  };
}

async function getMarketplaceStats(): Promise<MarketplaceStats> {
  // TODO: Implement real database aggregation queries
  // Mock statistics for now

  return {
    total_profils: 23,
    par_domaine: {
      'Finance': { count: 8, note_moyenne: 4.7, nb_utilisations: 1247 },
      'RH': { count: 6, note_moyenne: 4.8, nb_utilisations: 892 },
      'Marketing': { count: 4, note_moyenne: 4.5, nb_utilisations: 654 },
      'Tech': { count: 3, note_moyenne: 4.9, nb_utilisations: 445 },
      'Legal': { count: 1, note_moyenne: 4.6, nb_utilisations: 89 },
      'Operations': { count: 1, note_moyenne: 4.4, nb_utilisations: 67 },
      'Strategy': { count: 0, note_moyenne: 0, nb_utilisations: 0 }
    },
    par_niveau: {
      'beginner': 2,
      'intermediate': 8,
      'advanced': 13
    },
    profils_populaires: ['prof-001', 'prof-002', 'prof-003'], // Top 3 by usage
    nouveautes: ['prof-004', 'prof-003', 'prof-002'], // 3 most recent
    tendances_recherche: ['comptabilité', 'rh transformation', 'marketing digital', 'audit', 'finance pme']
  };
}

function mapToMarketplaceProfil(profil: any, userRole: string): ProfilMarketplace {
  // Determine available actions based on user role
  const actions: ('voir' | 'utiliser' | 'editer' | 'dupliquer')[] = ['voir', 'utiliser'];

  if (['admin', 'manager'].includes(userRole)) {
    actions.push('dupliquer');
  }

  if (profil.cree_par === 'current-user' || userRole === 'admin') {
    actions.push('editer');
  }

  return {
    ...profil,
    actions_disponibles: actions
  };
}

function generateSearchSuggestions(recherche?: string): string[] {
  if (!recherche) return [];

  // TODO: Implement intelligent search suggestions based on:
  // - Popular searches
  // - Profil names and tags
  // - User search history

  const suggestions = [
    'expert comptable',
    'audit finance',
    'rh recrutement',
    'marketing digital',
    'transformation digitale',
    'architecture cloud'
  ];

  return suggestions.filter(s =>
    s.toLowerCase().includes(recherche.toLowerCase())
  ).slice(0, 5);
}