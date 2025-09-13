import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../lib/rbac-admin-b24';
import { sql } from '../../../../lib/db';
import { log } from '../../../../lib/logger';
import { generateSlug, ensureUniqueSlug, getSquadPerformance } from '../../../../lib/squad-utils';
import { TRACE_HEADER } from '../../../../lib/trace';
import { SquadCache } from '../../../../lib/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas
const CreateSquadSchema = z.object({
  name: z.string().min(3).max(100),
  mission: z.string().max(800).optional(),
  domain: z.enum(['RH', 'Tech', 'Marketing', 'Finance', 'Ops'])
});

const ListSquadsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  domain: z.enum(['RH', 'Tech', 'Marketing', 'Finance', 'Ops']).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

// GET /api/admin/squads - List squads with pagination
export const GET = withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  
  try {
    const { page, limit, domain, status } = ListSquadsSchema.parse(searchParams);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per B23 spec
    const offset = (pageNum - 1) * limitNum;

    // Check cache first
    const cacheKey = `${pageNum}:${limitNum}:${domain || ''}:${status || ''}`;
    const cached = await SquadCache.getList(cacheKey);
    if (cached) {
      const res = NextResponse.json(cached);
      log('info', 'squads_list_cached', {
        route: '/api/admin/squads',
        method: 'GET',
        status: res.status,
        duration_ms: Date.now() - start,
        trace_id: traceId,
        user_id: user.id,
        cache_hit: true
      });
      return res;
    }

    // Build dynamic query with proper parameterization
    let rows;
    let countRows;

    if (domain && status) {
      // Both filters
      rows = await sql`
        SELECT 
          s.id, s.name, s.slug, s.mission, s.domain, s.status,
          s.created_by, s.created_at, s.updated_at,
          COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
          COUNT(DISTINCT ps.project_id) FILTER (WHERE ps.status = 'active') as projects_count,
          COALESCE(perf.avg_completion_hours, 0) as avg_completion_hours
        FROM squads s
        LEFT JOIN squad_members sm ON s.id = sm.squad_id
        LEFT JOIN project_squads ps ON s.id = ps.squad_id
        LEFT JOIN LATERAL (
          SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_completion_hours
          FROM squad_instructions si
          WHERE si.squad_id = s.id AND si.completed_at IS NOT NULL
            AND si.created_at >= NOW() - INTERVAL '30 days'
        ) perf ON true
        WHERE s.deleted_at IS NULL AND s.domain = ${domain} AND s.status = ${status}
        GROUP BY s.id, perf.avg_completion_hours
        ORDER BY s.created_at DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) as count FROM squads s 
        WHERE s.deleted_at IS NULL AND s.domain = ${domain} AND s.status = ${status}
      `;
    } else if (domain) {
      // Domain filter only
      rows = await sql`
        SELECT 
          s.id, s.name, s.slug, s.mission, s.domain, s.status,
          s.created_by, s.created_at, s.updated_at,
          COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
          COUNT(DISTINCT ps.project_id) FILTER (WHERE ps.status = 'active') as projects_count,
          COALESCE(perf.avg_completion_hours, 0) as avg_completion_hours
        FROM squads s
        LEFT JOIN squad_members sm ON s.id = sm.squad_id
        LEFT JOIN project_squads ps ON s.id = ps.squad_id
        LEFT JOIN LATERAL (
          SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_completion_hours
          FROM squad_instructions si
          WHERE si.squad_id = s.id AND si.completed_at IS NOT NULL
            AND si.created_at >= NOW() - INTERVAL '30 days'
        ) perf ON true
        WHERE s.deleted_at IS NULL AND s.domain = ${domain}
        GROUP BY s.id, perf.avg_completion_hours
        ORDER BY s.created_at DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) as count FROM squads s 
        WHERE s.deleted_at IS NULL AND s.domain = ${domain}
      `;
    } else if (status) {
      // Status filter only
      rows = await sql`
        SELECT 
          s.id, s.name, s.slug, s.mission, s.domain, s.status,
          s.created_by, s.created_at, s.updated_at,
          COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
          COUNT(DISTINCT ps.project_id) FILTER (WHERE ps.status = 'active') as projects_count,
          COALESCE(perf.avg_completion_hours, 0) as avg_completion_hours
        FROM squads s
        LEFT JOIN squad_members sm ON s.id = sm.squad_id
        LEFT JOIN project_squads ps ON s.id = ps.squad_id
        LEFT JOIN LATERAL (
          SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_completion_hours
          FROM squad_instructions si
          WHERE si.squad_id = s.id AND si.completed_at IS NOT NULL
            AND si.created_at >= NOW() - INTERVAL '30 days'
        ) perf ON true
        WHERE s.deleted_at IS NULL AND s.status = ${status}
        GROUP BY s.id, perf.avg_completion_hours
        ORDER BY s.created_at DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) as count FROM squads s 
        WHERE s.deleted_at IS NULL AND s.status = ${status}
      `;
    } else {
      // No filters
      rows = await sql`
        SELECT 
          s.id, s.name, s.slug, s.mission, s.domain, s.status,
          s.created_by, s.created_at, s.updated_at,
          COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
          COUNT(DISTINCT ps.project_id) FILTER (WHERE ps.status = 'active') as projects_count,
          COALESCE(perf.avg_completion_hours, 0) as avg_completion_hours
        FROM squads s
        LEFT JOIN squad_members sm ON s.id = sm.squad_id
        LEFT JOIN project_squads ps ON s.id = ps.squad_id
        LEFT JOIN LATERAL (
          SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_completion_hours
          FROM squad_instructions si
          WHERE si.squad_id = s.id AND si.completed_at IS NOT NULL
            AND si.created_at >= NOW() - INTERVAL '30 days'
        ) perf ON true
        WHERE s.deleted_at IS NULL
        GROUP BY s.id, perf.avg_completion_hours
        ORDER BY s.created_at DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) as count FROM squads s WHERE s.deleted_at IS NULL
      `;
    }

    const items = rows.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      mission: row.mission,
      domain: row.domain,
      status: row.status,
      members_count: parseInt(row.members_count),
      projects_count: parseInt(row.projects_count),
      avg_completion_hours: parseFloat(row.avg_completion_hours) || 0,
      created_by: row.created_by,
      created_at: row.created_at
    }));

    const totalCount = parseInt(countRows[0].count);
    const hasMore = offset + limitNum < totalCount;

    const response = {
      items,
      page: pageNum,
      limit: limitNum,
      count: totalCount,
      has_more: hasMore
    };

    // Cache the response for 5 minutes (300s)
    await SquadCache.setList(cacheKey, response.items, 300);

    const res = NextResponse.json(response);
    
    log('info', 'squads_list', {
      route: '/api/admin/squads',
      method: 'GET',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      count: items.length,
      filters: { domain, status }
    });

    return res;
  } catch (error) {
    log('error', 'squads_list_failed', {
      route: '/api/admin/squads',
      method: 'GET',
      status: 500,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
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

// POST /api/admin/squads - Create new squad
export const POST = withAdminAuth(['admin', 'manager'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const { name, mission, domain } = CreateSquadSchema.parse(body);
    
    // Generate unique slug
    const baseSlug = generateSlug(name);
    const slug = await ensureUniqueSlug(baseSlug);
    
    // Create squad
    const rows = await sql`
      INSERT INTO squads (name, slug, mission, domain, created_by)
      VALUES (${name}, ${slug}, ${mission || ''}, ${domain}, ${user.id})
      RETURNING id, name, slug, mission, domain, status, created_by, created_at
    `;

    const squad = rows[0];
    
    // TODO: Integration hook for B22 memory capture
    // await executeHook('onSquadCreated', squad);

    const response = {
      id: squad.id,
      slug: squad.slug,
      name: squad.name,
      mission: squad.mission,
      domain: squad.domain,
      status: squad.status,
      members_count: 0,
      projects_count: 0,
      created_by: squad.created_by,
      created_at: squad.created_at
    };

    // Invalidate cache since new squad was created
    await SquadCache.invalidate();

    const res = NextResponse.json(response, { status: 201 });
    
    log('info', 'squad_created', {
      route: '/api/admin/squads',
      method: 'POST',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      squad_id: squad.id,
      squad_name: name,
      domain
    });

    return res;
  } catch (error) {
    log('error', 'squad_creation_failed', {
      route: '/api/admin/squads',
      method: 'POST',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'validation_failed', 
        details: error.errors 
      }, { status: 400 });
    }

    // Handle unique constraint violations (slug conflicts)
    if ((error instanceof Error && error.message?.includes('unique')) || 
        (error as any)?.code === '23505') {
      return NextResponse.json({ 
        error: 'squad_name_taken',
        message: 'A squad with this name already exists' 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: 'internal_error' 
    }, { status: 500 });
  }
});