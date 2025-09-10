import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Types selon spécifications B23
interface CreateProjetRequest {
  nom: string;
  client_id: string;
  statut?: 'actif' | 'inactif' | 'archive' | 'termine';
  priorite?: 'basse' | 'normale' | 'haute' | 'urgente';
  budget?: number;
  deadline?: string;
  description?: string;
  contexte_mission?: string;
}

interface ProjetResponse {
  id: number;
  nom: string;
  client: {
    id: string;
    nom: string;
    secteur: string;
  };
  statut: string;
  priorite: string;
  budget?: number;
  deadline?: string;
  agents_count: number;
  squads_count: number;
  deadline_alert?: 'ok' | 'proche' | 'depassee';
  created_at: string;
}

interface ListProjetsResponse {
  items: ProjetResponse[];
  page: number;
  limit: number;
  total: number;
  filters_applied: any;
}

// Mock data pour développement
const mockClients = [
  { id: '550e8400-e29b-41d4-a716-446655440011', nom: 'Entreprise Alpha', secteur: 'PME Industrie' },
  { id: '550e8400-e29b-41d4-a716-446655440012', nom: 'Corp Beta', secteur: 'Grande distribution' },
  { id: '550e8400-e29b-41d4-a716-446655440013', nom: 'Startup Gamma', secteur: 'Tech SaaS' },
];

let mockProjets: any[] = [
  {
    id: 1,
    nom: 'Journée Coworking Q4',
    client_id: '550e8400-e29b-41d4-a716-446655440011',
    statut: 'actif',
    priorite: 'haute',
    budget: 5000,
    deadline: '2025-12-31',
    description: 'Organisation journée coworking + plan formation Q4',
    contexte_mission: 'Première expérience coworking, équipe RH junior',
    agents_count: 3,
    squads_count: 1,
    created_by: 'manager@arka.com',
    created_at: '2025-09-08T10:00:00Z'
  },
  {
    id: 2,
    nom: 'Migration ERP v2',
    client_id: '550e8400-e29b-41d4-a716-446655440012',
    statut: 'actif',
    priorite: 'normale',
    budget: 25000,
    deadline: '2026-06-30',
    description: 'Migration complète système ERP',
    contexte_mission: 'Système critique, migration par phases',
    agents_count: 4,
    squads_count: 1,
    created_by: 'admin@arka.com',
    created_at: '2025-09-07T14:30:00Z'
  },
  {
    id: 3,
    nom: 'Audit Carbone Entreprise',
    client_id: '550e8400-e29b-41d4-a716-446655440013',
    statut: 'actif',
    priorite: 'urgente',
    budget: 12000,
    deadline: '2025-09-30',
    description: 'Audit complet empreinte carbone',
    contexte_mission: 'Deadline réglementaire proche',
    agents_count: 2,
    squads_count: 0,
    created_by: 'admin@arka.com',
    created_at: '2025-09-06T09:15:00Z'
  }
];

// Fonction utilitaire pour calculer l'alerte deadline
function calculateDeadlineAlert(deadline?: string): 'ok' | 'proche' | 'depassee' | undefined {
  if (!deadline) return undefined;
  
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'depassee';
  if (diffDays <= 7) return 'proche';
  return 'ok';
}

// Fonction pour enrichir un projet avec les données client
function enrichProjet(projet: any): ProjetResponse {
  const client = mockClients.find(c => c.id === projet.client_id);
  return {
    ...projet,
    client: client || { id: projet.client_id, nom: 'Client inconnu', secteur: 'Inconnu' },
    deadline_alert: calculateDeadlineAlert(projet.deadline)
  };
}

// Validation simple
function validateCreateProjet(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.nom || data.nom.length < 3) {
    errors.push('Le nom du projet doit faire au moins 3 caractères');
  }
  
  if (!data.client_id) {
    errors.push('Un client doit être assigné au projet');
  }
  
  if (data.deadline && new Date(data.deadline) < new Date()) {
    errors.push('La deadline ne peut pas être dans le passé');
  }
  
  if (data.budget && data.budget < 0) {
    errors.push('Le budget ne peut pas être négatif');
  }
  
  return { valid: errors.length === 0, errors };
}

// GET /api/backoffice/projets - Liste des projets avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const statut = searchParams.get('statut');
    const client = searchParams.get('client');
    const deadline = searchParams.get('deadline');
    
    // Validation pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Paramètres de pagination invalides' },
        { status: 400 }
      );
    }
    
    // Filtrage
    let filteredProjets = [...mockProjets];
    
    if (statut) {
      filteredProjets = filteredProjets.filter(p => p.statut === statut);
    }
    
    if (client) {
      filteredProjets = filteredProjets.filter(p => p.client_id === client);
    }
    
    if (deadline === 'proche') {
      filteredProjets = filteredProjets.filter(p => {
        const alert = calculateDeadlineAlert(p.deadline);
        return alert === 'proche' || alert === 'depassee';
      });
    }
    
    // Pagination
    const total = filteredProjets.length;
    const startIndex = (page - 1) * limit;
    const paginatedProjets = filteredProjets.slice(startIndex, startIndex + limit);
    
    // Enrichissement avec données clients
    const enrichedProjets = paginatedProjets.map(enrichProjet);
    
    const response: ListProjetsResponse = {
      items: enrichedProjets,
      page,
      limit,
      total,
      filters_applied: { statut, client, deadline }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/backoffice/projets - Création d'un nouveau projet
export async function POST(request: NextRequest) {
  try {
    const data: CreateProjetRequest = await request.json();
    
    // Validation des données
    const validation = validateCreateProjet(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Vérifier que le client existe
    const client = mockClients.find(c => c.id === data.client_id);
    if (!client) {
      return NextResponse.json(
        { error: 'Client introuvable' },
        { status: 404 }
      );
    }
    
    // Créer le nouveau projet
    const newProjet = {
      id: Math.max(...mockProjets.map(p => p.id), 0) + 1,
      nom: data.nom,
      client_id: data.client_id,
      statut: data.statut || 'actif',
      priorite: data.priorite || 'normale',
      budget: data.budget,
      deadline: data.deadline,
      description: data.description || '',
      contexte_mission: data.contexte_mission || '',
      agents_count: 0,
      squads_count: 0,
      created_by: 'current_user@arka.com', // TODO: récupérer depuis JWT
      created_at: new Date().toISOString()
    };
    
    mockProjets.push(newProjet);
    
    // Enrichir et retourner le projet créé
    const enrichedProjet = enrichProjet(newProjet);
    
    return NextResponse.json(enrichedProjet, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}