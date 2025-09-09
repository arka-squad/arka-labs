import { NextRequest, NextResponse } from 'next/server';

// Types pour les agents
interface CreateAgentRequest {
  name: string;
  role: string;
  domaine?: string;
  version?: string;
  description?: string;
  tags?: string[];
  prompt_system?: string;
  temperature?: number;
  max_tokens?: number;
  is_template?: boolean;
  original_agent_id?: string;
}

interface AgentResponse {
  id: string;
  name: string;
  role: string;
  domaine: string;
  version: string;
  description: string;
  tags: string[];
  is_template: boolean;
  original_agent_id?: string;
  projets_actifs: number;
  projets_total: number;
  performance_score: number;
  created_at: string;
  updated_at: string;
}

interface ListAgentsResponse {
  items: AgentResponse[];
  page: number;
  limit: number;
  total: number;
  filters_applied: any;
}

// Mock data agents
let mockAgents = [
  {
    id: 'agent-heloise-rh-001',
    name: 'Héloïse RH',
    role: 'Assistant RH',
    domaine: 'RH',
    version: '1.0',
    description: 'Agent spécialisé en gestion des ressources humaines, recrutement et formation',
    tags: ['recrutement', 'formation', 'onboarding', 'entretiens'],
    prompt_system: 'Tu es Héloïse, une experte en ressources humaines bienveillante et professionnelle...',
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
    prompt_system: 'Tu es un développeur senior expérimenté, expert en architecture logicielle...',
    temperature: 0.5,
    max_tokens: 3000,
    is_template: true,
    original_agent_id: null,
    status: 'active',
    created_by: 'admin@arka.com',
    created_at: '2025-08-10T14:30:00Z',
    updated_at: '2025-09-01T10:15:00Z'
  },
  {
    id: 'agent-marketing-digital-001',
    name: 'Expert Marketing Digital',
    role: 'Consultant Marketing',
    domaine: 'Marketing',
    version: '1.3',
    description: 'Agent spécialisé en marketing digital, SEO, réseaux sociaux et stratégie de contenu',
    tags: ['seo', 'social-media', 'content-marketing', 'analytics', 'campaigns'],
    prompt_system: 'Tu es un expert en marketing digital avec une approche data-driven...',
    temperature: 0.8,
    max_tokens: 2500,
    is_template: false,
    original_agent_id: 'agent-marketing-base-001',
    status: 'active',
    created_by: 'manager@arka.com',
    created_at: '2025-08-20T16:45:00Z',
    updated_at: '2025-09-05T11:20:00Z'
  },
  {
    id: 'agent-consultant-finance-001',
    name: 'Consultant Finance',
    role: 'Analyste Financier',
    domaine: 'Finance',
    version: '1.0',
    description: 'Agent expert en analyse financière, budgets et stratégie économique',
    tags: ['budget', 'analyse-financiere', 'kpi', 'reporting', 'strategie'],
    prompt_system: 'Tu es un consultant en finance d\'entreprise rigoureux et analytique...',
    temperature: 0.3,
    max_tokens: 2048,
    is_template: true,
    original_agent_id: null,
    status: 'active',
    created_by: 'admin@arka.com',
    created_at: '2025-08-25T08:15:00Z',
    updated_at: '2025-08-25T08:15:00Z'
  },
  {
    id: 'agent-ops-devops-001',
    name: 'DevOps Expert',
    role: 'Ingénieur DevOps',
    domaine: 'Tech',
    version: '1.5',
    description: 'Agent spécialisé en infrastructure cloud, CI/CD et automatisation',
    tags: ['cloud', 'ci-cd', 'kubernetes', 'monitoring', 'automation'],
    prompt_system: 'Tu es un ingénieur DevOps expert en infrastructure cloud et automatisation...',
    temperature: 0.4,
    max_tokens: 2500,
    is_template: false,
    original_agent_id: 'agent-tech-senior-001',
    status: 'active',
    created_by: 'admin@arka.com',
    created_at: '2025-09-01T12:00:00Z',
    updated_at: '2025-09-03T14:30:00Z'
  }
];

// Mock data des assignations d'agents à des projets pour calculer les stats
const mockAgentProjetAssignments = [
  { agent_id: 'agent-heloise-rh-001', projet_id: 1, statut: 'actif' },
  { agent_id: 'agent-heloise-rh-001', projet_id: 6, statut: 'archive' },
  { agent_id: 'agent-tech-senior-001', projet_id: 2, statut: 'actif' },
  { agent_id: 'agent-tech-senior-001', projet_id: 7, statut: 'archive' },
  { agent_id: 'agent-tech-senior-001', projet_id: 8, statut: 'archive' },
  { agent_id: 'agent-marketing-digital-001', projet_id: 1, statut: 'actif' },
  { agent_id: 'agent-marketing-digital-001', projet_id: 3, statut: 'inactif' },
  { agent_id: 'agent-consultant-finance-001', projet_id: 4, statut: 'actif' },
  { agent_id: 'agent-ops-devops-001', projet_id: 2, statut: 'actif' }
];

