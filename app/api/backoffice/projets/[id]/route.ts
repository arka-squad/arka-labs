import { NextRequest, NextResponse } from 'next/server';

// Types pour la fiche projet détaillée
interface ProjetDetailResponse {
  id: number;
  nom: string;
  client: {
    id: string;
    nom: string;
    secteur: string;
    taille: string;
    contexte_specifique: string;
  };
  statut: string;
  priorite: string;
  budget?: number;
  deadline?: string;
  description: string;
  contexte_mission: string;
  squads_assignees: Array<{
    squad_id: string;
    squad_nom: string;
    domaine: string;
    agents_mobilises: number;
    assigned_at: string;
  }>;
  agents_directs: Array<{
    agent_id: string;
    agent_nom: string;
    domaine: string;
    source: string;
    prompt_adaptation: string;
    assigned_at: string;
  }>;
  totals: {
    agents_count: number;
    squads_count: number;
    budget_utilise_estime: number;
  };
  alerts: {
    deadline_status: 'ok' | 'proche' | 'depassee';
    budget_status: 'ok' | 'attention' | 'depasse';
    agents_status: 'ok' | 'insuffisant' | 'excessif';
  };
}

// Mock data étendu
const mockClientsDetailed = [
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    nom: 'Entreprise Alpha',
    secteur: 'PME Industrie',
    taille: 'PME',
    contexte_specifique: 'Culture collaborative, budget serré, équipe technique junior'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    nom: 'Corp Beta',
    secteur: 'Grande distribution',
    taille: 'GE',
    contexte_specifique: 'Processus rigides, conformité stricte, équipes expérimentées'
  }
];

const mockSquadsAssigned = [
  {
    projet_id: 1,
    squad_id: 'squad-rh-alpha',
    squad_nom: 'Squad RH Alpha',
    domaine: 'RH',
    agents_mobilises: 2,
    assigned_at: '2025-09-08T11:00:00Z'
  }
];

const mockAgentsDirects = [
  {
    projet_id: 1,
    agent_id: 'agent-marketing-pro',
    agent_nom: 'Consultant Marketing',
    domaine: 'Marketing',
    source: 'direct',
    prompt_adaptation: 'Adapter communication pour PME industrielle, ton professionnel, éviter jargon technique',
    assigned_at: '2025-09-08T14:00:00Z'
  },
  {
    projet_id: 2,
    agent_id: 'agent-tech-senior',
    agent_nom: 'Architecte Solution',
    domaine: 'Tech',
    source: 'direct',
    prompt_adaptation: 'Grande entreprise, processus rigides, validation à chaque étape obligatoire',
    assigned_at: '2025-09-07T16:00:00Z'
  }
];

let mockProjets = [
  {
    id: 1,
    nom: 'Journée Coworking Q4',
    client_id: '550e8400-e29b-41d4-a716-446655440011',
    statut: 'actif',
    priorite: 'haute',
    budget: 5000,
    deadline: '2025-12-31',
    description: 'Organisation journée coworking + plan formation Q4 pour équipes',
    contexte_mission: 'Première expérience coworking pour l\'équipe RH junior. Focus collaboration et team building.',
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
    description: 'Migration complète du système ERP vers nouvelle version',
    contexte_mission: 'Système critique, migration par phases obligatoire. Équipes expérimentées mais résistance au changement.',
    agents_count: 4,
    squads_count: 1,
    created_by: 'admin@arka.com',
    created_at: '2025-09-07T14:30:00Z'
  }
];

// Fonctions utilitaires
function calculateAlerts(projet: any, totalAgents: number): any {
  const today = new Date();
  const deadline = projet.deadline ? new Date(projet.deadline) : null;
  const daysToDeadline = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  // Estimation budget (400€ par agent)
  const budgetEstime = totalAgents * 400;
  
  return {
    deadline_status: !deadline ? 'ok' : 
                    daysToDeadline < 0 ? 'depassee' :
                    daysToDeadline <= 7 ? 'proche' : 'ok',
    budget_status: !projet.budget ? 'ok' :
                   budgetEstime > projet.budget * 0.9 ? 'attention' : 'ok',
    agents_status: totalAgents === 0 ? 'insuffisant' :
                   totalAgents > 15 ? 'excessif' : 'ok'
  };
}

