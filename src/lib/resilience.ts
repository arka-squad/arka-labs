import { log } from './logger';
import { sql } from './db';

export interface ResilienceConfig {
  b21_routing_enabled: boolean;
  b22_memory_enabled: boolean;
  fallback_provider: 'claude' | 'gpt' | 'gemini';
  queue_retry_attempts: number;
  graceful_degradation: boolean;
  circuit_breaker_threshold: number;
  circuit_breaker_timeout_ms: number;
}

// Default configuration - can be overridden via environment variables
const defaultConfig: ResilienceConfig = {
  b21_routing_enabled: process.env.B21_ROUTING_ENABLED === 'true',
  b22_memory_enabled: process.env.B22_MEMORY_ENABLED === 'true', 
  fallback_provider: (process.env.FALLBACK_PROVIDER as any) || 'claude',
  queue_retry_attempts: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || '3'),
  graceful_degradation: process.env.GRACEFUL_DEGRADATION !== 'false',
  circuit_breaker_threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
  circuit_breaker_timeout_ms: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || '30000')
};

// Circuit breaker state tracking
const circuitBreakerState = new Map<string, {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}>();

export function getConfig(): ResilienceConfig {
  return defaultConfig;
}

export async function withResilience<T>(
  operation: () => Promise<T>,
  serviceName: string,
  fallback?: () => Promise<T>
): Promise<T> {
  const config = getConfig();
  
  // Check circuit breaker
  if (!canExecute(serviceName, config)) {
    if (fallback && config.graceful_degradation) {
      log('warn', 'circuit_breaker_open_using_fallback', { route: 'lib', status: 500, service: serviceName });
      return await fallback();
    }
    throw new Error(`Circuit breaker open for service: ${serviceName}`);
  }
  
  try {
    const result = await operation();
    recordSuccess(serviceName);
    return result;
  } catch (error) {
    recordFailure(serviceName, config);
    
    if (fallback && config.graceful_degradation) {
      log('warn', 'operation_failed_using_fallback', { route: 'lib', status: 500, service: serviceName, 
        error: error instanceof Error ? error.message : 'Unknown error' });
      return await fallback();
    }
    
    throw error;
  }
}

function canExecute(serviceName: string, config: ResilienceConfig): boolean {
  const state = circuitBreakerState.get(serviceName);
  
  if (!state || state.state === 'closed') {
    return true;
  }
  
  if (state.state === 'open') {
    const timeoutPassed = Date.now() - state.lastFailureTime > config.circuit_breaker_timeout_ms;
    if (timeoutPassed) {
      // Transition to half-open
      circuitBreakerState.set(serviceName, {
        ...state,
        state: 'half-open'
      });
      return true;
    }
    return false;
  }
  
  // half-open state - allow single request to test
  return true;
}

function recordSuccess(serviceName: string) {
  circuitBreakerState.set(serviceName, {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed'
  });
}

function recordFailure(serviceName: string, config: ResilienceConfig) {
  const state = circuitBreakerState.get(serviceName) || {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed' as const
  };
  
  const newFailures = state.failures + 1;
  const newState = newFailures >= config.circuit_breaker_threshold ? 'open' : 'closed';
  
  circuitBreakerState.set(serviceName, {
    failures: newFailures,
    lastFailureTime: Date.now(),
    state: newState
  });
  
  if (newState === 'open') {
    log('warn', 'circuit_breaker_opened', { route: 'lib', status: 500, service: serviceName, 
      failures: newFailures,
      threshold: config.circuit_breaker_threshold });
  }
}

