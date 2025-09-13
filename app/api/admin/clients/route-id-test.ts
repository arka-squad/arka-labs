import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '../../../../lib/rbac-admin-b24';
import { sql } from '../../../../lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ROUTE ALTERNATIVE pour test : /api/admin/clients/route-id-test?id=UUID
export const GET = withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get('id');
    
    if (!clientId) {
      return NextResponse.json({ error: 'ID required in query param' }, { status: 400 });
    }

    console.log(`[ID-TEST] Testing client ID: ${clientId}`);
    
    const result = await sql`
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
        c.created_by,
        COUNT(DISTINCT p.id) as projets_count,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as projets_actifs
      FROM clients c
      LEFT JOIN projects p ON p.client_id = c.id
      WHERE c.deleted_at IS NULL AND c.id = ${clientId}::uuid
      GROUP BY c.id
      ORDER BY c.nom ASC 
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ 
        error: 'Client not found',
        clientId,
        query: 'SELECT with UUID cast',
        env: process.env.NODE_ENV 
      }, { status: 404 });
    }
    
    const row = result[0];
    const client = {
      id: row.id,
      nom: row.nom,
      secteur: row.secteur || '',
      taille: row.taille || 'PME',
      contact_principal: row.contact_principal || null,
      contexte_specifique: row.contexte_specifique || '',
      statut: row.statut || 'actif',
      projets_count: parseInt(row.projets_count) || 0,
      projets_actifs: parseInt(row.projets_actifs) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by || 'system'
    };
    
    return NextResponse.json({
      success: true,
      client,
      test: 'Alternative route working',
      env: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('Error in ID test route:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch client',
      message: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.NODE_ENV
    }, { status: 500 });
  }
});