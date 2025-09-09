import { NextRequest, NextResponse } from 'next/server';

// Types pour les clients
interface CreateClientRequest {
  nom: string;
  secteur?: string;
  taille?: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal?: {
    nom: string;
    email: string;
    telephone: string;
  };
  contexte_specifique?: string;
  statut?: 'actif' | 'inactif' | 'archive';
}

interface ClientResponse {
  id: string;
  nom: string;
  secteur: string;
  taille: string;
  contact_principal: {
    nom: string;
    email: string;
    telephone: string;
  };
  contexte_specifique: string;
  statut: string;
  projets_count: number;
  projets_actifs: number;
  budget_total: number;
  created_at: string;
  updated_at: string;
}

interface ListClientsResponse {
  items: ClientResponse[];
  page: number;
  limit: number;
  total: number;
  filters_applied: any;
}

// Mock data clients avec projets associés
let mockClients = [
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    nom: 'Entreprise Alpha',
    secteur: 'PME Industrie',
    taille: 'PME',
    contact_principal: {
      nom: 'Marie Dubois',
      email: 'marie.dubois@alpha.com',
      telephone: '+33 1 42 86 12 34'
    },
    contexte_specifique: 'Culture collaborative, budget serré, équipe technique junior. Priorité sécurité et formation continue.',
    statut: 'actif',
    created_by: 'admin@arka.com',
    created_at: '2025-09-05T08:30:00Z',
    updated_at: '2025-09-05T08:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    nom: 'Corp Beta',
    secteur: 'Grande distribution',
    taille: 'GE',
    contact_principal: {
      nom: 'Jean Martin',
      email: 'jean.martin@corpbeta.fr',
      telephone: '+33 1 45 23 67 89'
    },
    contexte_specifique: 'Processus rigides, conformité stricte, équipes expérimentées. Validation hiérarchique obligatoire.',
    statut: 'actif',
    created_by: 'admin@arka.com',
    created_at: '2025-09-04T14:15:00Z',
    updated_at: '2025-09-04T14:15:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    nom: 'Startup Gamma',
    secteur: 'Tech SaaS',
    taille: 'TPE',
    contact_principal: {
      nom: 'Sarah Chen',
      email: 'sarah@gamma-tech.io',
      telephone: '+33 6 78 90 12 34'
    },
    contexte_specifique: 'Agilité maximale, budget limité, croissance rapide. Besoin solutions scalables et efficaces.',
    statut: 'actif',
    created_by: 'manager@arka.com',
    created_at: '2025-09-03T16:45:00Z',
    updated_at: '2025-09-03T16:45:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    nom: 'Consulting Delta',
    secteur: 'Services B2B',
    taille: 'PME',
    contact_principal: {
      nom: 'Pierre Rousseau',
      email: 'pierre.r@delta-consulting.fr',
      telephone: '+33 1 56 78 90 12'
    },
    contexte_specifique: 'Cabinet conseil traditionnel, clientèle exigeante. Excellence et personnalisation requises.',
    statut: 'actif',
    created_by: 'manager@arka.com',
    created_at: '2025-09-02T10:20:00Z',
    updated_at: '2025-09-02T10:20:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    nom: 'GreenTech Solutions',
    secteur: 'Environnement',
    taille: 'ETI',
    contact_principal: {
      nom: 'Lisa Moreau',
      email: 'l.moreau@greentech-sol.com',
      telephone: '+33 4 67 89 01 23'
    },
    contexte_specifique: 'Engagement développement durable. Communication orientée impact environnemental.',
    statut: 'actif',
    created_by: 'admin@arka.com',
    created_at: '2025-09-01T13:10:00Z',
    updated_at: '2025-09-01T13:10:00Z'
  }
];

// Mock data des projets pour calculer les stats clients
const mockProjetsForStats = [
  { id: 1, client_id: '550e8400-e29b-41d4-a716-446655440011', statut: 'actif', budget: 5000 },
  { id: 2, client_id: '550e8400-e29b-41d4-a716-446655440012', statut: 'actif', budget: 25000 },
  { id: 3, client_id: '550e8400-e29b-41d4-a716-446655440013', statut: 'inactif', budget: 8000 },
  { id: 4, client_id: '550e8400-e29b-41d4-a716-446655440014', statut: 'actif', budget: 15000 },
  { id: 5, client_id: '550e8400-e29b-41d4-a716-446655440015', statut: 'actif', budget: 12000 },
  { id: 6, client_id: '550e8400-e29b-41d4-a716-446655440011', statut: 'archive', budget: 3500 }
];

