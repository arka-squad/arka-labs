import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { withAdminAuth } from '../../../../lib/rbac-admin-b24';
import { clientsFallbackStore } from '../../../../lib/clients-store';

export const GET = withAdminAuth(['viewer'])(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const statut = searchParams.get('statut') || '';
    const taille = searchParams.get('taille') || '';
    const secteur = searchParams.get('secteur') || '';
    
    let items;
    
    // Try PostgreSQL first
    try {
      const db = getDb();
      
      // Build dynamic query with filters
      let query = `
        SELECT 
          c.id,
          c.nom,
          c.email,
          c.metadata,
          c.created_at,
          c.updated_at,
          c.created_by,
          COUNT(DISTINCT p.id) as projets_count,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as projets_actifs
        FROM clients c
        LEFT JOIN projects p ON p.client_id = c.id
        WHERE c.deleted_at IS NULL
      `;
      
      const params: any[] = [];
      let paramCount = 0;
      
      if (search) {
        paramCount++;
        query += ` AND (LOWER(c.nom) LIKE LOWER($${paramCount}) OR LOWER(c.email) LIKE LOWER($${paramCount}))`;
        params.push(`%${search}%`);
      }
      
      if (statut && statut !== '') {
        paramCount++;
        query += ` AND c.metadata->>'statut' = $${paramCount}`;
        params.push(statut);
      }
      
      if (taille && taille !== '') {
        paramCount++;
        query += ` AND c.metadata->>'taille' = $${paramCount}`;
        params.push(taille);
      }
      
      if (secteur && secteur !== '') {
        paramCount++;
        query += ` AND LOWER(c.metadata->>'secteur') LIKE LOWER($${paramCount})`;
        params.push(`%${secteur}%`);
      }
      
      query += ` GROUP BY c.id ORDER BY c.nom ASC LIMIT 100`;
      
      const result = await db.query(query, params);
      
      // Transform the data to match the expected format
      items = result.rows.map((row: any) => ({
        id: row.id,
        nom: row.nom,
        email: row.email,
        secteur: row.metadata?.secteur || '',
        taille: row.metadata?.taille || 'PME',
        contact_principal: row.metadata?.contact_principal || null,
        contexte_specifique: row.metadata?.contexte_specifique || '',
        statut: row.metadata?.statut || 'actif',
        site_web: row.metadata?.site_web || '',
        effectifs: row.metadata?.effectifs || null,
        projets_count: parseInt(row.projets_count) || 0,
        projets_actifs: parseInt(row.projets_actifs) || 0,
        created_at: row.created_at,
        created_by: row.created_by || 'system'
      }));
      
    } catch (dbError: any) {
      console.error('PostgreSQL error, using fallback store for GET clients:', dbError.message);
      
      // Use fallback store
      const filters = {
        search: search || undefined,
        statut: statut || undefined,
        taille: taille || undefined,
        secteur: secteur || undefined
      };
      
      const fallbackClients = await clientsFallbackStore.getAll(filters);
      
      // Transform fallback data to match expected format
      items = fallbackClients.map((client: any) => ({
        id: client.id,
        nom: client.nom,
        email: client.email,
        secteur: client.metadata?.secteur || '',
        taille: client.metadata?.taille || 'PME',
        contact_principal: client.metadata?.contact_principal || null,
        contexte_specifique: client.metadata?.contexte_specifique || '',
        statut: client.metadata?.statut || 'actif',
        site_web: client.metadata?.site_web || '',
        effectifs: client.metadata?.effectifs || null,
        projets_count: 0, // No project count available in fallback
        projets_actifs: 0, // No project count available in fallback
        created_at: client.created_at,
        created_by: client.created_by || 'system'
      }));
    }
    
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
      site_web,
      effectifs,
      chiffre_affaires,
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

    // Store additional data in metadata JSONB column
    const metadata = {
      secteur,
      taille,
      contact_principal,
      contexte_specifique,
      site_web,
      effectifs,
      chiffre_affaires,
      statut: statut || 'actif'
    };
    
    let client;
    
    // Try PostgreSQL first
    try {
      const db = getDb();
      
      // Check if table exists first
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'clients'
        )
      `);
      
      if (!tableCheck.rows[0].exists) {
        // Create table if it doesn't exist
        await db.query(`
          CREATE TABLE IF NOT EXISTS clients (
            id SERIAL PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP,
            created_by VARCHAR(255) DEFAULT 'system'
          )
        `);
      }
      
      // Insert client with metadata
      const result = await db.query(`
        INSERT INTO clients (nom, email, metadata, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [nom, contact_principal.email, JSON.stringify(metadata), user?.id || 'system']);

      client = result.rows[0];
      
    } catch (dbError: any) {
      console.error('PostgreSQL error, using fallback store for POST client:', dbError.message);
      
      // Use fallback store
      client = await clientsFallbackStore.create({
        nom,
        email: contact_principal.email,
        metadata,
        created_by: user?.id || 'system'
      });
    }
    
    return NextResponse.json({
      success: true,
      id: client.id,
      nom: client.nom,
      email: client.email,
      ...metadata,
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