// Fonction pour calculer les statistiques d'un agent
function calculateAgentStats(agentId: string) {
  const assignments = mockAgentProjetAssignments.filter(a => a.agent_id === agentId);
  const projetsActifs = assignments.filter(a => a.statut === 'actif').length;
  const projetsTotal = assignments.length;
  
  // Calcul simplifié du score de performance (basé sur nombre de projets et version)
  const agent = mockAgents.find(a => a.id === agentId);
  const versionScore = agent ? parseFloat(agent.version) * 20 : 0;
  const activityScore = Math.min(projetsActifs * 15, 60);
  const experienceScore = Math.min(projetsTotal * 8, 40);
  const performanceScore = Math.min(versionScore + activityScore + experienceScore, 100);
  
  return {
    projets_actifs: projetsActifs,
    projets_total: projetsTotal,
    performance_score: Math.round(performanceScore)
  };
}

// Fonction pour enrichir un agent avec ses stats
function enrichAgent(agent: any): AgentResponse {
  const stats = calculateAgentStats(agent.id);
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    domaine: agent.domaine,
    version: agent.version,
    description: agent.description,
    tags: agent.tags,
    is_template: agent.is_template,
    original_agent_id: agent.original_agent_id,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
    ...stats
  };
}

// Validation pour création/modification agent
function validateAgent(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.length < 2) {
    errors.push('Le nom de l\'agent doit faire au moins 2 caractères');
  }
  
  if (!data.role || data.role.length < 3) {
    errors.push('Le rôle doit être spécifié (au moins 3 caractères)');
  }
  
  if (data.temperature && (data.temperature < 0 || data.temperature > 2.0)) {
    errors.push('La température doit être entre 0.0 et 2.0');
  }
  
  if (data.max_tokens && (data.max_tokens < 100 || data.max_tokens > 8000)) {
    errors.push('Max tokens doit être entre 100 et 8000');
  }
  
  if (data.prompt_system && data.prompt_system.length > 5000) {
    errors.push('Le prompt système ne peut pas dépasser 5000 caractères');
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('La description ne peut pas dépasser 1000 caractères');
  }
  
  return { valid: errors.length === 0, errors };
}

// GET /api/backoffice/agents - Liste des agents avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const domaine = searchParams.get('domaine');
    const is_template = searchParams.get('is_template');
    const min_performance = searchParams.get('min_performance');
    
    // Validation pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Paramètres de pagination invalides' },
        { status: 400 }
      );
    }
    
    // Filtrage
    let filteredAgents = [...mockAgents].filter(a => a.status === 'active');
    
    if (domaine) {
      filteredAgents = filteredAgents.filter(a => a.domaine === domaine);
    }
    
    if (is_template !== null) {
      const templateFilter = is_template === 'true';
      filteredAgents = filteredAgents.filter(a => a.is_template === templateFilter);
    }
    
    // Enrichissement avec stats pour le filtre de performance
    let enrichedFiltered = filteredAgents.map(enrichAgent);
    
    if (min_performance) {
      const minPerf = parseInt(min_performance);
      if (!isNaN(minPerf)) {
        enrichedFiltered = enrichedFiltered.filter(a => a.performance_score >= minPerf);
      }
    }
    
    // Pagination sur les données enrichies
    const total = enrichedFiltered.length;
    const startIndex = (page - 1) * limit;
    const paginatedAgents = enrichedFiltered.slice(startIndex, startIndex + limit);
    
    const response: ListAgentsResponse = {
      items: paginatedAgents,
      page,
      limit,
      total,
      filters_applied: { domaine, is_template, min_performance }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/backoffice/agents - Création d'un nouvel agent
export async function POST(request: NextRequest) {
  try {
    const data: CreateAgentRequest = await request.json();
    
    // Validation des données
    const validation = validateAgent(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Vérifier l'unicité du nom pour les templates
    if (data.is_template) {
      const existingAgent = mockAgents.find(a => 
        a.name.toLowerCase() === data.name.toLowerCase() && 
        a.is_template && 
        a.status === 'active'
      );
      
      if (existingAgent) {
        return NextResponse.json(
          { error: 'Un agent template avec ce nom existe déjà' },
          { status: 409 }
        );
      }
    }
    
    // Créer le nouvel agent
    const newAgent = {
      id: `agent-${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-6)}`,
      name: data.name,
      role: data.role,
      domaine: data.domaine || 'General',
      version: data.version || '1.0',
      description: data.description || '',
      tags: data.tags || [],
      prompt_system: data.prompt_system || `Tu es ${data.name}, ${data.role}.`,
      temperature: data.temperature || 0.7,
      max_tokens: data.max_tokens || 2048,
      is_template: data.is_template || false,
      original_agent_id: data.original_agent_id || null,
      status: 'active',
      created_by: 'current_user@arka.com', // TODO: récupérer depuis JWT
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockAgents.push(newAgent);
    
    // Enrichir et retourner l'agent créé
    const enrichedAgent = enrichAgent(newAgent);
    
    return NextResponse.json(enrichedAgent, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}