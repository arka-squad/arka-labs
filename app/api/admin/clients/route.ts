import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';
import { withAdminAuth } from '../../../../lib/rbac-admin-b24';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const statut = searchParams.get('statut') || '';
    const taille = searchParams.get('taille') || '';
    const secteur = searchParams.get('secteur') || '';
    
    // For complex queries with dynamic filters, use simple approach
    // Get all clients first, then filter in memory for now (optimize later)
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
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.nom ASC 
      LIMIT 100
    `;
    
    // Apply filters in memory for now
    let filteredResult = result;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredResult = filteredResult.filter((row: any) => 
        row.nom?.toLowerCase().includes(searchLower) ||
        row.contact_principal?.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statut && statut !== '') {
      filteredResult = filteredResult.filter((row: any) => row.statut === statut);
    }
    
    if (taille && taille !== '') {
      filteredResult = filteredResult.filter((row: any) => row.taille === taille);
    }
    
    if (secteur && secteur !== '') {
      const secteurLower = secteur.toLowerCase();
      filteredResult = filteredResult.filter((row: any) => 
        row.secteur?.toLowerCase().includes(secteurLower)
      );
    }
    
    // Transform the data to match the expected format
    const items = filteredResult.map((row: any) => ({
      id: row.id,
      nom: row.nom,
      email: row.contact_principal?.email || '',
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
    }));
    
    return NextResponse.json({
      success: true,
      items,
      total: items.length,
      page: 1,
      limit: 100,
      totalPages: 1
    });

  } catch (error) {
    console.error('Error listing clients:', error);
    return NextResponse.json(
      { error: 'Failed to list clients', code: 'CLIENTS_LIST_ERROR' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(['admin', 'manager'])(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { 
      nom, 
      secteur,
      taille,
      contact_principal,
      contexte_specifique,
      statut 
    } = body;

    if (!nom || !secteur) {
      return NextResponse.json(
        { error: 'Le nom et le secteur sont obligatoires' },
        { status: 400 }
      );
    }

    if (!contact_principal?.nom || !contact_principal?.email) {
      return NextResponse.json(
        { error: 'Le nom et l\'email du contact principal sont obligatoires' },
        { status: 400 }
      );
    }

    // Generate UUID for the client
    const clientId = crypto.randomUUID();
    
    // Insert client with postgres.js native
    const result = await sql`
      INSERT INTO clients (
        id,
        nom,
        secteur,
        taille,
        contact_principal,
        contexte_specifique,
        statut,
        created_by,
        created_at,
        updated_at
      )
      VALUES (
        ${clientId},
        ${nom},
        ${secteur},
        ${taille || 'PME'},
        ${JSON.stringify(contact_principal)},
        ${contexte_specifique || ''},
        ${statut || 'actif'},
        ${user?.id || 'system'},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id, nom, secteur, taille, contact_principal, contexte_specifique, statut, created_at, created_by
    `;

    const client = result[0];
    
    return NextResponse.json({
      success: true,
      id: client.id,
      nom: client.nom,
      secteur: client.secteur,
      taille: client.taille,
      contact_principal: client.contact_principal,
      contexte_specifique: client.contexte_specifique,
      statut: client.statut,
      created_at: client.created_at,
      created_by: client.created_by
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Échec de la création du client', code: 'CLIENT_CREATE_ERROR' },
      { status: 500 }
    );
  }
});