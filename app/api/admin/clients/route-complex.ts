import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../lib/rbac-admin';
import { sql } from '../../../../lib/db';
import { log } from '../../../../lib/logger';
import { TRACE_HEADER } from '../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas according to B23 v2.5 specifications
const CreateClientSchema = z.object({
  nom: z.string().min(2).max(200),
  secteur: z.string().max(100).optional(),
  taille: z.enum(['TPE', 'PME', 'ETI', 'GE']).optional().default('PME'),
  contact_principal: z.object({
    nom: z.string().max(100),
    email: z.string().email(),
    telephone: z.string().max(20)
  }).optional(),
  contexte_specifique: z.string().max(2000).optional(),
  statut: z.enum(['actif', 'inactif', 'archive']).optional().default('actif')
});

const ListClientsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  secteur: z.string().optional(),
  taille: z.enum(['TPE', 'PME', 'ETI', 'GE']).optional(),
  statut: z.enum(['actif', 'inactif', 'archive']).optional(),
  search: z.string().optional()
});

const UpdateClientSchema = CreateClientSchema.partial();

// GET /api/admin/clients - List clients with B23 v2.5 project stats
export const GET = withAdminAuth(['clients:read'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  
  try {
    const { page, limit, secteur, taille, statut, search } = ListClientsSchema.parse(searchParams);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic WHERE clause
    const whereConditions = ['c.deleted_at IS NULL'];
    const whereParams = [];

    if (secteur) {
      whereConditions.push(`c.secteur ILIKE $${whereParams.length + 1}`);
      whereParams.push(`%${secteur}%`);
    }

    if (taille) {
      whereConditions.push(`c.taille = $${whereParams.length + 1}`);
      whereParams.push(taille);
    }

    if (statut) {
      whereConditions.push(`c.statut = $${whereParams.length + 1}`);
      whereParams.push(statut);
    }

    if (search) {
      whereConditions.push(`(c.nom ILIKE $${whereParams.length + 1} OR c.secteur ILIKE $${whereParams.length + 1})`);
      whereParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Query clients with project statistics
    const clientsQuery = sql`
      SELECT 
        c.id,
        c.nom,
        c.secteur,
        c.taille,
        c.contact_principal,
        c.contexte_specifique,
        c.statut,
        c.created_at,
        c.updated_at,
        COUNT(p.id) as projets_count,
        COUNT(p.id) FILTER (WHERE p.status = 'active') as projets_actifs,
        COALESCE(SUM(p.budget) FILTER (WHERE p.budget IS NOT NULL), 0) as budget_total,
        MAX(p.created_at) as dernier_projet
      FROM clients c
      LEFT JOIN projects p ON c.id = p.client_id AND p.deleted_at IS NULL
      WHERE ${sql.raw(whereClause)}
      GROUP BY c.id, c.nom, c.secteur, c.taille, c.contact_principal, c.contexte_specifique, c.statut, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    // Count total for pagination
    const countQuery = sql`
      SELECT COUNT(DISTINCT c.id) as total
      FROM clients c
      WHERE ${sql.raw(whereClause)}
    `;

    const [clients, totalResult] = await Promise.all([
      clientsQuery,
      countQuery
    ]);

    const total = parseInt(totalResult[0]?.total || '0');
    const totalPages = Math.ceil(total / limitNum);

    const response = NextResponse.json({
      items: clients.map(client => ({
        ...client,
        projets_count: parseInt(client.projets_count),
        projets_actifs: parseInt(client.projets_actifs),
        budget_total: parseFloat(client.budget_total || '0')
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      },
      filters_applied: { secteur, taille, statut, search }
    });

    log('info', 'clients_list_success', {
      route: '/api/admin/clients',
      method: 'GET',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      page: pageNum,
      results: clients.length,
      total
    });

    return response;

  } catch (error) {
    log('error', 'clients_list_error', {
      route: '/api/admin/clients',
      method: 'GET',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to list clients',
        code: 'CLIENTS_LIST_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// POST /api/admin/clients - Create new client
export const POST = withAdminAuth(['clients:write'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const data = CreateClientSchema.parse(body);

    // Check for duplicate client names
    const existingClient = await sql`
      SELECT id FROM clients 
      WHERE LOWER(nom) = LOWER(${data.nom}) 
      AND statut != 'archive' 
      AND deleted_at IS NULL
    `;

    if (existingClient.length > 0) {
      return NextResponse.json(
        { 
          error: 'Un client avec ce nom existe déjà',
          code: 'CLIENT_NAME_CONFLICT',
          trace_id: traceId
        },
        { status: 409 }
      );
    }

    // Create new client
    const [newClient] = await sql`
      INSERT INTO clients (
        nom, secteur, taille, contact_principal, 
        contexte_specifique, statut, created_by
      ) VALUES (
        ${data.nom}, 
        ${data.secteur || ''}, 
        ${data.taille}, 
        ${JSON.stringify(data.contact_principal || {})}, 
        ${data.contexte_specifique || ''}, 
        ${data.statut},
        ${user.sub}
      )
      RETURNING *
    `;

    const response = NextResponse.json({
      ...newClient,
      projets_count: 0,
      projets_actifs: 0,
      budget_total: 0
    }, { status: 201 });

    log('info', 'client_create_success', {
      route: '/api/admin/clients',
      method: 'POST',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      client_id: newClient.id,
      client_name: newClient.nom
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

    log('error', 'client_create_error', {
      route: '/api/admin/clients',
      method: 'POST',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to create client',
        code: 'CLIENT_CREATE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// PUT /api/admin/clients - Batch operations (future use)
export const PUT = withAdminAuth(['clients:write'])(async (req, user) => {
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  return NextResponse.json(
    { 
      error: 'Batch operations not implemented yet',
      code: 'NOT_IMPLEMENTED',
      trace_id: traceId
    },
    { status: 501 }
  );
});

// DELETE /api/admin/clients - Bulk delete (admin only)
export const DELETE = withAdminAuth(['clients:delete'])(async (req, user) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  
  try {
    const body = await req.json();
    const { client_ids, force = false } = body;

    if (!Array.isArray(client_ids) || client_ids.length === 0) {
      return NextResponse.json(
        { 
          error: 'Client IDs array required',
          code: 'MISSING_CLIENT_IDS',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    // Check for active projects unless force is true
    if (!force) {
      const activeProjects = await sql`
        SELECT c.nom as client_nom, COUNT(p.id) as active_projects
        FROM clients c
        JOIN projects p ON c.id = p.client_id
        WHERE c.id = ANY(${client_ids}) 
        AND p.status = 'active' 
        AND p.deleted_at IS NULL
        GROUP BY c.id, c.nom
        HAVING COUNT(p.id) > 0
      `;

      if (activeProjects.length > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete clients with active projects',
            code: 'CLIENTS_HAVE_ACTIVE_PROJECTS',
            details: activeProjects,
            trace_id: traceId,
            suggestion: 'Use force=true to override or archive projects first'
          },
          { status: 409 }
        );
      }
    }

    // Soft delete clients
    const deletedClients = await sql`
      UPDATE clients 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ANY(${client_ids}) 
      AND deleted_at IS NULL
      RETURNING id, nom
    `;

    log('info', 'clients_bulk_delete_success', {
      route: '/api/admin/clients',
      method: 'DELETE',
      status: 200,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      deleted_count: deletedClients.length,
      force_used: force
    });

    return NextResponse.json({
      deleted_count: deletedClients.length,
      deleted_clients: deletedClients,
      force_used: force
    });

  } catch (error) {
    log('error', 'clients_bulk_delete_error', {
      route: '/api/admin/clients',
      method: 'DELETE',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub
    });

    return NextResponse.json(
      { 
        error: 'Failed to delete clients',
        code: 'CLIENTS_DELETE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});