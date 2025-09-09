import { NextRequest, NextResponse } from 'next/server';

// Types pour adaptation de prompt d'agent
interface AdaptAgentPromptRequest {
  prompt_adaptation: string;
}

interface AdaptAgentPromptResponse {
  projet_id: number;
  agent_id: string;
  agent_nom: string;
  prompt_adaptation: string;
  updated_by: string;
  updated_at: string;
}

// Mock data des agents disponibles
const mockAgents = [
  { id: 'agent-heloise-rh', name: 'Héloïse RH', domaine: 'RH' },
  { id: 'agent-consultant-rh', name: 'Consultant RH Senior', domaine: 'RH' },
  { id: 'agent-dev-senior', name: 'Développeur Senior', domaine: 'Tech' },
  { id: 'agent-marketing-digital', name: 'Expert Marketing Digital', domaine: 'Marketing' },
  { id: 'agent-architect', name: 'Architecte Solution', domaine: 'Tech' }
];

// Mock data des assignations agents-projets (avec prompt adaptations)
let mockProjetAgents = [
  {
    id: 'projet-agent-1',
    projet_id: 1,
    agent_id: 'agent-heloise-rh',
    source: 'squad',
    squad_id: 'squad-rh-alpha',
    prompt_adaptation: 'PME industrielle, équipe junior RH. Priorité formation équipe et amélioration processus recrutement. Ton bienveillant et pédagogique.',
    statut: 'actif',
    assigned_by: 'manager@arka.com',
    assigned_at: '2025-09-08T11:00:00Z',
    updated_at: '2025-09-08T11:00:00Z'
  },
  {
    id: 'projet-agent-2',
    projet_id: 1,
    agent_id: 'agent-marketing-digital',
    source: 'direct',
    squad_id: null,
    prompt_adaptation: 'Entreprise industrielle PME, communication externe limitée. Adapter stratégie digital pour secteur B2B traditionnel. Focus ROI et mesurabilité.',
    statut: 'actif',
    assigned_by: 'manager@arka.com',
    assigned_at: '2025-09-08T14:00:00Z',
    updated_at: '2025-09-08T14:00:00Z'
  },
  {
    id: 'projet-agent-3',
    projet_id: 2,
    agent_id: 'agent-architect',
    source: 'direct',
    squad_id: null,
    prompt_adaptation: 'Grande entreprise, processus rigides, validation hiérarchique obligatoire à chaque étape. Système critique en production, migration par phases.',
    statut: 'actif',
    assigned_by: 'admin@arka.com',
    assigned_at: '2025-09-07T16:00:00Z',
    updated_at: '2025-09-07T16:00:00Z'
  }
];

