import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../lib/rbac-admin';
import { sql } from '../../../../lib/db';
import { log } from '../../../../lib/logger';
import { TRACE_HEADER } from '../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas for projects management according to B23 v2.5
const CreateProjectSchema = z.object({
  nom: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  client_id: z.string().uuid(),
  budget: z.number().min(0).optional(),
  deadline: z.string().optional(), // ISO date string
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional().default('active'),
  tags: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([])
});

const ListProjectsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  client_id: z.string().uuid().optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  search: z.string().optional(),
  deadline_alert: z.enum(['true', 'false']).optional(),
  budget_min: z.string().optional(),
  budget_max: z.string().optional()
});

// GET /api/admin/projects - List projects with comprehensive filtering
export const GET = withAdminAuth(['projects:read'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  
  try {
    const { 
      page, limit, client_id, status, priority, search, 
      deadline_alert, budget_min, budget_max 
    } = ListProjectsSchema.parse(searchParams);
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic WHERE clause
    const whereConditions = ['p.deleted_at IS NULL'];
    const whereParams = [];

    if (client_id) {
      whereConditions.push(`p.client_id = $${whereParams.length + 1}`);
      whereParams.push(client_id);
    }

    if (status) {
      whereConditions.push(`p.status = $${whereParams.length + 1}`);
      whereParams.push(status);
    }

    if (priority) {
      whereConditions.push(`p.priority = $${whereParams.length + 1}`);
      whereParams.push(priority);
    }

    if (search) {
      whereConditions.push(`(p.nom ILIKE $${whereParams.length + 1} OR p.description ILIKE $${whereParams.length + 1})`);
      whereParams.push(`%${search}%`);
    }

    if (deadline_alert === 'true') {
      whereConditions.push(`p.deadline IS NOT NULL AND p.deadline <= CURRENT_DATE + INTERVAL '7 days'`);
    }

    if (budget_min) {
      whereConditions.push(`p.budget >= $${whereParams.length + 1}`);
      whereParams.push(parseFloat(budget_min));
    }

    if (budget_max) {
      whereConditions.push(`p.budget <= $${whereParams.length + 1}`);
      whereParams.push(parseFloat(budget_max));
    }

    const whereClause = whereConditions.join(' AND ');

    // Query projects with comprehensive details
    const projectsQuery = sql`
      SELECT 
        p.id,
        p.nom,
        p.description,
        p.client_id,
        p.budget,
        p.deadline,
        p.priority,
        p.status,
        p.tags,
        p.requirements,
        p.created_at,
        p.updated_at,
        -- Client information
        c.nom as client_name,
        '' as client_secteur,
        '' as client_taille,
        -- Resource counts
        COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as agents_assigned,
        COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_assigned,
        -- Budget utilization estimate (agents * daily rate * days)
        CASE 
          WHEN p.deadline IS NOT NULL AND p.created_at IS NOT NULL THEN
            COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') * 400 * 
            GREATEST(1, EXTRACT(DAYS FROM (p.deadline - p.created_at)))
          ELSE 0
        END as estimated_cost,
        -- Deadline status
        CASE 
          WHEN p.deadline IS NULL THEN 'no_deadline'
          WHEN p.deadline < CURRENT_DATE THEN 'overdue'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '3 days' THEN 'critical'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
          ELSE 'ok'
        END as deadline_status,
        -- Progress indicators
        CASE 
          WHEN COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') = 0 THEN 'not_started'
          WHEN p.status = 'active' THEN 'in_progress'
          ELSE p.status
        END as progress_status
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_squads ps ON p.id = ps.project_id
      LEFT JOIN squad_members sm ON ps.squad_id = sm.squad_id
      WHERE ${sql.raw(whereClause)}
      GROUP BY p.id, c.nom
      ORDER BY 
        CASE p.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END,
        p.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    // Count total for pagination
    const countQuery = sql`
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE ${sql.raw(whereClause)}
    `;

    const [projects, totalResult] = await Promise.all([
      projectsQuery,
      countQuery
    ]);

    const total = parseInt(totalResult[0]?.total || '0');
    const totalPages = Math.ceil(total / limitNum);

    const response = NextResponse.json({
      items: projects.map(project => ({
        ...project,
        tags: JSON.parse(project.tags || '[]'),
        requirements: JSON.parse(project.requirements || '[]'),
        agents_assigned: parseInt(project.agents_assigned),
        squads_assigned: parseInt(project.squads_assigned),
        estimated_cost: parseFloat(project.estimated_cost || '0'),
        budget: parseFloat(project.budget || '0')
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      },
      filters_applied: { client_id, status, priority, search, deadline_alert, budget_min, budget_max },
      summary: {
        total_projects: total,
        active_projects: projects.filter(p => p.status === 'active').length,
        overdue_projects: projects.filter(p => p.deadline_status === 'overdue').length,
        urgent_projects: projects.filter(p => p.priority === 'urgent').length
      }
    });

    log('info', 'projects_list_success', {
      route: '/api/admin/projects',
      method: 'GET',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      page: pageNum,
      results: projects.length,
      total
    });

    return response;

  } catch (error) {
    log('error', 'projects_list_error', {
      route: '/api/admin/projects',
      method: 'GET',
      error: error.message,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to list projects',
        code: 'PROJECTS_LIST_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// POST /api/admin/projects - Create new project
export const POST = withAdminAuth(['projects:write'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const data = CreateProjectSchema.parse(body);

    // Verify client exists
    const [client] = await sql`
      SELECT id, nom FROM clients 
      WHERE id = ${data.client_id} 
      AND deleted_at IS NULL 
      AND statut = 'actif'
    `;

    if (!client) {
      return NextResponse.json(
        { 
          error: 'Client introuvable ou inactif',
          code: 'CLIENT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Check for duplicate project names for this client
    const [existingProject] = await sql`
      SELECT id FROM projects 
      WHERE LOWER(nom) = LOWER(${data.nom}) 
      AND client_id = ${data.client_id}
      AND deleted_at IS NULL
    `;

    if (existingProject) {
      return NextResponse.json(
        { 
          error: 'Un projet avec ce nom existe déjà pour ce client',
          code: 'PROJECT_NAME_CONFLICT',
          trace_id: traceId
        },
        { status: 409 }
      );
    }

    // Create new project
    const [newProject] = await sql`
      INSERT INTO projects (
        nom, description, client_id, budget, deadline, 
        priority, status, tags, requirements, created_by
      ) VALUES (
        ${data.nom},
        ${data.description || ''},
        ${data.client_id},
        ${data.budget || null},
        ${data.deadline ? new Date(data.deadline) : null},
        ${data.priority},
        ${data.status},
        ${JSON.stringify(data.tags)},
        ${JSON.stringify(data.requirements)},
        ${user.sub}
      )
      RETURNING *
    `;

    const response = NextResponse.json({
      ...newProject,
      tags: JSON.parse(newProject.tags || '[]'),
      requirements: JSON.parse(newProject.requirements || '[]'),
      client_name: client.nom,
      agents_assigned: 0,
      squads_assigned: 0,
      estimated_cost: 0,
      deadline_status: 'no_deadline',
      progress_status: 'not_started'
    }, { status: 201 });

    log('info', 'project_create_success', {
      route: '/api/admin/projects',
      method: 'POST',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      project_id: newProject.id,
      project_name: newProject.nom,
      client_id: data.client_id
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

    log('error', 'project_create_error', {
      route: '/api/admin/projects',
      method: 'POST',
      error: error.message,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to create project',
        code: 'PROJECT_CREATE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// PUT /api/admin/projects - Batch operations on projects
export const PUT = withAdminAuth(['projects:write'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const { action, project_ids, data: updateData } = body;

    if (!Array.isArray(project_ids) || project_ids.length === 0) {
      return NextResponse.json(
        { 
          error: 'Project IDs array required',
          code: 'MISSING_PROJECT_IDS',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'update_status':
        if (!updateData?.status) {
          return NextResponse.json(
            { error: 'Status required for update_status action' },
            { status: 400 }
          );
        }
        result = await sql`
          UPDATE projects 
          SET status = ${updateData.status}, updated_at = NOW()
          WHERE id = ANY(${project_ids}) AND deleted_at IS NULL
          RETURNING id, nom, status
        `;
        break;
      
      case 'update_priority':
        if (!updateData?.priority) {
          return NextResponse.json(
            { error: 'Priority required for update_priority action' },
            { status: 400 }
          );
        }
        result = await sql`
          UPDATE projects 
          SET priority = ${updateData.priority}, updated_at = NOW()
          WHERE id = ANY(${project_ids}) AND deleted_at IS NULL
          RETURNING id, nom, priority
        `;
        break;
      
      case 'bulk_delete':
        result = await sql`
          UPDATE projects 
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id = ANY(${project_ids}) AND deleted_at IS NULL
          RETURNING id, nom
        `;
        break;
      
      default:
        return NextResponse.json(
          { 
            error: 'Action invalide. Actions supportées: update_status, update_priority, bulk_delete',
            code: 'INVALID_ACTION',
            trace_id: traceId
          },
          { status: 400 }
        );
    }

    log('info', 'projects_batch_operation_success', {
      route: '/api/admin/projects',
      method: 'PUT',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      action,
      affected_count: result.length
    });

    return NextResponse.json({
      action,
      affected_count: result.length,
      affected_projects: result
    });

  } catch (error) {
    log('error', 'projects_batch_operation_error', {
      route: '/api/admin/projects',
      method: 'PUT',
      error: error.message,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to perform batch operation',
        code: 'PROJECTS_BATCH_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});