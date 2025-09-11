import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../lib/rbac-admin';
import { sql, getDb } from '../../../../../lib/db';
import { log } from '../../../../../lib/logger';
import { TRACE_HEADER } from '../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for agent updates
const UpdateAgentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.string().min(3).max(100).optional(),
  domaine: z.enum(['RH', 'Tech', 'Marketing', 'Finance', 'Ops']).optional(),
  version: z.string().regex(/^\d+\.\d+$/).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  prompt_system: z.string().min(10).max(5000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(100).max(8000).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

// GET /api/admin/agents/[id] - Get agent details with assignments
export const GET = withAdminAuth(['agents:read'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const agentId = params.id;
  
  try {
    // Get agent with detailed assignment information
    const [agentDetails] = await sql`
      SELECT 
        a.*,
        COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active' AND p.status = 'active') as projets_actifs,
        COUNT(DISTINCT pa.project_id) as projets_total,
        COUNT(DISTINCT sm.squad_id) FILTER (WHERE sm.status = 'active') as squads_count,
        -- Performance metrics
        CASE 
          WHEN COUNT(DISTINCT pa.project_id) = 0 THEN 0
          ELSE LEAST(
            (CAST(SUBSTRING(a.version FROM '^([0-9]+)') AS INTEGER) * 20) +
            (COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active') * 15) +
            (COUNT(DISTINCT pa.project_id) * 8),
            100
          )
        END as performance_score,
        -- Original agent info
        orig.name as original_agent_name,
        orig.version as original_agent_version
      FROM agents a
      LEFT JOIN project_assignments pa ON a.id = pa.agent_id
      LEFT JOIN projects p ON pa.project_id = p.id AND p.deleted_at IS NULL
      LEFT JOIN squad_members sm ON a.id = sm.agent_id
      LEFT JOIN agents orig ON a.original_agent_id = orig.id
      WHERE a.id = ${agentId} AND a.deleted_at IS NULL
      GROUP BY a.id, orig.name, orig.version
    `;

    if (!agentDetails) {
      return NextResponse.json(
        { 
          error: 'Agent introuvable',
          code: 'AGENT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Get active project assignments with project details
    const projectAssignments = await sql`
      SELECT 
        p.id,
        p.nom,
        p.status,
        p.priority,
        p.budget,
        p.deadline,
        pa.status as assignment_status,
        pa.created_at as assigned_at,
        c.nom as client_name,
        CASE 
          WHEN p.deadline < CURRENT_DATE THEN 'depassee'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'proche'
          ELSE 'ok'
        END as deadline_status
      FROM project_assignments pa
      JOIN projects p ON pa.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      WHERE pa.agent_id = ${agentId} 
      AND pa.status = 'active'
      AND p.deleted_at IS NULL
      ORDER BY pa.created_at DESC
    `;

    // Get squad memberships
    const squadMemberships = await sql`
      SELECT 
        s.id,
        s.name,
        s.slug,
        s.domain,
        sm.status as membership_status,
        sm.created_at as joined_at
      FROM squad_members sm
      JOIN squads s ON sm.squad_id = s.id
      WHERE sm.agent_id = ${agentId}
      AND sm.status = 'active'
      AND s.deleted_at IS NULL
      ORDER BY sm.created_at DESC
    `;

    // Get recent activity/instructions
    const recentActivity = await sql`
      SELECT 
        'instruction' as activity_type,
        si.instruction as activity_subject,
        si.created_at as activity_date,
        si.status as activity_status,
        s.name as squad_name
      FROM squad_instructions si
      JOIN squads s ON si.squad_id = s.id
      JOIN squad_members sm ON s.id = sm.squad_id
      WHERE sm.agent_id = ${agentId}
      AND sm.status = 'active'
      AND si.created_at >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY si.created_at DESC
      LIMIT 10
    `;

    const formattedAgent = {
      ...agentDetails,
      tags: JSON.parse(agentDetails.tags || '[]'),
      projets_actifs: parseInt(agentDetails.projets_actifs),
      projets_total: parseInt(agentDetails.projets_total),
      squads_count: parseInt(agentDetails.squads_count),
      performance_score: parseInt(agentDetails.performance_score),
      project_assignments: projectAssignments,
      squad_memberships: squadMemberships,
      recent_activity: recentActivity
    };

    const response = NextResponse.json(formattedAgent);

    log('info', 'agent_detail_success', {
      route: '/api/admin/agents/[id]',
      method: 'GET',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      agent_id: agentId,
      projects_assigned: formattedAgent.projets_actifs
    });

    return response;

  } catch (error) {
    log('error', 'agent_detail_error', {
      route: '/api/admin/agents/[id]',
      status: 500,
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      agent_id: agentId
    });

    return NextResponse.json(
      { 
        error: 'Failed to get agent details',
        code: 'AGENT_DETAIL_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// PATCH /api/admin/agents/[id] - Update agent
export const PATCH = withAdminAuth(['agents:write'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const agentId = params.id;
  
  try {
    const body = await req.json();
    const updates = UpdateAgentSchema.parse(body);

    // Check if agent exists
    const [existingAgent] = await sql`
      SELECT id, name, version FROM agents 
      WHERE id = ${agentId} AND deleted_at IS NULL
    `;

    if (!existingAgent) {
      return NextResponse.json(
        { 
          error: 'Agent introuvable',
          code: 'AGENT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Check for name conflicts if name is being updated
    if (updates.name && updates.name !== existingAgent.name) {
      const [conflictingAgent] = await sql`
        SELECT id FROM agents 
        WHERE LOWER(name) = LOWER(${updates.name}) 
        AND id != ${agentId}
        AND deleted_at IS NULL
      `;

      if (conflictingAgent) {
        return NextResponse.json(
          { 
            error: 'Un agent avec ce nom existe déjà',
            code: 'AGENT_NAME_CONFLICT',
            trace_id: traceId
          },
          { status: 409 }
        );
      }
    }

    // Build update clauses conditionally
    const updateParts = [];
    const updateValues = [];
    let paramIndex = 1;
    
    if (updates.name !== undefined) {
      updateParts.push(`name = $${paramIndex++}`);
      updateValues.push(updates.name);
    }
    if (updates.role !== undefined) {
      updateParts.push(`role = $${paramIndex++}`);
      updateValues.push(updates.role);
    }
    if (updates.domaine !== undefined) {
      updateParts.push(`domaine = $${paramIndex++}`);
      updateValues.push(updates.domaine);
    }
    if (updates.version !== undefined) {
      updateParts.push(`version = $${paramIndex++}`);
      updateValues.push(updates.version);
    }
    if (updates.status !== undefined) {
      updateParts.push(`status = $${paramIndex++}`);
      updateValues.push(updates.status);
    }
    if (updates.tags !== undefined) {
      updateParts.push(`tags = $${paramIndex++}`);
      updateValues.push(JSON.stringify(updates.tags));
    }
    if (updates.description !== undefined) {
      updateParts.push(`description = $${paramIndex++}`);
      updateValues.push(updates.description);
    }
    if (updates.prompt_system !== undefined) {
      updateParts.push(`prompt_system = $${paramIndex++}`);
      updateValues.push(updates.prompt_system);
    }
    if (updates.temperature !== undefined) {
      updateParts.push(`temperature = $${paramIndex++}`);
      updateValues.push(updates.temperature);
    }
    if (updates.max_tokens !== undefined) {
      updateParts.push(`max_tokens = $${paramIndex++}`);
      updateValues.push(updates.max_tokens);
    }

    if (updateParts.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucune donnée à mettre à jour',
          code: 'NO_UPDATE_DATA',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    updateParts.push(`updated_at = NOW()`);
    updateValues.push(agentId);
    
    const updateQuery = `
      UPDATE agents 
      SET ${updateParts.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;
    
    // Use direct db.query for dynamically built query with positional params
    const updatedResult = (await getDb().query(updateQuery, updateValues)).rows;
    const [updatedAgent] = updatedResult;

    // Get updated performance metrics
    const [performanceData] = await sql`
      SELECT 
        COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active' AND p.status = 'active') as projets_actifs,
        COUNT(DISTINCT pa.project_id) as projets_total,
        CASE 
          WHEN COUNT(DISTINCT pa.project_id) = 0 THEN 0
          ELSE LEAST(
            (CAST(SUBSTRING(${updatedAgent.version} FROM '^([0-9]+)') AS INTEGER) * 20) +
            (COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active') * 15) +
            (COUNT(DISTINCT pa.project_id) * 8),
            100
          )
        END as performance_score
      FROM project_assignments pa
      LEFT JOIN projects p ON pa.project_id = p.id AND p.deleted_at IS NULL
      WHERE pa.agent_id = ${agentId}
    `;

    const response = NextResponse.json({
      ...updatedAgent,
      tags: JSON.parse(updatedAgent.tags || '[]'),
      projets_actifs: parseInt(performanceData?.projets_actifs || '0'),
      projets_total: parseInt(performanceData?.projets_total || '0'),
      performance_score: parseInt(performanceData?.performance_score || '0')
    });

    log('info', 'agent_update_success', {
      route: '/api/admin/agents/[id]',
      method: 'PATCH',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      agent_id: agentId,
      updated_fields: Object.keys(updates)
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: error.errors,
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    log('error', 'agent_update_error', {
      route: '/api/admin/agents/[id]',
      method: 'PATCH',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      agent_id: agentId
    });

    return NextResponse.json(
      { 
        error: 'Failed to update agent',
        code: 'AGENT_UPDATE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/agents/[id] - Delete agent (soft delete)
export const DELETE = withAdminAuth(['agents:delete'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const agentId = params.id;
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === 'true';
  
  try {
    // Check if agent exists
    const [existingAgent] = await sql`
      SELECT id, name FROM agents 
      WHERE id = ${agentId} AND deleted_at IS NULL
    `;

    if (!existingAgent) {
      return NextResponse.json(
        { 
          error: 'Agent introuvable',
          code: 'AGENT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Check for active assignments unless force is specified
    if (!force) {
      const [activeAssignmentsCount] = await sql`
        SELECT COUNT(*) as count
        FROM project_assignments pa
        JOIN projects p ON pa.project_id = p.id
        WHERE pa.agent_id = ${agentId} 
        AND pa.status = 'active'
        AND p.status = 'active'
        AND p.deleted_at IS NULL
      `;

      if (parseInt(activeAssignmentsCount.count) > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete agent with active project assignments',
            code: 'AGENT_HAS_ACTIVE_ASSIGNMENTS',
            active_assignments: parseInt(activeAssignmentsCount.count),
            trace_id: traceId,
            suggestion: 'Use ?force=true to override or reassign projects first'
          },
          { status: 409 }
        );
      }
    }

    // Soft delete the agent and deactivate assignments
    const [deletedAgent] = await sql`
      UPDATE agents 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${agentId} AND deleted_at IS NULL
      RETURNING id, name
    `;

    // Deactivate all assignments when force deleting
    if (force) {
      await sql`
        UPDATE project_assignments
        SET status = 'inactive', updated_at = NOW()
        WHERE agent_id = ${agentId} AND status = 'active'
      `;

      await sql`
        UPDATE squad_members
        SET status = 'inactive', updated_at = NOW()
        WHERE agent_id = ${agentId} AND status = 'active'
      `;
    }

    log('info', 'agent_delete_success', {
      route: '/api/admin/agents/[id]',
      method: 'DELETE',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      agent_id: agentId,
      agent_name: deletedAgent.name,
      force_used: force
    });

    return NextResponse.json({
      deleted: true,
      agent_id: agentId,
      agent_name: deletedAgent.name,
      force_used: force
    });

  } catch (error) {
    log('error', 'agent_delete_error', {
      route: '/api/admin/agents/[id]',
      method: 'DELETE',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      agent_id: agentId
    });

    return NextResponse.json(
      { 
        error: 'Failed to delete agent',
        code: 'AGENT_DELETE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});