// PATCH /api/backoffice/projets/[id]/agents/[agent_id] - Adapter le prompt d'un agent pour le projet
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; agent_id: string } }
) {
  try {
    const projetId = parseInt(params.id);
    const agentId = params.agent_id;
    
    if (isNaN(projetId)) {
      return NextResponse.json(
        { error: 'ID projet invalide' },
        { status: 400 }
      );
    }
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'ID agent requis' },
        { status: 400 }
      );
    }
    
    const { prompt_adaptation }: AdaptAgentPromptRequest = await request.json();
    
    // Validation du prompt
    if (!prompt_adaptation) {
      return NextResponse.json(
        { error: 'prompt_adaptation requis' },
        { status: 400 }
      );
    }
    
    if (prompt_adaptation.length > 1000) {
      return NextResponse.json(
        { error: 'Le prompt d\'adaptation ne peut pas dépasser 1000 caractères' },
        { status: 422 }
      );
    }
    
    // Trouver l'assignation agent-projet
    const assignmentIndex = mockProjetAgents.findIndex(
      pa => pa.projet_id === projetId && pa.agent_id === agentId && pa.statut === 'actif'
    );
    
    if (assignmentIndex === -1) {
      return NextResponse.json(
        { error: 'Agent non assigné à ce projet ou assignation inactive' },
        { status: 404 }
      );
    }
    
    // Vérifier que le projet est actif (business rule)
    // Dans une vraie app, on ferait une requête pour vérifier le statut du projet
    // Pour simplifier, on considère que les projets 1 et 2 sont actifs
    if (projetId > 2) {
      return NextResponse.json(
        { error: 'Cannot update prompts for inactive projects' },
        { status: 409 }
      );
    }
    
    // Trouver les détails de l'agent
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent introuvable' },
        { status: 404 }
      );
    }
    
    // Mettre à jour l'adaptation de prompt
    mockProjetAgents[assignmentIndex] = {
      ...mockProjetAgents[assignmentIndex],
      prompt_adaptation,
      updated_at: new Date().toISOString()
    };
    
    const updatedAssignment = mockProjetAgents[assignmentIndex];
    
    // Préparer la réponse
    const response: AdaptAgentPromptResponse = {
      projet_id: projetId,
      agent_id: agentId,
      agent_nom: agent.name,
      prompt_adaptation: updatedAssignment.prompt_adaptation,
      updated_by: 'current_user@arka.com', // TODO: récupérer depuis JWT
      updated_at: updatedAssignment.updated_at
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de l\'adaptation du prompt agent:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET /api/backoffice/projets/[id]/agents/[agent_id] - Récupérer l'adaptation actuelle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; agent_id: string } }
) {
  try {
    const projetId = parseInt(params.id);
    const agentId = params.agent_id;
    
    if (isNaN(projetId)) {
      return NextResponse.json(
        { error: 'ID projet invalide' },
        { status: 400 }
      );
    }
    
    // Trouver l'assignation
    const assignment = mockProjetAgents.find(
      pa => pa.projet_id === projetId && pa.agent_id === agentId && pa.statut === 'actif'
    );
    
    if (!assignment) {
      return NextResponse.json(
        { error: 'Agent non assigné à ce projet' },
        { status: 404 }
      );
    }
    
    // Trouver les détails de l'agent
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent introuvable' },
        { status: 404 }
      );
    }
    
    const response = {
      projet_id: projetId,
      agent_id: agentId,
      agent_nom: agent.name,
      agent_domaine: agent.domaine,
      source: assignment.source,
      squad_id: assignment.squad_id,
      prompt_adaptation: assignment.prompt_adaptation,
      statut: assignment.statut,
      assigned_at: assignment.assigned_at,
      updated_at: assignment.updated_at
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'adaptation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/backoffice/projets/[id]/agents/[agent_id] - Retirer un agent du projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; agent_id: string } }
) {
  try {
    const projetId = parseInt(params.id);
    const agentId = params.agent_id;
    
    if (isNaN(projetId)) {
      return NextResponse.json(
        { error: 'ID projet invalide' },
        { status: 400 }
      );
    }
    
    // Trouver l'assignation
    const assignmentIndex = mockProjetAgents.findIndex(
      pa => pa.projet_id === projetId && pa.agent_id === agentId && pa.statut === 'actif'
    );
    
    if (assignmentIndex === -1) {
      return NextResponse.json(
        { error: 'Agent non assigné à ce projet' },
        { status: 404 }
      );
    }
    
    const assignment = mockProjetAgents[assignmentIndex];
    
    // Vérification business : ne peut pas retirer un agent venu via squad
    // Il faut retirer la squad entière
    if (assignment.source === 'squad') {
      return NextResponse.json(
        { 
          error: 'Cannot remove individual agent from squad assignment',
          details: 'Remove the entire squad or change assignment to direct first'
        },
        { status: 409 }
      );
    }
    
    // Retirer l'assignation (soft delete)
    mockProjetAgents[assignmentIndex] = {
      ...mockProjetAgents[assignmentIndex],
      statut: 'inactif',
      removed_at: new Date().toISOString(),
      removed_by: 'current_user@arka.com'
    };
    
    return NextResponse.json(null, { status: 204 });
    
  } catch (error) {
    console.error('Erreur lors du retrait de l\'agent:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}