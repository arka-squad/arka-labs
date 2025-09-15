import { NextResponse } from 'next/server';
import { withAdminAuth } from '../../../../../lib/rbac-admin-b24';
import { sql } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Vercel deployment debug - forced rebuild
export const revalidate = 0;

// GET /api/admin/clients/[id] - Get client details
export const GET = withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (req, user, { params }) => {

  const clientId = params.id as string;
  
  try {
    // Debug logging
    console.log(`[API DEBUG] Fetching client with ID: ${clientId}`);
    console.log(`[API DEBUG] Client ID type: ${typeof clientId}, length: ${clientId.length}`);
    
    // First, check if client exists at all (explicit UUID cast for Neon DB)
    const existsCheck = await sql`
      SELECT id, name, deleted_at FROM clients WHERE id = ${clientId}::uuid
    `;
    console.log(`[API DEBUG] Existence check result:`, existsCheck);
    
    // SIMPLIFIED query without JOIN to avoid read replica issues
    const result = await sql`
      SELECT 
        c.id,
        c.name,
        c.sector,
        c.size,
        c.primary_contact,
        c.specific_context,
        c.status,
        c.created_at,
        c.updated_at,
        c.created_by
      FROM clients c
      WHERE c.deleted_at IS NULL AND c.id = ${clientId}::uuid
      LIMIT 1
    `;
    
    // Get project counts separately if needed
    let projets_count = 0;
    let projets_actifs = 0;
    
    if (result.length > 0) {
      try {
        const projectsResult = await sql`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as actifs
          FROM projects 
          WHERE client_id = ${clientId}::uuid AND deleted_at IS NULL
        `;
        if (projectsResult.length > 0) {
          projets_count = parseInt(projectsResult[0].total) || 0;
          projets_actifs = parseInt(projectsResult[0].actifs) || 0;
        }
      } catch (projectError) {
        console.warn('Could not fetch project counts:', projectError);
      }
    }
    
    console.log(`[API DEBUG] Main query result length:`, result.length);
    console.log(`[API DEBUG] Main query result:`, result);
    
    if (result.length === 0) {
      return NextResponse.json(
        { 
          error: 'Client non trouvé',
          debug: {
            clientId,
            existsCheck: existsCheck.length,
            searchedId: clientId
          }
        },
        { status: 404 }
      );
    }
    
    const row = result[0];
    
    // Format the client data
    const client = {
      id: row.id,
      name: row.name,
      email: row.primary_contact?.email || '',
      sector: row.sector || '',
      size: row.size || 'medium',
      primary_contact: row.primary_contact || null,
      specific_context: row.specific_context || '',
      status: row.status || 'active',
      projets_count,
      projets_actifs,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by || 'system'
    };
    
    return NextResponse.json(client);
    
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Échec du chargement du client', code: 'CLIENT_FETCH_ERROR' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/clients/[id] - Update client
export const PUT = withAdminAuth(['admin', 'manager', 'operator'])(async (req, user, { params }) => {
  const clientId = params.id as string;
  
  try {
    const body = await req.json();
    const { 
      name,
      sector,
      size,
      primary_contact,
      specific_context,
      status 
    } = body;

    if (!name || !sector) {
      return NextResponse.json(
        { error: 'Le nom et le secteur sont obligatoires' },
        { status: 400 }
      );
    }

    if (!primary_contact?.name || !primary_contact?.email) {
      return NextResponse.json(
        { error: 'Le nom et l\'email du contact principal sont obligatoires' },
        { status: 400 }
      );
    }

    // Check if client exists
    const checkResult = await sql`
      SELECT id FROM clients WHERE id = ${clientId} AND deleted_at IS NULL
    `;
    
    if (checkResult.length === 0) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }
    
    // Update client with postgres.js native
    const result = await sql`
      UPDATE clients 
      SET 
        name = ${name},
        sector = ${sector},
        size = ${size || 'medium'},
        primary_contact = ${JSON.stringify(primary_contact)},
        specific_context = ${specific_context || ''},
        status = ${status || 'active'},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${clientId} AND deleted_at IS NULL
      RETURNING id, name, sector, size, primary_contact, specific_context, status, updated_at
    `;
    
    const client = result[0];
    
    return NextResponse.json({
      success: true,
      id: client.id,
      name: client.name,
      sector: client.sector,
      size: client.size,
      primary_contact: client.primary_contact,
      specific_context: client.specific_context,
      status: client.status,
      updated_at: client.updated_at
    });
    
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour du client', code: 'CLIENT_UPDATE_ERROR' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/clients/[id] - Delete client (soft delete)
export const DELETE = withAdminAuth(['admin'])(async (req, user, { params }) => {
  const clientId = params.id as string;
  
  try {
    // Soft delete the client
    const result = await sql`
      UPDATE clients 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${clientId} AND deleted_at IS NULL
      RETURNING id
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Client supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Échec de la suppression du client', code: 'CLIENT_DELETE_ERROR' },
      { status: 500 }
    );
  }
});