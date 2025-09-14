import { log } from './logger';
import { getConfig } from './resilience';

export interface Squad {
  id: string;
  name: string;
  domain: string;
  created_by: string;
}

export interface Instruction {
  id: string;
  squad_id: string;
  project_id?: number;
  content: string;
  priority: string;
  created_by: string;
}

export interface Project {
  id: number;
  name: string;
  status: string;
  created_by: string;
}

export interface IntegrationHooks {
  onSquadCreated?: (squad: Squad) => Promise<void>;
  onInstructionCreated?: (instruction: Instruction) => Promise<void>;
  onProjectStatusChanged?: (project: Project, previousStatus: string) => Promise<void>;
  onMemberAdded?: (squadId: string, agentId: string) => Promise<void>;
}

// Hook configuration - can be enabled/disabled via environment
const hooks: IntegrationHooks = {
  onSquadCreated: getConfig().b22_memory_enabled ? captureSquadMemory : undefined,
  onInstructionCreated: getConfig().b21_routing_enabled ? queueInstruction : setFallbackProvider,
  onProjectStatusChanged: getConfig().b22_memory_enabled ? captureStatusChange : undefined,
  onMemberAdded: getConfig().b22_memory_enabled ? captureMembershipChange : undefined,
};

export async function executeHook<T>(hookName: keyof IntegrationHooks, data: T): Promise<void> {
  const hook = hooks[hookName] as ((data: T) => Promise<void>) | undefined;
  if (!hook) {
    log('debug', 'hook_not_configured', { route: 'integration', status: 200, hook: hookName });
    return;
  }
  
  try {
    await hook(data);
    log('debug', 'hook_executed', { route: 'integration', status: 200, hook: hookName });
  } catch (error) {
    log('warn', 'hook_execution_failed', { route: 'integration', status: 500, hook: hookName, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: typeof data === 'object' ? JSON.stringify(data) : String(data) });
    // Continue without blocking the main operation
  }
}

// B22 Memory Integration Hooks
async function captureSquadMemory(squad: Squad): Promise<void> {
  const memoryBlock = {
    project_id: null, // Squad-level, not project-specific
    block_type: 'governance' as const,
    content: {
      action: 'squad_created',
      squad_id: squad.id,
      squad_name: squad.name,
      domain: squad.domain,
      created_by: squad.created_by,
      timestamp: new Date().toISOString()
    },
    agent_source: 'system/admin',
    importance: 7,
    tags: ['admin', 'squad', 'governance', squad.domain.toLowerCase()]
  };
  
  await callB22MemoryAPI('/api/memory/capture', {
    memory_blocks: [memoryBlock]
  });
}

async function captureStatusChange(project: Project, previousStatus: string): Promise<void> {
  const memoryBlock = {
    project_id: project.id,
    block_type: 'governance' as const,
    content: {
      action: 'project_status_changed',
      project_id: project.id,
      project_name: project.name,
      previous_status: previousStatus,
      new_status: project.status,
      changed_by: project.created_by,
      timestamp: new Date().toISOString()
    },
    agent_source: 'system/admin',
    importance: 6,
    tags: ['admin', 'project', 'status_change']
  };
  
  await callB22MemoryAPI('/api/memory/capture', {
    memory_blocks: [memoryBlock]
  });
}

async function captureMembershipChange(squadId: string, agentId: string): Promise<void> {
  const memoryBlock = {
    project_id: null,
    block_type: 'governance' as const,
    content: {
      action: 'squad_member_added',
      squad_id: squadId,
      agent_id: agentId,
      timestamp: new Date().toISOString()
    },
    agent_source: 'system/admin',
    importance: 5,
    tags: ['admin', 'squad', 'membership']
  };
  
  await callB22MemoryAPI('/api/memory/capture', {
    memory_blocks: [memoryBlock]
  });
}

async function callB22MemoryAPI(endpoint: string, data: unknown): Promise<void> {
  const baseUrl = process.env.B22_MEMORY_BASE_URL;
  if (!baseUrl) {
    throw new Error('B22_MEMORY_BASE_URL not configured');
  }
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.B22_API_KEY || 'system-token'}`,
      'X-Trace-Id': generateTraceId()
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(5000) // 5s timeout
  });
  
  if (!response.ok) {
    throw new Error(`B22 API call failed: ${response.status} ${response.statusText}`);
  }
  
  log('debug', 'b22_memory_captured', { route: 'integration', status: 200, endpoint, response_status: response.status });
}

// B21 Routing Integration Hooks
async function queueInstruction(instruction: Instruction): Promise<void> {
  const baseUrl = process.env.B21_ROUTING_BASE_URL;
  if (!baseUrl) {
    throw new Error('B21_ROUTING_BASE_URL not configured');
  }
  
  const routingRequest = {
    instruction_id: instruction.id,
    squad_id: instruction.squad_id,
    project_id: instruction.project_id,
    content: instruction.content,
    priority: instruction.priority,
    metadata: {
      created_by: instruction.created_by,
      timestamp: new Date().toISOString()
    }
  };
  
  const response = await fetch(`${baseUrl}/api/routing/queue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.B21_API_KEY || 'system-token'}`,
      'X-Trace-Id': generateTraceId()
    },
    body: JSON.stringify(routingRequest),
    signal: AbortSignal.timeout(10000) // 10s timeout
  });
  
  if (!response.ok) {
    throw new Error(`B21 routing failed: ${response.status} ${response.statusText}`);
  }
  
  log('info', 'instruction_queued_b21', { route: 'integration', status: 200, instruction_id: instruction.id,
    response_status: response.status });
}

async function setFallbackProvider(instruction: Instruction): Promise<void> {
  const config = getConfig();
  
  log('info', 'using_fallback_provider_for_instruction', { route: 'integration', status: 200, instruction_id: instruction.id,
    fallback_provider: config.fallback_provider });
  
  // This would integrate with the fallback processing system
  // For now, we just log that fallback is being used
}

function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Health check functions for integration services
export async function checkB21Health(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const start = Date.now();
  
  try {
    const baseUrl = process.env.B21_ROUTING_BASE_URL;
    if (!baseUrl) {
      return { healthy: false, error: 'B21_ROUTING_BASE_URL not configured' };
    }
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    const latency = Date.now() - start;
    
    if (response.ok) {
      return { healthy: true, latency };
    } else {
      return { healthy: false, latency, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { 
      healthy: false, 
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function checkB22Health(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const start = Date.now();
  
  try {
    const baseUrl = process.env.B22_MEMORY_BASE_URL;
    if (!baseUrl) {
      return { healthy: false, error: 'B22_MEMORY_BASE_URL not configured' };
    }
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    const latency = Date.now() - start;
    
    if (response.ok) {
      return { healthy: true, latency };
    } else {
      return { healthy: false, latency, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { 
      healthy: false, 
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}