import { NextResponse } from 'next/server';
import { withAdminAuth } from '../../../../../lib/rbac-admin-b24';
import { getDb } from '../../../../../lib/db';
import { clientsFallbackStore } from '../../../../../lib/clients-store';

// GET /api/admin/clients/[id] - Get client details
export const GET = withAdminAuth(['viewer'])(async (req, user, { params }) => {
  const clientId = params.id;
  
  try {
    let client;
    
    // Try PostgreSQL first
    try {
      const db = getDb();
      
      // Get client with project counts
      const result = await db.query(`
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
        WHERE c.id = $1 AND c.deleted_at IS NULL
        GROUP BY c.id
      `, [clientId]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        );
      }
      
      const row = result.rows[0];
      
      // Format the client data
      client = {
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
        chiffre_affaires: row.metadata?.chiffre_affaires || null,
        projets_count: parseInt(row.projets_count) || 0,
        projets_actifs: parseInt(row.projets_actifs) || 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by || 'system'
      };
      
    } catch (dbError: any) {
      console.error('PostgreSQL error, using fallback store for GET client:', dbError.message);
      
      // Use fallback store
      const fallbackClient = await clientsFallbackStore.getById(clientId);
      
      if (!fallbackClient) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        );
      }
      
      // Format fallback client data
      client = {
        id: fallbackClient.id,
        nom: fallbackClient.nom,
        email: fallbackClient.email,
        secteur: fallbackClient.metadata?.secteur || '',
        taille: fallbackClient.metadata?.taille || 'PME',
        contact_principal: fallbackClient.metadata?.contact_principal || null,
        contexte_specifique: fallbackClient.metadata?.contexte_specifique || '',
        statut: fallbackClient.metadata?.statut || 'actif',
        site_web: fallbackClient.metadata?.site_web || '',
        effectifs: fallbackClient.metadata?.effectifs || null,
        chiffre_affaires: fallbackClient.metadata?.chiffre_affaires || null,
        projets_count: 0, // No project count available in fallback
        projets_actifs: 0, // No project count available in fallback
        created_at: fallbackClient.created_at,
        updated_at: fallbackClient.updated_at,
        created_by: fallbackClient.created_by || 'system'
      };
    }
    
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
  const clientId = params.id;
  
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

    // Update client with new metadata
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
      
      // Check if client exists
      const checkResult = await db.query(
        'SELECT id FROM clients WHERE id = $1 AND deleted_at IS NULL',
        [clientId]
      );
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        );
      }
      
      const result = await db.query(`
        UPDATE clients 
        SET 
          nom = $2,
          email = $3,
          metadata = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING *
      `, [clientId, nom, contact_principal.email, JSON.stringify(metadata)]);
      
      client = result.rows[0];
      
    } catch (dbError: any) {
      console.error('PostgreSQL error, using fallback store for PUT client:', dbError.message);
      
      // Use fallback store
      client = await clientsFallbackStore.update(clientId, {
        nom,
        email: contact_principal.email,
        metadata
      });
      
      if (!client) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      id: client.id,
      nom: client.nom,
      email: client.email,
      ...metadata,
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
  const clientId = params.id;
  
  try {
    let success = false;
    
    // Try PostgreSQL first
    try {
      const db = getDb();
      
      // Soft delete the client
      const result = await db.query(`
        UPDATE clients 
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `, [clientId]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        );
      }
      
      success = true;
      
    } catch (dbError: any) {
      console.error('PostgreSQL error, using fallback store for DELETE client:', dbError.message);
      
      // Use fallback store
      success = await clientsFallbackStore.delete(clientId);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        );
      }
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