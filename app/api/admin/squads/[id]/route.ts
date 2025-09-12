import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../lib/rbac-admin-b24';
import { sql } from '../../../../../lib/db';
import { log } from '../../../../../lib/logger';
import { validateSquadState, getSquadPerformance } from '../../../../../lib/squad-utils';
import { TRACE_HEADER } from '../../../../../lib/trace';
import { SquadCache } from '../../../../../lib/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas
const UpdateSquadSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  mission: z.string().max(800).optional(),
  domain: z.enum(['RH', 'Tech', 'Marketing', 'Finance', 'Ops']).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

// GET /api/admin/squads/[id] - Get squad details with members and performance
export const GET = withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const squadId = params.id;
  
  try {
    // Check cache first
    const cached = await SquadCache.getDetail(squadId);
    if (cached) {
      const res = NextResponse.json(cached);
      log('info', 'squad_detail_cached', {
        route: `/api/admin/squads/${squadId}`,
        method: 'GET',
        status: res.status,
        duration_ms: Date.now() - start,
        trace_id: traceId,
        user_id: user.id,
        squad_id: squadId,
        cache_hit: true
      });
      return res;
    }

    // Get squad details with members
    const squadRows = await sql`
      SELECT 
        s.id, s.name, s.slug, s.mission, s.domain, s.status,
        s.created_by, s.created_at, s.updated_at
      FROM squads s
      WHERE s.id = ${squadId} AND s.deleted_at IS NULL
    `;

    if (squadRows.length === 0) {
      return NextResponse.json({ error: 'squad_not_found' }, { status: 404 });
    }

    const squad = squadRows[0];

    // Get squad members with agent details
    const memberRows = await sql`
      SELECT 
        sm.agent_id, sm.role, sm.specializations, sm.status,
        sm.created_at as joined_at,
        a.name as agent_name
      FROM squad_members sm
      LEFT JOIN agents a ON sm.agent_id = a.id
      WHERE sm.squad_id = ${squadId} AND sm.status = 'active'
      ORDER BY 
        CASE sm.role WHEN 'lead' THEN 1 WHEN 'specialist' THEN 2 ELSE 3 END,
        sm.created_at
    `;

    // Get attached projects
    const projectRows = await sql`
      SELECT 
        ps.project_id, ps.status, ps.attached_at,
        p.name as project_name, p.status as project_status
      FROM project_squads ps
      JOIN projects p ON ps.project_id = p.id
      WHERE ps.squad_id = ${squadId} AND ps.status = 'active'
      ORDER BY ps.attached_at DESC
    `;

    // Get recent instructions
    const instructionRows = await sql`
      SELECT 
        si.id, si.content, si.status, si.priority,
        si.created_at, si.completed_at,
        p.name as project_name
      FROM squad_instructions si
      LEFT JOIN projects p ON si.project_id = p.id
      WHERE si.squad_id = ${squadId}
      ORDER BY si.created_at DESC
      LIMIT 10
    `;

    // Get performance metrics
    const performance = await getSquadPerformance(squadId);

    const response = {
      id: squad.id,
      slug: squad.slug,
      name: squad.name,
      mission: squad.mission,
      domain: squad.domain,
      status: squad.status,
      created_by: squad.created_by,
      created_at: squad.created_at,
      updated_at: squad.updated_at,
      
      members: memberRows.map(row => ({
        agent_id: row.agent_id,
        agent_name: row.agent_name,
        role: row.role,
        specializations: row.specializations || [],
        status: row.status,
        joined_at: row.joined_at
      })),
      
      attached_projects: projectRows.map(row => ({
        project_id: row.project_id,
        project_name: row.project_name,
        project_status: row.project_status,
        attached_at: row.attached_at
      })),
      
      recent_instructions: instructionRows.map(row => ({
        id: row.id,
        content: row.content.substring(0, 100) + (row.content.length > 100 ? '...' : ''),
        status: row.status,
        priority: row.priority,
        project_name: row.project_name,
        created_at: row.created_at,
        completed_at: row.completed_at
      })),
      
      performance: {
        instructions_completed: performance.instructions_completed,
        instructions_total: performance.instructions_total,
        avg_completion_time_hours: Math.round(performance.avg_completion_time_hours * 10) / 10,
        success_rate: Math.round(performance.success_rate * 100) / 100
      }
    };

    // Cache the response for 10 minutes (600s)
    await SquadCache.setDetail(squadId, response, 600);

    const res = NextResponse.json(response);
    
    log('info', 'squad_detail', {
      route: `/api/admin/squads/${squadId}`,
      method: 'GET',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      squad_id: squadId,
      members_count: response.members.length,
      projects_count: response.attached_projects.length
    });

    return res;
  } catch (error) {
    log('error', 'squad_detail_failed', {
      route: `/api/admin/squads/${squadId}`,
      status: 500,
      method: 'GET',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      squad_id: squadId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({ 
      error: 'internal_error' 
    }, { status: 500 });
  }
});