// Queue management with retry logic
export async function processInstructionQueue() {
  const config = getConfig();
  
  try {
    const instructions = await sql`
      SELECT id, squad_id, project_id, content, priority, 
             metadata, created_at, created_by
      FROM squad_instructions 
      WHERE status = 'queued'
      ORDER BY 
        CASE priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'normal' THEN 3 
          ELSE 4 
        END,
        created_at
      LIMIT 10
    `;
    
    for (const instruction of instructions) {
      await processInstruction(instruction, config);
    }
  } catch (error) {
    log('error', 'queue_processing_failed', { route: 'resilience', status: 500, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function processInstruction(instruction: any, config: ResilienceConfig) {
  const instructionId = instruction.id;
  
  try {
    // Update status to processing
    await sql`
      UPDATE squad_instructions 
      SET status = 'processing'
      WHERE id = ${instructionId}
    `;
    
    // Try B21 routing with resilience
    await withResilience(
      () => routeToProvider(instruction),
      'b21-routing',
      () => routeToFallbackProvider(instruction, config.fallback_provider)
    );
    
    // Mark as completed
    await sql`
      UPDATE squad_instructions 
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${instructionId}
    `;
    
    log('info', 'instruction_completed', { route: 'lib', status: 200, instruction_id: instructionId });
    
  } catch (error) {
    await handleInstructionFailure(instruction, error instanceof Error ? error : new Error('Unknown error'), config);
  }
}

async function routeToProvider(instruction: any): Promise<void> {
  // This would integrate with actual B21 routing system
  if (!getConfig().b21_routing_enabled) {
    throw new Error('B21 routing not enabled');
  }
  
  // Simulate routing call
  const response = await fetch(`${process.env.B21_ROUTING_URL}/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.B21_API_KEY}`
    },
    body: JSON.stringify({
      instruction_id: instruction.id,
      content: instruction.content,
      priority: instruction.priority,
      squad_id: instruction.squad_id,
      project_id: instruction.project_id
    })
  });
  
  if (!response.ok) {
    throw new Error(`B21 routing failed: ${response.status} ${response.statusText}`);
  }
}

async function routeToFallbackProvider(instruction: any, provider: string): Promise<void> {
  log('info', 'using_fallback_provider', { route: 'lib', status: 200, instruction_id: instruction.id, 
    provider });
  
  // Update metadata to indicate fallback was used
  await sql`
    UPDATE squad_instructions 
    SET metadata = metadata || ${JSON.stringify({ 
      fallback_used: true,
      fallback_provider: provider,
      fallback_timestamp: new Date().toISOString()
    })}
    WHERE id = ${instruction.id}
  `;
  
  // Simulate processing with fallback provider
  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function handleInstructionFailure(instruction: any, error: Error, config: ResilienceConfig) {
  const instructionId = instruction.id;
  const metadata = instruction.metadata || {};
  const retryAttempts = metadata.retry_attempts || 0;
  
  if (retryAttempts < config.queue_retry_attempts) {
    // Schedule retry
    await sql`
      UPDATE squad_instructions 
      SET status = 'queued',
          metadata = metadata || ${JSON.stringify({ 
            retry_attempts: retryAttempts + 1,
            last_error: error instanceof Error ? error.message : 'Unknown error',
            retry_scheduled_at: new Date().toISOString()
          })}
      WHERE id = ${instructionId}
    `;
    
    log('info', 'instruction_scheduled_retry', { route: 'lib', status: 200, instruction_id: instructionId,
      attempt: retryAttempts + 1,
      max_attempts: config.queue_retry_attempts });
  } else {
    // Mark as failed
    await sql`
      UPDATE squad_instructions 
      SET status = 'failed',
          metadata = metadata || ${JSON.stringify({ 
            final_error: error instanceof Error ? error.message : 'Unknown error',
            failed_at: new Date().toISOString()
          })}
      WHERE id = ${instructionId}
    `;
    
    log('error', 'instruction_failed_permanently', { 
      route: 'resilience',
      status: 500,
      instruction_id: instructionId,
      error: error instanceof Error ? error.message : 'Unknown error',
      attempts: retryAttempts + 1
    });
    
    // TODO: Notify admins of permanent failure
    await notifyAdminOfFailure(instruction, error);
  }
}

async function notifyAdminOfFailure(instruction: any, error: Error) {
  // This would integrate with notification system
  log('warn', 'admin_notification_sent', { route: 'lib', status: 500, instruction_id: instruction.id,
    squad_id: instruction.squad_id,
    project_id: instruction.project_id,
    error: error instanceof Error ? error.message : 'Unknown error' });
}