// GET /api/backoffice/projets/[id] - Fiche projet détaillée
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projetId = parseInt(params.id);
    
    if (isNaN(projetId)) {
      return NextResponse.json(
        { error: 'ID projet invalide' },
        { status: 400 }
      );
    }
    
    // Trouver le projet
    const projet = mockProjets.find(p => p.id === projetId);
    if (!projet) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }
    
    // Trouver le client détaillé
    const client = mockClientsDetailed.find(c => c.id === projet.client_id);
    if (!client) {
      return NextResponse.json(
        { error: 'Client du projet introuvable' },
        { status: 404 }
      );
    }
    
    // Trouver les squads assignées
    const squadsAssignees = mockSquadsAssigned.filter(s => s.projet_id === projetId);
    
    // Trouver les agents directs
    const agentsDirects = mockAgentsDirects.filter(a => a.projet_id === projetId);
    
    // Calculer les totaux
    const totalAgents = squadsAssignees.reduce((sum, s) => sum + s.agents_mobilises, 0) + agentsDirects.length;
    const budgetEstime = totalAgents * 400;
    
    // Calculer les alertes
    const alerts = calculateAlerts(projet, totalAgents);
    
    const response: ProjetDetailResponse = {
      id: projet.id,
      nom: projet.nom,
      client,
      statut: projet.statut,
      priorite: projet.priorite,
      budget: projet.budget,
      deadline: projet.deadline,
      description: projet.description,
      contexte_mission: projet.contexte_mission,
      squads_assignees: squadsAssignees,
      agents_directs: agentsDirects,
      totals: {
        agents_count: totalAgents,
        squads_count: squadsAssignees.length,
        budget_utilise_estime: budgetEstime
      },
      alerts
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH /api/backoffice/projets/[id] - Modification d'un projet
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projetId = parseInt(params.id);
    
    if (isNaN(projetId)) {
      return NextResponse.json(
        { error: 'ID projet invalide' },
        { status: 400 }
      );
    }
    
    const updates = await request.json();
    
    // Trouver le projet à modifier
    const projetIndex = mockProjets.findIndex(p => p.id === projetId);
    if (projetIndex === -1) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }
    
    // Validation des champs modifiables
    const allowedFields = ['nom', 'statut', 'priorite', 'budget', 'deadline', 'description', 'contexte_mission'];
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Champs non modifiables: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validation spécifique
    if (updates.nom && updates.nom.length < 3) {
      return NextResponse.json(
        { error: 'Le nom doit faire au moins 3 caractères' },
        { status: 422 }
      );
    }
    
    if (updates.deadline && new Date(updates.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'La deadline ne peut pas être dans le passé' },
        { status: 422 }
      );
    }
    
    if (updates.budget && updates.budget < 0) {
      return NextResponse.json(
        { error: 'Le budget ne peut pas être négatif' },
        { status: 422 }
      );
    }
    
    // Appliquer les modifications
    mockProjets[projetIndex] = {
      ...mockProjets[projetIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Retourner le projet modifié (version simplifiée)
    const updatedProjet = mockProjets[projetIndex];
    const client = mockClientsDetailed.find(c => c.id === updatedProjet.client_id);
    
    return NextResponse.json({
      id: updatedProjet.id,
      nom: updatedProjet.nom,
      client: client ? { id: client.id, nom: client.nom, secteur: client.secteur } : null,
      statut: updatedProjet.statut,
      priorite: updatedProjet.priorite,
      budget: updatedProjet.budget,
      deadline: updatedProjet.deadline,
      updated_at: updatedProjet.updated_at
    });
    
  } catch (error) {
    console.error('Erreur lors de la modification du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/backoffice/projets/[id] - Suppression d'un projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projetId = parseInt(params.id);
    
    if (isNaN(projetId)) {
      return NextResponse.json(
        { error: 'ID projet invalide' },
        { status: 400 }
      );
    }
    
    // Trouver le projet
    const projetIndex = mockProjets.findIndex(p => p.id === projetId);
    if (projetIndex === -1) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }
    
    const projet = mockProjets[projetIndex];
    
    // Vérifier s'il y a des contraintes (agents assignés, etc.)
    const hasAssignedAgents = mockAgentsDirects.some(a => a.projet_id === projetId);
    const hasAssignedSquads = mockSquadsAssigned.some(s => s.projet_id === projetId);
    
    if ((hasAssignedAgents || hasAssignedSquads) && projet.statut === 'actif') {
      return NextResponse.json(
        { 
          error: 'Cannot delete active project with assigned agents or squads',
          details: 'Set project to inactive first or remove all assignments'
        },
        { status: 409 }
      );
    }
    
    // Supprimer le projet (soft delete en ajoutant deleted_at)
    mockProjets[projetIndex] = {
      ...mockProjets[projetIndex],
      deleted_at: new Date().toISOString()
    };
    
    // Nettoyer les assignations associées
    const agentIndex = mockAgentsDirects.findIndex(a => a.projet_id === projetId);
    if (agentIndex >= 0) {
      mockAgentsDirects.splice(agentIndex, 1);
    }
    
    const squadIndex = mockSquadsAssigned.findIndex(s => s.projet_id === projetId);
    if (squadIndex >= 0) {
      mockSquadsAssigned.splice(squadIndex, 1);
    }
    
    return NextResponse.json(null, { status: 204 });
    
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}