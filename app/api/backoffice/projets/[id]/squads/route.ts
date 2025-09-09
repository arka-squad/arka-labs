import { NextRequest, NextResponse } from 'next/server';

// Types pour assignation de squad
interface AssignSquadRequest {
  squad_id: string;
}

interface AssignSquadResponse {
  projet_id: number;
  squad_id: string;
  squad_nom: string;
  domaine: string;
  agents_mobilises: number;
  agents_details: Array<{
    agent_id: string;
    agent_nom: string;
    specializations: string[];
  }>;
  assigned_by: string;
  assigned_at: string;
}

// Mock data des squads disponibles
const mockSquads = [
  {
    id: 'squad-rh-alpha',
    name: 'Squad RH Alpha',
    domaine: 'RH',
    status: 'active',
    agents: [
      { id: 'agent-heloise-rh', name: 'Héloïse RH', specializations: ['recrutement', 'formation'] },
      { id: 'agent-consultant-rh', name: 'Consultant RH Senior', specializations: ['droit-travail', 'paie'] }
    ]
  },
  {
    id: 'squad-tech-core',
    name: 'Squad Tech Core',
    domaine: 'Tech',
    status: 'active',
    agents: [
      { id: 'agent-dev-senior', name: 'Développeur Senior', specializations: ['backend', 'api'] },
      { id: 'agent-devops', name: 'DevOps Expert', specializations: ['cloud', 'ci-cd'] },
      { id: 'agent-architect', name: 'Architecte Solution', specializations: ['architecture', 'security'] }
    ]
  },
  {
    id: 'squad-marketing-beta',
    name: 'Squad Marketing Beta',
    domaine: 'Marketing',
    status: 'active',
    agents: [
      { id: 'agent-marketing-digital', name: 'Expert Marketing Digital', specializations: ['seo', 'social-media'] },
      { id: 'agent-content-manager', name: 'Content Manager', specializations: ['redaction', 'video'] }
    ]
  }
];

// Mock data des assignations existantes
let mockProjectSquads = [
  {
    id: 'assignment-1',
    project_id: 1,
    squad_id: 'squad-rh-alpha',
    status: 'active',
    attached_by: 'manager@arka.com',
    attached_at: '2025-09-08T11:00:00Z'
  }
];

// Mock data des agents de projet (mis à jour automatiquement lors de l'assignation squad)
let mockProjetAgents = [
  {
    id: 'projet-agent-1',
    projet_id: 1,
    agent_id: 'agent-heloise-rh',
    source: 'squad',
    squad_id: 'squad-rh-alpha',
    prompt_adaptation: 'PME industrielle, équipe junior, priorité formation et collaboration',
    statut: 'actif',
    assigned_by: 'manager@arka.com',
    assigned_at: '2025-09-08T11:00:00Z'
  }
];

// Fonction pour générer une adaptation de prompt par défaut
function generateDefaultAdaptation(agent: any, projet: any, client: any): string {
  const adaptations = [];
  
  // Adaptation selon la taille du client
  if (client.taille === 'PME') {
    adaptations.push('Contexte PME, communication directe et pragmatique');
  } else if (client.taille === 'GE') {
    adaptations.push('Grande entreprise, processus formels, validation hiérarchique');
  }
  
  // Adaptation selon le secteur
  if (client.secteur.includes('Industrie')) {
    adaptations.push('Secteur industriel, enjeux sécurité et formation technique');
  } else if (client.secteur.includes('Tech')) {
    adaptations.push('Secteur technologique, agilité et innovation');
  }
  
  // Adaptation selon la priorité du projet
  if (projet.priorite === 'urgente' || projet.priorite === 'haute') {
    adaptations.push('Projet prioritaire, délais serrés');
  }
  
  return adaptations.join('. ') || 'Adapter selon le contexte client et projet';
}

// POST /api/backoffice/projets/[id]/squads - Assigner une squad au projet
export async function POST(
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
    
    const { squad_id }: AssignSquadRequest = await request.json();
    
    if (!squad_id) {
      return NextResponse.json(
        { error: 'squad_id requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que le projet existe (simplifié)
    // Dans une vraie app, on ferait une requête à la DB
    if (projetId < 1 || projetId > 10) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }
    
    // Vérifier que la squad existe
    const squad = mockSquads.find(s => s.id === squad_id);
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad introuvable' },
        { status: 404 }
      );
    }
    
    // Vérifier que la squad n'est pas déjà assignée
    const existingAssignment = mockProjectSquads.find(
      ps => ps.project_id === projetId && ps.squad_id === squad_id && ps.status === 'active'
    );
    
    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Squad déjà assignée à ce projet' },
        { status: 409 }
      );
    }
    
    // Créer l'assignation squad
    const newAssignment = {
      id: `assignment-${Date.now()}`,
      project_id: projetId,
      squad_id: squad_id,
      status: 'active',
      attached_by: 'current_user@arka.com', // TODO: récupérer depuis JWT
      attached_at: new Date().toISOString()
    };
    
    mockProjectSquads.push(newAssignment);
    
    // Ajouter automatiquement tous les agents de la squad au projet
    const clientMock = { taille: 'PME', secteur: 'Industrie' }; // TODO: récupérer le vrai client
    const projetMock = { priorite: 'haute' }; // TODO: récupérer le vrai projet
    
    for (const agent of squad.agents) {
      const agentAssignment = {
        id: `projet-agent-${Date.now()}-${agent.id}`,
        projet_id: projetId,
        agent_id: agent.id,
        source: 'squad',
        squad_id: squad_id,
        prompt_adaptation: generateDefaultAdaptation(agent, projetMock, clientMock),
        statut: 'actif',
        assigned_by: 'current_user@arka.com',
        assigned_at: new Date().toISOString()
      };
      
      mockProjetAgents.push(agentAssignment);
    }
    
    // Préparer la réponse
    const response: AssignSquadResponse = {
      projet_id: projetId,
      squad_id: squad.id,
      squad_nom: squad.name,
      domaine: squad.domaine,
      agents_mobilises: squad.agents.length,
      agents_details: squad.agents.map(agent => ({
        agent_id: agent.id,
        agent_nom: agent.name,
        specializations: agent.specializations
      })),
      assigned_by: newAssignment.attached_by,
      assigned_at: newAssignment.attached_at
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de l\'assignation de la squad:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET /api/backoffice/projets/[id]/squads - Lister les squads assignées
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
    
    // Récupérer les assignations actives pour ce projet
    const assignments = mockProjectSquads.filter(
      ps => ps.project_id === projetId && ps.status === 'active'
    );
    
    // Enrichir avec les détails des squads
    const squadsWithDetails = assignments.map(assignment => {
      const squad = mockSquads.find(s => s.id === assignment.squad_id);
      if (!squad) return null;
      
      return {
        assignment_id: assignment.id,
        squad_id: squad.id,
        squad_nom: squad.name,
        domaine: squad.domaine,
        agents_mobilises: squad.agents.length,
        assigned_at: assignment.attached_at,
        assigned_by: assignment.attached_by
      };
    }).filter(Boolean);
    
    return NextResponse.json({
      projet_id: projetId,
      squads_assignees: squadsWithDetails,
      total_squads: squadsWithDetails.length,
      total_agents_via_squads: squadsWithDetails.reduce((sum, s) => sum + (s?.agents_mobilises || 0), 0)
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des squads:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}