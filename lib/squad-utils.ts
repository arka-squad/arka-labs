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
    const { rows } = await sql`
      SELECT COUNT(*) as count FROM squads WHERE slug = ${slug} AND deleted_at IS NULL
    `;
    
    if (rows[0].count === 0) {
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
    const { rows } = await sql`
      SELECT status FROM squads WHERE id = ${squadId} AND deleted_at IS NULL
    `;
    
    if (rows.length === 0) {
      return { valid: false, error: 'Squad not found' };
    }
    
    const currentState = rows[0].status;
    if (!requiredStates.includes(currentState)) {
      return { 
        valid: false, 
        currentState,
        error: `Squad must be ${requiredStates.join(' or ')} (currently ${currentState})`
      };
    }
    
    return { valid: true, currentState };
  } catch (error) {
    log('error', 'squad_state_validation_failed', { route: 'squad-utils', status: 500, squadId, error: error.message });
    return { valid: false, error: 'Validation failed' };
  }
}

export async function validateProjectState(projectId: number, requiredStates: string[] = ['active']): Promise<{
  valid: boolean;
  currentState?: string;
  error?: string;
}> {
  try {
    const { rows } = await sql`
      SELECT status FROM projects WHERE id = ${projectId}
    `;
    
    if (rows.length === 0) {
      return { valid: false, error: 'Project not found' };
    }
    
    const currentState = rows[0].status;
    if (!requiredStates.includes(currentState)) {
      return { 
        valid: false, 
        currentState,
        error: `Project must be ${requiredStates.join(' or ')} (currently ${currentState})`
      };
    }
    
    return { valid: true, currentState };
  } catch (error) {
    log('error', 'project_state_validation_failed', { route: 'squad-utils', status: 500, projectId, error: error.message });
    return { valid: false, error: 'Validation failed' };
  }
}

export async function checkSquadProjectAttachment(squadId: string, projectId: number): Promise<{
  attached: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const { rows } = await sql`
      SELECT status FROM project_squads 
      WHERE squad_id = ${squadId} AND project_id = ${projectId}
    `;
    
    if (rows.length === 0) {
      return { attached: false, error: 'Squad not attached to project' };
    }
    
    const status = rows[0].status;
    return { attached: status === 'active', status };
  } catch (error) {
    log('error', 'squad_project_check_failed', { route: 'squad-utils', status: 500, squadId, projectId, error: error.message });
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
    const { rows: totals } = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COALESCE(AVG(
          EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600
        ) FILTER (WHERE completed_at IS NOT NULL), 0) as avg_completion_hours
      FROM squad_instructions 
      WHERE squad_id = ${squadId} 
        AND created_at >= NOW() - INTERVAL '${days} days'
    `;
    
    const { rows: daily } = await sql`
      SELECT 
        DATE(completed_at) as date,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM squad_instructions 
      WHERE squad_id = ${squadId}
        AND completed_at >= NOW() - INTERVAL '${days} days'
        AND status IN ('completed', 'failed')
      GROUP BY DATE(completed_at)
      ORDER BY date DESC
      LIMIT 30
    `;
    
    const total = parseInt(totals[0].total);
    const completed = parseInt(totals[0].completed);
    const failed = parseInt(totals[0].failed);
    
    return {
      instructions_total: total,
      instructions_completed: completed,
      instructions_failed: failed,
      avg_completion_time_hours: parseFloat(totals[0].avg_completion_hours) || 0,
      success_rate: total > 0 ? completed / total : 0,
      recent_activity: daily.map(row => ({
        date: row.date,
        completed: parseInt(row.completed),
        failed: parseInt(row.failed)
      }))
    };
  } catch (error) {
    log('error', 'squad_performance_calculation_failed', { route: 'squad-utils', status: 500, squadId, error: error.message });
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