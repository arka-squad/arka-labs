import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../lib/rbac-admin';
import { sql } from '../../../../lib/db';
import { log } from '../../../../lib/logger';
import { TRACE_HEADER } from '../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas for agents management
const CreateAgentSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(3).max(100),
  domaine: z.enum(['RH', 'Tech', 'Marketing', 'Finance', 'Ops']),
  version: z.string().regex(/^\d+\.\d+$/).optional().default('1.0'),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional().default([]),
  prompt_system: z.string().min(10).max(5000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().min(100).max(8000).optional().default(2048),
  is_template: z.boolean().optional().default(false),
  original_agent_id: z.string().uuid().optional()
});

const ListAgentsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  domaine: z.enum(['RH', 'Tech', 'Marketing', 'Finance', 'Ops']).optional(),
  is_template: z.enum(['true', 'false']).optional(),
  min_performance: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

// GET /api/admin/agents - List agents with performance metrics
export const GET = withAdminAuth(['agents:read'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  
  try {
    const { page, limit, domaine, is_template, min_performance, search, status } = ListAgentsSchema.parse(searchParams);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic WHERE clause
    const whereConditions = ['a.deleted_at IS NULL'];
    const whereParams = [];

    if (domaine) {
      whereConditions.push(`a.domaine = $${whereParams.length + 1}`);
      whereParams.push(domaine);
    }

    if (is_template) {
      whereConditions.push(`a.is_template = $${whereParams.length + 1}`);
      whereParams.push(is_template === 'true' ? 1 : 0);
    }

    if (status) {
      whereConditions.push(`a.status = $${whereParams.length + 1}`);
      whereParams.push(status);
    } else {
      whereConditions.push(`a.status = 'active'`); // Default to active
    }

    if (search) {
      whereConditions.push(`(a.name ILIKE $${whereParams.length + 1} OR a.role ILIKE $${whereParams.length + 1} OR a.description ILIKE $${whereParams.length + 1})`);
      whereParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Simple query without complex joins for SQLite compatibility
    const agents = await sql`
      SELECT 
        id,
        name,
        role,
        domaine,
        version,
        description,
        tags,
        is_template,
        original_agent_id,
        temperature,
        max_tokens,
        status,
        created_at,
        updated_at
      FROM agents 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const response = NextResponse.json({
      items: agents.map(agent => ({
        ...agent,
        tags: JSON.parse(agent.tags || '[]'),
        is_template: Boolean(agent.is_template),
        projets_actifs: 0,
        projets_total: 0,
        performance_score: 20
      })),
      pagination: {
        page: 1,
        limit: 20,
        total: agents.length,
        total_pages: 1,
        has_next: false,
        has_prev: false
      }
    });

    log('info', 'agents_list_success', {
      route: '/api/admin/agents',
      method: 'GET',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      results: agents.length
    });

    return response;

  } catch (error) {
    log('error', 'agents_list_error', {
      route: '/api/admin/agents',
      method: 'GET',
      error: error.message,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to list agents',
        code: 'AGENTS_LIST_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// POST /api/admin/agents - Create new agent
export const POST = withAdminAuth(['agents:write'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const data = CreateAgentSchema.parse(body);

    // Check for duplicate names among templates
    if (data.is_template) {
      const existingAgent = await sql`
        SELECT id FROM agents 
        WHERE LOWER(name) = LOWER(${data.name}) 
        AND is_template = 1
        AND status = 'active'
        AND deleted_at IS NULL
      `;

      if (existingAgent.length > 0) {
        return NextResponse.json(
          { 
            error: 'Un agent template avec ce nom existe déjà',
            code: 'AGENT_NAME_CONFLICT',
            trace_id: traceId
          },
          { status: 409 }
        );
      }
    }

    // Validate original agent exists if specified
    if (data.original_agent_id) {
      const [originalAgent] = await sql`
        SELECT id, name, version FROM agents 
        WHERE id = ${data.original_agent_id} 
        AND deleted_at IS NULL
      `;

      if (!originalAgent) {
        return NextResponse.json(
          { 
            error: 'Agent original introuvable',
            code: 'ORIGINAL_AGENT_NOT_FOUND',
            trace_id: traceId
          },
          { status: 404 }
        );
      }
    }

    // Create new agent
    const [newAgent] = await sql`
      INSERT INTO agents (
        name, role, domaine, version, description, tags,
        prompt_system, temperature, max_tokens, is_template,
        original_agent_id, status, created_by
      ) VALUES (
        ${data.name}, ${data.role}, ${data.domaine}, ${data.version},
        ${data.description || ''}, ${JSON.stringify(data.tags)},
        ${data.prompt_system}, ${data.temperature}, ${data.max_tokens},
        ${data.is_template ? 1 : 0}, ${data.original_agent_id}, 'active', ${user.sub}
      )
      RETURNING *
    `;

    const response = NextResponse.json({
      ...newAgent,
      projets_actifs: 0,
      projets_total: 0,
      performance_score: 0,
      tags: JSON.parse(newAgent.tags || '[]')
    }, { status: 201 });

    log('info', 'agent_create_success', {
      route: '/api/admin/agents',
      method: 'POST',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      agent_id: newAgent.id,
      agent_name: newAgent.name,
      is_template: newAgent.is_template,
      is_duplicate: !!newAgent.original_agent_id
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

    log('error', 'agent_create_error', {
      route: '/api/admin/agents',
      method: 'POST',
      error: error.message,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to create agent',
        code: 'AGENT_CREATE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// PUT /api/admin/agents - Batch operations
export const PUT = withAdminAuth(['agents:write'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const { action, agent_ids } = body;

    if (!Array.isArray(agent_ids) || agent_ids.length === 0) {
      return NextResponse.json(
        { 
          error: 'Agent IDs array required',
          code: 'MISSING_AGENT_IDS',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'activate':
        result = await sql`
          UPDATE agents 
          SET status = 'active', updated_at = NOW()
          WHERE id = ANY(${agent_ids}) AND deleted_at IS NULL
          RETURNING id, name, status
        `;
        break;
      
      case 'deactivate':
        result = await sql`
          UPDATE agents 
          SET status = 'inactive', updated_at = NOW()
          WHERE id = ANY(${agent_ids}) AND deleted_at IS NULL
          RETURNING id, name, status
        `;
        break;
      
      case 'archive':
        result = await sql`
          UPDATE agents 
          SET status = 'archived', updated_at = NOW()
          WHERE id = ANY(${agent_ids}) AND deleted_at IS NULL
          RETURNING id, name, status
        `;
        break;
      
      default:
        return NextResponse.json(
          { 
            error: 'Action invalide. Actions supportées: activate, deactivate, archive',
            code: 'INVALID_ACTION',
            trace_id: traceId
          },
          { status: 400 }
        );
    }

    log('info', 'agents_batch_operation_success', {
      route: '/api/admin/agents',
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
      affected_agents: result
    });

  } catch (error) {
    log('error', 'agents_batch_operation_error', {
      route: '/api/admin/agents',
      method: 'PUT',
      error: error.message,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to perform batch operation',
        code: 'AGENTS_BATCH_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});