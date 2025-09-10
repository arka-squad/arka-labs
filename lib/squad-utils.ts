import { sql } from './db';
import { log } from './logger';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim();
}

export async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const result = await sql`
      SELECT COUNT(*) as count FROM squads WHERE slug = ${slug} AND deleted_at IS NULL
    `;
    
    if (result[0].count === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function validateSquadState(squadId: string, requiredStates: string[] = ['active']): Promise<{
  valid: boolean;
  currentState?: string;
  error?: string;
}> {
  try {
    const result = await sql`
      SELECT status FROM squads WHERE id = ${squadId} AND deleted_at IS NULL
    `;
    
    if (result.length === 0) {
      return { valid: false, error: 'Squad not found' };
    }
    
    const currentState = result[0].status;
    if (!requiredStates.includes(currentState)) {
      return { 
        valid: false, 
        currentState,
        error: `Squad must be ${requiredStates.join(' or ')} (currently ${currentState})`
      };
    }
    
    return { valid: true, currentState };
  } catch (error) {
    log('error', 'squad_state_validation_failed', { squadId, error: error.message });
    return { valid: false, error: 'Validation failed' };
  }
}

export async function validateProjectState(projectId: number, requiredStates: string[] = ['active']): Promise<{
  valid: boolean;
  currentState?: string;
  error?: string;
}> {
  try {
    const result = await sql`
      SELECT status FROM projects WHERE id = ${projectId}
    `;
    
    if (result.length === 0) {
      return { valid: false, error: 'Project not found' };
    }
    
    const currentState = result[0].status;
    if (!requiredStates.includes(currentState)) {
      return { 
        valid: false, 
        currentState,
        error: `Project must be ${requiredStates.join(' or ')} (currently ${currentState})`
      };
    }
    
    return { valid: true, currentState };
  } catch (error) {
    log('error', 'project_state_validation_failed', { projectId, error: error.message });
    return { valid: false, error: 'Validation failed' };
  }
}

export async function checkSquadProjectAttachment(squadId: string, projectId: number): Promise<{
  attached: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const result = await sql`
      SELECT status FROM project_squads 
      WHERE squad_id = ${squadId} AND project_id = ${projectId}
    `;
    
    if (result.length === 0) {
      return { attached: false, error: 'Squad not attached to project' };
    }
    
    const status = result[0].status;
    return { attached: status === 'active', status };
  } catch (error) {
    log('error', 'squad_project_check_failed', { squadId, projectId, error: error.message });
    return { attached: false, error: 'Check failed' };
  }
}

export interface SquadPerformanceMetrics {
  instructions_total: number;
  instructions_completed: number;
  instructions_failed: number;
  avg_completion_time_hours: number;
  success_rate: number;
  recent_activity: Array<{
    date: string;
    completed: number;
    failed: number;
  }>;
}

export async function getSquadPerformance(squadId: string, days: number = 30): Promise<SquadPerformanceMetrics> {
  try {
    const totals = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COALESCE(AVG(
          CASE WHEN completed_at IS NOT NULL 
          THEN (julianday(completed_at) - julianday(created_at)) * 24 
          END
        ), 0) as avg_completion_hours
      FROM squad_instructions 
      WHERE squad_id = ${squadId} 
        AND created_at >= date('now', '-${days} days')
    `;
    
    const daily = await sql`
      SELECT 
        date(completed_at) as date,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM squad_instructions 
      WHERE squad_id = ${squadId}
        AND completed_at >= date('now', '-${days} days')
        AND status IN ('completed', 'failed')
      GROUP BY date(completed_at)
      ORDER BY date DESC
      LIMIT 30
    `;
    
    const total = parseInt(totals[0]?.total || 0);
    const completed = parseInt(totals[0]?.completed || 0);
    const failed = parseInt(totals[0]?.failed || 0);
    
    return {
      instructions_total: total,
      instructions_completed: completed,
      instructions_failed: failed,
      avg_completion_time_hours: parseFloat(totals[0]?.avg_completion_hours || 0),
      success_rate: total > 0 ? completed / total : 0,
      recent_activity: daily.map(row => ({
        date: row.date,
        completed: parseInt(row.completed || 0),
        failed: parseInt(row.failed || 0)
      }))
    };
  } catch (error) {
    log('error', 'squad_performance_calculation_failed', { squadId, error: error.message });
    return {
      instructions_total: 0,
      instructions_completed: 0,
      instructions_failed: 0,
      avg_completion_time_hours: 0,
      success_rate: 0,
      recent_activity: []
    };
  }
}