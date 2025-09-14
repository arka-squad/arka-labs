import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../lib/rbac-admin-b24';
import { sql, getDb } from '../../../../../lib/db';
import { log } from '../../../../../lib/logger';
import { TRACE_HEADER } from '../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for project updates
const UpdateProjectSchema = z.object({
  name: z.string().min(3).max(200).optional(), // schéma DB réel
  description: z.string().max(2000).optional(),
  budget: z.number().min(0).optional(),
  deadline: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional()
});

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/admin/projects/[id] - Get project details with assignments
export const GET = withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const projectId = params.id;

  // Validate UUID format
  if (!UUID_REGEX.test(projectId)) {
    return NextResponse.json(
      {
        error: 'Invalid project ID format',
        code: 'INVALID_UUID',
        trace_id: traceId
      },
      { status: 400 }
    );
  }
  
  try {
    // VRAIE REQUÊTE avec corrections UUID + colonnes
    const [projectDetails] = await sql`
      SELECT
        p.*,
        c.nom as client_name,
        c.secteur as client_secteur,
        c.taille as client_taille,
        c.contact_principal as client_contact,
        COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_assigned,
        COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_assigned,
        -- Timeline analysis
        CASE
          WHEN p.deadline IS NULL THEN 'no_deadline'
          WHEN p.deadline < CURRENT_DATE THEN 'overdue'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '3 days' THEN 'critical'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
          ELSE 'ok'
        END as deadline_status,
        CASE
          WHEN p.created_at IS NOT NULL AND p.deadline IS NOT NULL THEN
            (DATE(p.deadline) - DATE(p.created_at))
          ELSE NULL
        END as total_duration_days,
        CASE
          WHEN p.deadline IS NOT NULL THEN
            (DATE(p.deadline) - CURRENT_DATE)
          ELSE NULL
        END as days_remaining
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_assignments pa ON p.id = pa.project_id
      LEFT JOIN project_squads ps ON p.id = ps.project_id
      WHERE p.id = ${projectId}::uuid AND p.deleted_at IS NULL
      GROUP BY p.id, c.nom, c.secteur, c.taille, c.contact_principal
    `;

    if (!projectDetails) {
      return NextResponse.json(
        {
          error: 'Projet introuvable',
          code: 'PROJECT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Get assigned agents (avec colonnes corrigées)
    const assignedAgents = await sql`
      SELECT
        a.id,
        a.name,
        a.role,
        a.domaine,
        a.version,
        a.status as agent_status,
        pa.status as assignment_status,
        pa.assigned_at,
        COUNT(DISTINCT other_pa.project_id) as total_projects,
        50 as performance_score
      FROM project_assignments pa
      JOIN agents a ON pa.agent_id = a.id
      LEFT JOIN project_assignments other_pa ON a.id = other_pa.agent_id AND other_pa.status = 'active'
      WHERE pa.project_id = ${projectId}::uuid
      AND pa.status = 'active'
      AND a.deleted_at IS NULL
      GROUP BY a.id, pa.status, pa.assigned_at
      ORDER BY pa.assigned_at ASC
    `;

    // Get assigned squads (avec colonnes corrigées)
    const assignedSquads = await sql`
      SELECT
        s.id,
        s.name,
        s.slug,
        s.mission,
        s.domain,
        s.status as squad_status,
        ps.status as assignment_status,
        ps.attached_at as assigned_at,
        COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
        COUNT(DISTINCT si.id) FILTER (WHERE si.created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_instructions
      FROM project_squads ps
      JOIN squads s ON ps.squad_id = s.id
      LEFT JOIN squad_members sm ON s.id = sm.squad_id
      LEFT JOIN squad_instructions si ON s.id = si.squad_id
      WHERE ps.project_id = ${projectId}::uuid
      AND ps.status = 'active'
      AND s.deleted_at IS NULL
      GROUP BY s.id, ps.status, ps.attached_at
      ORDER BY ps.attached_at ASC
    `;

    // Get project activity (avec colonnes corrigées)
    const projectActivity = await sql`
      SELECT
        'assignment_added' as activity_type,
        CONCAT('Agent: ', a.name) as activity_subject,
        pa.assigned_at as activity_date,
        pa.assigned_by as activity_user
      FROM project_assignments pa
      JOIN agents a ON pa.agent_id = a.id
      WHERE pa.project_id = ${projectId}::uuid

      UNION ALL

      SELECT
        'squad_assigned' as activity_type,
        CONCAT('Squad: ', s.name) as activity_subject,
        ps.attached_at as activity_date,
        ps.attached_by as activity_user
      FROM project_squads ps
      JOIN squads s ON ps.squad_id = s.id
      WHERE ps.project_id = ${projectId}::uuid

      UNION ALL

      SELECT
        'instruction_sent' as activity_type,
        LEFT(si.content, 100) as activity_subject,
        si.created_at as activity_date,
        si.created_by as activity_user
      FROM squad_instructions si
      JOIN project_squads ps ON si.squad_id = ps.squad_id
      WHERE ps.project_id = ${projectId}::uuid
      AND si.created_at >= CURRENT_DATE - INTERVAL '30 days'

      ORDER BY activity_date DESC
      LIMIT 20
    `;

    const formattedProject = {
      ...projectDetails,
      name: projectDetails.name, // schéma DB réel
      tags: JSON.parse(projectDetails.tags || '[]'),
      requirements: JSON.parse(projectDetails.requirements || '[]'),
      agents_assigned: parseInt(projectDetails.agents_assigned),
      squads_assigned: parseInt(projectDetails.squads_assigned),
      total_duration_days: projectDetails.total_duration_days ? parseInt(projectDetails.total_duration_days) : null,
      days_remaining: projectDetails.days_remaining ? parseInt(projectDetails.days_remaining) : null,
      assigned_agents: assignedAgents.map(agent => ({
        ...agent,
        total_projects: parseInt(agent.total_projects),
        performance_score: parseInt(agent.performance_score)
      })),
      assigned_squads: assignedSquads.map(squad => ({
        ...squad,
        members_count: parseInt(squad.members_count),
        recent_instructions: parseInt(squad.recent_instructions)
      })),
      recent_activity: projectActivity
    };

    const response = NextResponse.json(formattedProject);

    log('info', 'project_detail_success', {
      route: '/api/admin/projects/[id]',
      method: 'GET',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId,
      agents_count: formattedProject.agents_assigned,
      squads_count: formattedProject.squads_assigned
    });

    return response;

  } catch (error) {
    log('error', 'project_detail_error', {
      route: '/api/admin/projects/[id]',
      method: 'GET',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId
    });

    return NextResponse.json(
      { 
        error: 'Failed to get project details',
        code: 'PROJECT_DETAIL_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// PATCH /api/admin/projects/[id] - Update project
export const PATCH = withAdminAuth(['admin', 'manager'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const projectId = params.id;

  // Validate UUID format
  if (!UUID_REGEX.test(projectId)) {
    return NextResponse.json(
      {
        error: 'Invalid project ID format',
        code: 'INVALID_UUID',
        trace_id: traceId
      },
      { status: 400 }
    );
  }
  
  try {
    const body = await req.json();
    const updates = UpdateProjectSchema.parse(body);

    // Check if project exists
    const [existingProject] = await sql`
      SELECT id, name, client_id FROM projects 
      WHERE id = ${projectId}::uuid AND deleted_at IS NULL
    `;

    if (!existingProject) {
      return NextResponse.json(
        { 
          error: 'Projet introuvable',
          code: 'PROJECT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Check for name conflicts if name is being updated
    if (updates.name && updates.name !== existingProject.name) {
      const [conflictingProject] = await sql`
        SELECT id FROM projects
        WHERE LOWER(name) = LOWER(${updates.name}) 
        AND client_id = ${existingProject.client_id}
        AND id != ${projectId}::uuid
        AND deleted_at IS NULL
      `;

      if (conflictingProject) {
        return NextResponse.json(
          { 
            error: 'Un projet avec ce nom existe déjà pour ce client',
            code: 'PROJECT_NAME_CONFLICT',
            trace_id: traceId
          },
          { status: 409 }
        );
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        // Map frontend field names to database column names
        const dbColumn = key === 'nom' ? 'name' : key;

        if (key === 'deadline') {
          updateFields.push(`${dbColumn} = $${paramIndex}`);
          updateValues.push(value ? new Date(value as string) : null);
        } else if (key === 'tags' || key === 'requirements') {
          updateFields.push(`${dbColumn} = $${paramIndex}`);
          updateValues.push(JSON.stringify(value));
        } else {
          updateFields.push(`${dbColumn} = $${paramIndex}`);
          updateValues.push(value);
        }
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucune donnée à mettre à jour',
          code: 'NO_UPDATE_DATA',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    
    const updateQuery = `
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const updatedResult = (await getDb().query(updateQuery, [...updateValues, projectId])).rows;
    const [updatedProject] = updatedResult;

    // Get updated metrics
    const [projectMetrics] = await sql`
      SELECT 
        COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_assigned,
        COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_assigned
      FROM projects p
      LEFT JOIN project_assignments pa ON p.id = pa.project_id
      LEFT JOIN project_squads ps ON p.id = ps.project_id
      WHERE p.id = ${projectId}::uuid
      GROUP BY p.id
    `;

    const response = NextResponse.json({
      ...updatedProject,
      name: updatedProject.name, // schéma DB réel
      tags: JSON.parse(updatedProject.tags || '[]'),
      requirements: JSON.parse(updatedProject.requirements || '[]'),
      agents_assigned: parseInt(projectMetrics?.agents_assigned || '0'),
      squads_assigned: parseInt(projectMetrics?.squads_assigned || '0')
    });

    log('info', 'project_update_success', {
      route: '/api/admin/projects/[id]',
      method: 'PATCH',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId,
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

    log('error', 'project_update_error', {
      route: '/api/admin/projects/[id]',
      method: 'PATCH',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId
    });

    return NextResponse.json(
      { 
        error: 'Failed to update project',
        code: 'PROJECT_UPDATE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/projects/[id] - Delete project (soft delete)
export const DELETE = withAdminAuth(['admin'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const projectId = params.id;

  // Validate UUID format
  if (!UUID_REGEX.test(projectId)) {
    return NextResponse.json(
      {
        error: 'Invalid project ID format',
        code: 'INVALID_UUID',
        trace_id: traceId
      },
      { status: 400 }
    );
  }
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === 'true';
  
  try {
    // Check if project exists
    const [existingProject] = await sql`
      SELECT id, name, status FROM projects 
      WHERE id = ${projectId}::uuid AND deleted_at IS NULL
    `;

    if (!existingProject) {
      return NextResponse.json(
        { 
          error: 'Projet introuvable',
          code: 'PROJECT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Check if project is active unless force is specified
    if (!force && existingProject.status === 'active') {
      const [activeAssignments] = await sql`
        SELECT 
          COUNT(DISTINCT pa.agent_id) as active_agents,
          COUNT(DISTINCT ps.squad_id) as active_squads
        FROM projects p
        LEFT JOIN project_assignments pa ON p.id = pa.project_id AND pa.status = 'active'
        LEFT JOIN project_squads ps ON p.id = ps.project_id AND ps.status = 'active'
        WHERE p.id = ${projectId}::uuid
        GROUP BY p.id
      `;

      const totalActive = parseInt(activeAssignments?.active_agents || '0') + parseInt(activeAssignments?.active_squads || '0');
      
      if (totalActive > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete active project with assignments',
            code: 'PROJECT_HAS_ACTIVE_ASSIGNMENTS',
            active_agents: parseInt(activeAssignments?.active_agents || '0'),
            active_squads: parseInt(activeAssignments?.active_squads || '0'),
            trace_id: traceId,
            suggestion: 'Use ?force=true to override or deactivate assignments first'
          },
          { status: 409 }
        );
      }
    }

    // Soft delete the project and deactivate assignments if force
    const [deletedProject] = await sql`
      UPDATE projects 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${projectId}::uuid AND deleted_at IS NULL
      RETURNING id, name
    `;

    // Deactivate assignments when force deleting
    if (force) {
      await Promise.all([
        sql`
          UPDATE project_assignments
          SET status = 'inactive', updated_at = NOW()
          WHERE project_id = ${projectId}::uuid AND status = 'active'
        `,
        sql`
          UPDATE project_squads
          SET status = 'inactive', updated_at = NOW()
          WHERE project_id = ${projectId}::uuid AND status = 'active'
        `
      ]);
    }

    log('info', 'project_delete_success', {
      route: '/api/admin/projects/[id]',
      method: 'DELETE',
      status: 200,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId,
      project_name: deletedProject.name,
      force_used: force
    });

    return NextResponse.json({
      deleted: true,
      project_id: projectId,
      project_name: deletedProject.name,
      force_used: force
    });

  } catch (error) {
    log('error', 'project_delete_error', {
      route: '/api/admin/projects/[id]',
      method: 'DELETE',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId
    });

    return NextResponse.json(
      { 
        error: 'Failed to delete project',
        code: 'PROJECT_DELETE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});