// Fonction pour calculer les statistiques d'un client
function calculateClientStats(clientId: string) {
  const clientProjets = mockProjetsForStats.filter(p => p.client_id === clientId);
  const projetsActifs = clientProjets.filter(p => p.statut === 'actif');
  const budgetTotal = clientProjets.reduce((sum, p) => sum + (p.budget || 0), 0);
  
  return {
    projets_count: clientProjets.length,
    projets_actifs: projetsActifs.length,
    budget_total: budgetTotal
  };
}

// Fonction pour enrichir un client avec ses stats
function enrichClient(client: any): ClientResponse {
  const stats = calculateClientStats(client.id);
  return {
    ...client,
    ...stats
  };
}

// Validation pour création/modification client
function validateClient(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.nom || data.nom.length < 2) {
    errors.push('Le nom du client doit faire au moins 2 caractères');
  }
  
  if (data.taille && !['TPE', 'PME', 'ETI', 'GE'].includes(data.taille)) {
    errors.push('Taille invalide (TPE, PME, ETI, GE)');
  }
  
  if (data.contact_principal) {
    if (data.contact_principal.email && !/\S+@\S+\.\S+/.test(data.contact_principal.email)) {
      errors.push('Email invalide');
    }
  }
  
  if (data.contexte_specifique && data.contexte_specifique.length > 2000) {
    errors.push('Le contexte spécifique ne peut pas dépasser 2000 caractères');
  }
  
  return { valid: errors.length === 0, errors };
}

// GET /api/backoffice/clients - Liste des clients avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const secteur = searchParams.get('secteur');
    const taille = searchParams.get('taille');
    const statut = searchParams.get('statut');
    
    // Validation pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Paramètres de pagination invalides' },
        { status: 400 }
      );
    }
    
    // Filtrage
    let filteredClients = [...mockClients];
    
    if (secteur) {
      filteredClients = filteredClients.filter(c => 
        c.secteur.toLowerCase().includes(secteur.toLowerCase())
      );
    }
    
    if (taille) {
      filteredClients = filteredClients.filter(c => c.taille === taille);
    }
    
    if (statut) {
      filteredClients = filteredClients.filter(c => c.statut === statut);
    }
    
    // Pagination
    const total = filteredClients.length;
    const startIndex = (page - 1) * limit;
    const paginatedClients = filteredClients.slice(startIndex, startIndex + limit);
    
    // Enrichissement avec statistiques
    const enrichedClients = paginatedClients.map(enrichClient);
    
    const response: ListClientsResponse = {
      items: enrichedClients,
      page,
      limit,
      total,
      filters_applied: { secteur, taille, statut }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/backoffice/clients - Création d'un nouveau client
export async function POST(request: NextRequest) {
  try {
    const data: CreateClientRequest = await request.json();
    
    // Validation des données
    const validation = validateClient(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Vérifier l'unicité du nom
    const existingClient = mockClients.find(c => 
      c.nom.toLowerCase() === data.nom.toLowerCase() && c.statut !== 'archive'
    );
    
    if (existingClient) {
      return NextResponse.json(
        { error: 'Un client avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    
    // Créer le nouveau client
    const newClient = {
      id: `550e8400-e29b-41d4-a716-${Date.now().toString().slice(-12)}`,
      nom: data.nom,
      secteur: data.secteur || '',
      taille: data.taille || 'PME',
      contact_principal: data.contact_principal || {
        nom: '',
        email: '',
        telephone: ''
      },
      contexte_specifique: data.contexte_specifique || '',
      statut: data.statut || 'actif',
      created_by: 'current_user@arka.com', // TODO: récupérer depuis JWT
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockClients.push(newClient);
    
    // Enrichir et retourner le client créé
    const enrichedClient = enrichClient(newClient);
    
    return NextResponse.json(enrichedClient, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}