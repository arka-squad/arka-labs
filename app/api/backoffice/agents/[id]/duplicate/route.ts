import { NextRequest, NextResponse } from 'next/server';

// Types pour la duplication d'agent
interface DuplicateAgentRequest {
  new_name: string;
  version?: string;
  changes: {
    version: string;
    improvements: string;
    prompt_updates?: string[];
    config_updates?: Record<string, any>;
  };
}

interface DuplicateAgentResponse {
  original_id: string;
  new_id: string;
  new_name: string;
  version: string;
  changes: {
    version: string;
    improvements: string;
    prompt_updates: string[];
    config_updates: Record<string, any>;
  };
  based_on: {
    agent_id: string;
    agent_name: string;
    version: string;
  };
  created_by: string;
  created_at: string;
}

// Mock data des agents (référence depuis agents/route.ts)
const mockAgents = [
  {
    id: 'agent-heloise-rh-001',
    name: 'Héloïse RH',
    role: 'Assistant RH',
    domaine: 'RH',
    version: '1.0',
    description: 'Agent spécialisé en gestion des ressources humaines, recrutement et formation',
    tags: ['recrutement', 'formation', 'onboarding', 'entretiens'],
    prompt_system: 'Tu es Héloïse, une experte en ressources humaines bienveillante et professionnelle. Tu aides les équipes RH dans leurs tâches quotidiennes : recrutement, formation, gestion des talents et amélioration des processus RH.',
    temperature: 0.7,
    max_tokens: 2048,
    is_template: true,
    original_agent_id: null,
    status: 'active',
    created_by: 'admin@arka.com',
    created_at: '2025-08-15T09:00:00Z',
    updated_at: '2025-08-15T09:00:00Z'
  },
  {
    id: 'agent-tech-senior-001',
    name: 'Développeur Senior',
    role: 'Expert Technique',
    domaine: 'Tech',
    version: '2.1',
    description: 'Agent expert en développement backend, architecture et bonnes pratiques',
    tags: ['backend', 'api', 'architecture', 'code-review', 'mentoring'],
    prompt_system: 'Tu es un développeur senior expérimenté, expert en architecture logicielle et bonnes pratiques de développement. Tu guides les équipes techniques dans leurs choix architecturaux et technologiques.',
    temperature: 0.5,
    max_tokens: 3000,
    is_template: true,
    original_agent_id: null,
    status: 'active',
    created_by: 'admin@arka.com',
    created_at: '2025-08-10T14:30:00Z',
    updated_at: '2025-09-01T10:15:00Z'
  }
];

// Historique des duplications pour éviter les conflits
let agentDuplicationHistory: any[] = [];

