import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../lib/rbac-admin';
import { sql, getDb } from '../../../../../lib/db';
import { log } from '../../../../../lib/logger';
import { TRACE_HEADER } from '../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for client updates
const UpdateClientSchema = z.object({
  nom: z.string().min(2).max(200).optional(),
  secteur: z.string().max(100).optional(),
  taille: z.enum(['TPE', 'PME', 'ETI', 'GE']).optional(),
  contact_principal: z.object({
    nom: z.string().max(100),
    email: z.string().email(),
    telephone: z.string().max(20)
  }).optional(),
  contexte_specifique: z.string().max(2000).optional(),
  statut: z.enum(['actif', 'inactif', 'archive']).optional()
});

// GET /api/admin/clients/[id] - Get client details with projects
export const GET = withAdminAuth(['clients:read'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const clientId = params.id;
  
  try {
    // Get client with detailed project information
    const [clientDetails] = await sql`
      SELECT 
        c.*,
        COUNT(p.id) as projets_count,
        COUNT(p.id) FILTER (WHERE p.status = 'active') as projets_actifs,
        COUNT(p.id) FILTER (WHERE p.status = 'completed') as projets_termines,
        COUNT(p.id) FILTER (WHERE p.status = 'paused') as projets_pauses,
        COALESCE(SUM(p.budget) FILTER (WHERE p.budget IS NOT NULL), 0) as budget_total,
        COALESCE(SUM(p.budget) FILTER (WHERE p.status = 'active' AND p.budget IS NOT NULL), 0) as budget_actif,
        MAX(p.created_at) as dernier_projet_date
      FROM clients c
      LEFT JOIN projects p ON c.id = p.client_id AND p.deleted_at IS NULL
      WHERE c.id = ${clientId} AND c.deleted_at IS NULL
      GROUP BY c.id
    `;

    if (!clientDetails) {
      return NextResponse.json(
        { 
          error: 'Client introuvable',
          code: 'CLIENT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Get client's projects with detailed info
    const projects = await sql`
      SELECT 
        p.id,
        p.nom,
        p.status,
        p.priority,
        p.budget,
        p.deadline,
        p.description,
        p.created_at,
        p.updated_at,
        COUNT(pa.agent_id) as agents_assigned,
        COUNT(ps.squad_id) as squads_assigned,
        CASE 
          WHEN p.deadline < CURRENT_DATE THEN 'depassee'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'proche'
          ELSE 'ok'
        END as deadline_status
      FROM projects p
      LEFT JOIN project_assignments pa ON p.id = pa.project_id AND pa.status = 'active'
      LEFT JOIN project_squads ps ON p.id = ps.project_id AND ps.status = 'active'
      WHERE p.client_id = ${clientId} AND p.deleted_at IS NULL
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    // Get recent activity/timeline
    const recentActivity = await sql`
      SELECT 
        'project_created' as activity_type,
        p.nom as activity_subject,
        p.created_at as activity_date,
        u.email as activity_user
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.client_id = ${clientId} AND p.deleted_at IS NULL
      
      UNION ALL
      
      SELECT 
        'instruction_sent' as activity_type,
        CONCAT('Squad: ', s.name) as activity_subject,
        si.created_at as activity_date,
        si.created_by as activity_user
      FROM squad_instructions si
      JOIN squads s ON si.squad_id = s.id
      JOIN project_squads ps ON s.id = ps.squad_id
      JOIN projects p ON ps.project_id = p.id
      WHERE p.client_id = ${clientId} 
      AND si.created_at >= CURRENT_DATE - INTERVAL '30 days'
      
      ORDER BY activity_date DESC
      LIMIT 10
    `;

    const formattedClient = {
      ...clientDetails,
      projets_count: parseInt(clientDetails.projets_count),
      projets_actifs: parseInt(clientDetails.projets_actifs),
      projets_termines: parseInt(clientDetails.projets_termines),
      projets_pauses: parseInt(clientDetails.projets_pauses),
      budget_total: parseFloat(clientDetails.budget_total || '0'),
      budget_actif: parseFloat(clientDetails.budget_actif || '0'),
      projects: projects.map(p => ({
        ...p,
        agents_assigned: parseInt(p.agents_assigned),
        squads_assigned: parseInt(p.squads_assigned)
      })),
      recent_activity: recentActivity
    };

    const response = NextResponse.json(formattedClient);

    log('info', 'client_detail_success', {
      route: '/api/admin/clients/[id]',
      method: 'GET',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      client_id: clientId,
      projects_count: formattedClient.projets_count
    });

    return response;

  } catch (error) {
    log('error', 'client_detail_error', {
      route: '/api/admin/clients/[id]',
      method: 'GET',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      client_id: clientId
    });

    return NextResponse.json(
      { 
        error: 'Failed to get client details',
        code: 'CLIENT_DETAIL_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// PATCH /api/admin/clients/[id] - Update client
export const PATCH = withAdminAuth(['clients:write'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const clientId = params.id;
  
  try {
    const body = await req.json();
    const updates = UpdateClientSchema.parse(body);

    // Check if client exists
    const [existingClient] = await sql`
      SELECT id, nom FROM clients 
      WHERE id = ${clientId} AND deleted_at IS NULL
    `;

    if (!existingClient) {
      return NextResponse.json(
        { 
          error: 'Client introuvable',
          code: 'CLIENT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Check for name conflicts if name is being updated
    if (updates.nom && updates.nom !== existingClient.nom) {
      const [conflictingClient] = await sql`
        SELECT id FROM clients 
        WHERE LOWER(nom) = LOWER(${updates.nom}) 
        AND id != ${clientId}
        AND statut != 'archive' 
        AND deleted_at IS NULL
      `;

      if (conflictingClient) {
        return NextResponse.json(
          { 
            error: 'Un client avec ce nom existe déjà',
            code: 'CLIENT_NAME_CONFLICT',
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
        if (key === 'contact_principal') {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramIndex}`);
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
      UPDATE clients 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const updatedResult = (await getDb().query(updateQuery, [...updateValues, clientId])).rows;
    const [updatedClient] = updatedResult;

    const response = NextResponse.json(updatedClient);

    log('info', 'client_update_success', {
      route: '/api/admin/clients/[id]',
      method: 'PATCH',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      client_id: clientId,
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

    log('error', 'client_update_error', {
      route: '/api/admin/clients/[id]',
      method: 'PATCH',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      client_id: clientId
    });

    return NextResponse.json(
      { 
        error: 'Failed to update client',
        code: 'CLIENT_UPDATE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/clients/[id] - Delete client (soft delete)
export const DELETE = withAdminAuth(['clients:delete'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const clientId = params.id;
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === 'true';
  
  try {
    // Check if client exists
    const [existingClient] = await sql`
      SELECT id, nom FROM clients 
      WHERE id = ${clientId} AND deleted_at IS NULL
    `;

    if (!existingClient) {
      return NextResponse.json(
        { 
          error: 'Client introuvable',
          code: 'CLIENT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Check for active projects unless force is specified
    if (!force) {
      const [activeProjectsCount] = await sql`
        SELECT COUNT(*) as count
        FROM projects 
        WHERE client_id = ${clientId} 
        AND status = 'active' 
        AND deleted_at IS NULL
      `;

      if (parseInt(activeProjectsCount.count) > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete client with active projects',
            code: 'CLIENT_HAS_ACTIVE_PROJECTS',
            active_projects: parseInt(activeProjectsCount.count),
            trace_id: traceId,
            suggestion: 'Use ?force=true to override or archive projects first'
          },
          { status: 409 }
        );
      }
    }

    // Soft delete the client
    const [deletedClient] = await sql`
      UPDATE clients 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${clientId} AND deleted_at IS NULL
      RETURNING id, nom
    `;

    log('info', 'client_delete_success', {
      route: '/api/admin/clients/[id]',
      method: 'DELETE',
      status: 200,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      client_id: clientId,
      client_name: deletedClient.nom,
      force_used: force
    });

    return NextResponse.json({
      deleted: true,
      client_id: clientId,
      client_name: deletedClient.nom,
      force_used: force
    });

  } catch (error) {
    log('error', 'client_delete_error', {
      route: '/api/admin/clients/[id]',
      method: 'DELETE',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      client_id: clientId
    });

    return NextResponse.json(
      { 
        error: 'Failed to delete client',
        code: 'CLIENT_DELETE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});