// PATCH /api/admin/squads/[id] - Update squad
export const PATCH = withAdminAuth(['admin', 'manager', 'operator'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const squadId = params.id;
  
  try {
    const body = await req.json();
    const updates = UpdateSquadSchema.parse(body);
    
    // Check if squad exists and get current state
    const validation = await validateSquadState(squadId, ['active', 'inactive']); // Can't update archived squads
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error 
      }, { status: validation.error === 'Squad not found' ? 404 : 400 });
    }

    // Handle status transitions
    if (updates.status) {
      const currentStatus = validation.currentState;
      
      // Validate state transitions
      const validTransitions: Record<string, string[]> = {
        'active': ['inactive', 'archived'],
        'inactive': ['active', 'archived'],
        'archived': [] // No transitions from archived
      };
      
      if (!validTransitions[currentStatus as keyof typeof validTransitions]?.includes(updates.status as string)) {
        return NextResponse.json({ 
          error: 'invalid_status_transition',
          message: `Cannot transition from ${currentStatus} to ${updates.status}`
        }, { status: 400 });
      }
      
      // Auto-detach from projects when archiving
      if (updates.status === 'archived') {
        await sql`
          UPDATE project_squads 
          SET status = 'detached', detached_at = NOW() 
          WHERE squad_id = ${squadId} AND status = 'active'
        `;
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (updates.name) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(updates.name);
    }
    
    if (updates.mission !== undefined) {
      updateFields.push(`mission = $${paramIndex++}`);
      updateValues.push(updates.mission);
    }
    
    if (updates.domain) {
      updateFields.push(`domain = $${paramIndex++}`);
      updateValues.push(updates.domain);
    }
    
    if (updates.status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(updates.status);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(squadId); // For WHERE clause

    if (updateFields.length === 1) { // Only updated_at
      return NextResponse.json({ 
        error: 'no_updates_provided' 
      }, { status: 400 });
    }

    const rows = await sql`
      UPDATE squads 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING id, name, slug, mission, domain, status, created_by, created_at, updated_at
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'squad_not_found' }, { status: 404 });
    }

    const squad = rows[0];

    const response = {
      id: squad.id,
      slug: squad.slug,
      name: squad.name,
      mission: squad.mission,
      domain: squad.domain,
      status: squad.status,
      created_by: squad.created_by,
      created_at: squad.created_at,
      updated_at: squad.updated_at
    };

    // Invalidate cache since squad was updated
    await SquadCache.invalidate(squadId);

    const res = NextResponse.json(response);
    
    log('info', 'squad_updated', {
      route: `/api/admin/squads/${squadId}`,
      method: 'PATCH',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      squad_id: squadId,
      updates: Object.keys(updates)
    });

    return res;
  } catch (error) {
    log('error', 'squad_update_failed', {
      route: `/api/admin/squads/${squadId}`,
      status: 500,
      method: 'PATCH',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      squad_id: squadId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'validation_failed', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'internal_error' 
    }, { status: 500 });
  }
});

// DELETE /api/admin/squads/[id] - Soft delete squad
export const DELETE = withAdminAuth(['admin'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const squadId = params.id;
  
  try {
    // Check if squad has active attachments or instructions
    const activityCheck = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE ps.status = 'active') as active_projects,
        COUNT(*) FILTER (WHERE si.status IN ('pending', 'queued', 'processing')) as active_instructions
      FROM squads s
      LEFT JOIN project_squads ps ON s.id = ps.squad_id
      LEFT JOIN squad_instructions si ON s.id = si.squad_id
      WHERE s.id = ${squadId} AND s.deleted_at IS NULL
      GROUP BY s.id
    `;

    if (activityCheck.length === 0) {
      return NextResponse.json({ error: 'squad_not_found' }, { status: 404 });
    }

    const activity = activityCheck[0];
    if (parseInt(activity.active_projects) > 0 || parseInt(activity.active_instructions) > 0) {
      return NextResponse.json({ 
        error: 'squad_has_activity',
        message: 'Cannot delete squad with active project attachments or pending instructions'
      }, { status: 409 });
    }

    // Soft delete squad
    const rows = await sql`
      UPDATE squads 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${squadId} AND deleted_at IS NULL
      RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'squad_not_found' }, { status: 404 });
    }

    const res = NextResponse.json({}, { status: 204 });
    
    log('info', 'squad_deleted', {
      route: `/api/admin/squads/${squadId}`,
      method: 'DELETE',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      squad_id: squadId
    });

    return res;
  } catch (error) {
    log('error', 'squad_deletion_failed', {
      route: `/api/admin/squads/${squadId}`,
      method: 'DELETE',
      status: 500,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      squad_id: squadId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({ 
      error: 'internal_error' 
    }, { status: 500 });
  }
});