// Fonction pour valider les données de duplication
function validateDuplication(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.new_name || data.new_name.length < 2) {
    errors.push('Le nouveau nom doit faire au moins 2 caractères');
  }
  
  if (!data.changes || typeof data.changes !== 'object') {
    errors.push('Les changements doivent être spécifiés');
  } else {
    if (!data.changes.version) {
      errors.push('La nouvelle version doit être spécifiée');
    }
    
    if (!data.changes.improvements || data.changes.improvements.length < 10) {
      errors.push('Les améliorations doivent être détaillées (au moins 10 caractères)');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Fonction pour générer un nouvel ID agent
function generateNewAgentId(baseName: string): string {
  const cleanName = baseName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 20);
  
  const timestamp = Date.now().toString().slice(-6);
  return `agent-${cleanName}-${timestamp}`;
}

// Fonction pour incrémenter automatiquement la version
function calculateNextVersion(currentVersion: string, requestedVersion?: string): string {
  if (requestedVersion) {
    // Valider le format de version
    if (!/^\d+\.\d+$/.test(requestedVersion)) {
      throw new Error('Format de version invalide (attendu: X.Y)');
    }
    return requestedVersion;
  }
  
  // Auto-incrémenter
  const [major, minor] = currentVersion.split('.').map(Number);
  return `${major}.${minor + 1}`;
}

// Fonction pour appliquer les changements au prompt
function applyPromptUpdates(originalPrompt: string, updates: string[]): string {
  if (!updates || updates.length === 0) return originalPrompt;
  
  let updatedPrompt = originalPrompt;
  
  // Ajouter les mises à jour à la fin du prompt
  const updatesSection = '\n\n--- AMÉLIORATIONS VERSION ---\n' + 
    updates.map(update => `• ${update}`).join('\n');
  
  return updatedPrompt + updatesSection;
}

// POST /api/backoffice/agents/[id]/duplicate - Dupliquer un agent avec améliorations
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const originalAgentId = params.id;
    
    if (!originalAgentId) {
      return NextResponse.json(
        { error: 'ID agent requis' },
        { status: 400 }
      );
    }
    
    const data: DuplicateAgentRequest = await request.json();
    
    // Validation des données
    const validation = validateDuplication(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Trouver l'agent original
    const originalAgent = mockAgents.find(a => a.id === originalAgentId && a.status === 'active');
    if (!originalAgent) {
      return NextResponse.json(
        { error: 'Agent original introuvable' },
        { status: 404 }
      );
    }
    
    // Vérifier les permissions - seuls les admins peuvent dupliquer
    // TODO: Implémenter la vérification RBAC réelle
    const userRole = 'admin'; // Simulé - à récupérer du JWT
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Seuls les administrateurs peuvent dupliquer des agents' },
        { status: 403 }
      );
    }
    
    // Vérifier l'unicité du nouveau nom
    const existingAgent = mockAgents.find(a => 
      a.name.toLowerCase() === data.new_name.toLowerCase() && 
      a.status === 'active'
    );
    
    if (existingAgent) {
      return NextResponse.json(
        { error: 'Un agent avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    
    try {
      // Calculer la nouvelle version
      const newVersion = calculateNextVersion(originalAgent.version, data.version);
      
      // Générer le nouvel ID
      const newAgentId = generateNewAgentId(data.new_name);
      
      // Appliquer les mises à jour au prompt
      const updatedPrompt = applyPromptUpdates(
        originalAgent.prompt_system, 
        data.changes.prompt_updates || []
      );
      
      // Créer le nouvel agent (copie avec modifications)
      const newAgent = {
        ...originalAgent,
        id: newAgentId,
        name: data.new_name,
        version: newVersion,
        prompt_system: updatedPrompt,
        is_template: false, // Les duplications ne sont pas des templates par défaut
        original_agent_id: null,
        // Appliquer les config updates s'il y en a
        ...(data.changes.config_updates || {}),
        created_by: 'current_user@arka.com', // TODO: récupérer depuis JWT
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Ajouter à la liste des agents (simulation)
      mockAgents.push(newAgent);
      
      // Enregistrer dans l'historique de duplication
      const duplicationRecord = {
        id: `duplication-${Date.now()}`,
        original_id: originalAgentId,
        new_id: newAgentId,
        new_name: data.new_name,
        version: newVersion,
        changes: {
          version: newVersion,
          improvements: data.changes.improvements,
          prompt_updates: data.changes.prompt_updates || [],
          config_updates: data.changes.config_updates || {}
        },
        based_on: {
          agent_id: originalAgentId,
          agent_name: originalAgent.name,
          version: originalAgent.version
        },
        created_by: 'current_user@arka.com',
        created_at: new Date().toISOString()
      };
      
      agentDuplicationHistory.push(duplicationRecord);
      
      // Préparer la réponse
      const response: DuplicateAgentResponse = {
        original_id: originalAgentId,
        new_id: newAgentId,
        new_name: data.new_name,
        version: newVersion,
        changes: duplicationRecord.changes,
        based_on: duplicationRecord.based_on,
        created_by: duplicationRecord.created_by,
        created_at: duplicationRecord.created_at
      };
      
      return NextResponse.json(response, { status: 201 });
      
    } catch (versionError) {
      return NextResponse.json(
        { error: 'Erreur lors du calcul de version', details: versionError instanceof Error ? versionError.message : 'Unknown error' },
        { status: 422 }
      );
    }
    
  } catch (error) {
    console.error('Erreur lors de la duplication de l\'agent:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET /api/backoffice/agents/[id]/duplicate - Obtenir l'historique de duplication d'un agent
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    
    // Trouver toutes les duplications basées sur cet agent
    const duplications = agentDuplicationHistory.filter(d => d.original_id === agentId);
    
    // Trouver aussi si cet agent est lui-même une duplication
    const agent = mockAgents.find(a => a.id === agentId);
    let parentDuplication = null;
    
    if (agent?.original_agent_id) {
      parentDuplication = agentDuplicationHistory.find(d => d.new_id === agentId);
    }
    
    const response = {
      agent_id: agentId,
      is_duplicate: !!agent?.original_agent_id,
      parent_duplication: parentDuplication,
      child_duplications: duplications,
      total_duplications: duplications.length
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}