/**
 * ARKA ADMIN ROUTES - Définitions centralisées des routes admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRoute, RouteParams } from './index';
import { withAdminAuth } from '../rbac-admin-b24';
import { sql } from '../db';

// =====================
// CLIENTS ROUTES
// =====================

// GET /api/admin/clients - Listing + Detail avec switch
export const adminClientsGET = createRoute({
  path: '/api/admin/clients',
  method: 'GET',
  description: 'List clients or get single client (with strategy switch)',
  auth: ['admin', 'manager', 'operator', 'viewer'],
  strategies: {
    // Stratégie QUERY - Utilise ?id= pour le détail
    query: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(
        async (request: NextRequest) => {
          try {
            const { query } = params;
            
            // Si ID fourni, retourner client unique
            if (query.id) {
              return await getSingleClientQuery(query.id);
            }
            
            // Sinon, retourner la liste
            return await getClientsList(query);
            
          } catch (error) {
            console.error('[Admin Clients Query] Error:', error);
            return NextResponse.json({ error: 'Query strategy failed' }, { status: 500 });
          }
        }
      )(req);
    },

    // Stratégie DYNAMIC - Pour quand Vercel sera fixé
    dynamic: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(
        async (request: NextRequest) => {
          try {
            // Toujours retourner la liste en dynamic (detail sera dans [id]/route.ts)
            return await getClientsList(params.query);
            
          } catch (error) {
            console.error('[Admin Clients Dynamic] Error:', error);
            return NextResponse.json({ error: 'Dynamic strategy failed' }, { status: 500 });
          }
        }
      )(req);
    },

    // Stratégie HYBRID - Détecte automatiquement
    hybrid: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(
        async (request: NextRequest) => {
          try {
            // Essaie dynamic d'abord, fallback sur query
            if (params.path.id) {
              // On a un path param, utiliser dynamic logic
              return await getSingleClientQuery(params.path.id);
            } else if (params.query.id) {
              // On a un query param, utiliser query logic  
              return await getSingleClientQuery(params.query.id);
            } else {
              // Pas d'ID, retourner liste
              return await getClientsList(params.query);
            }
            
          } catch (error) {
            console.error('[Admin Clients Hybrid] Error:', error);
            return NextResponse.json({ error: 'Hybrid strategy failed' }, { status: 500 });
          }
        }
      )(req);
    }
  }
});

// POST /api/admin/clients - Création client
export const adminClientsPOST = createRoute({
  path: '/api/admin/clients',
  method: 'POST',
  description: 'Create new client',
  auth: ['admin', 'manager'],
  strategies: {
    query: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager'])(
        async (request: NextRequest, user: any) => {
          try {
            const body = await request.json();
            return await createClient(body, user);
          } catch (error) {
            console.error('[Admin Clients Create] Error:', error);
            return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
          }
        }
      )(req);
    },
    dynamic: async (req: NextRequest, params: RouteParams) => {
      // Même logique pour create (pas de différence entre strategies pour POST)
      return withAdminAuth(['admin', 'manager'])(
        async (request: NextRequest, user: any) => {
          try {
            const body = await request.json();
            return await createClient(body, user);
          } catch (error) {
            console.error('[Admin Clients Create Dynamic] Error:', error);
            return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
          }
        }
      )(req);
    }
  }
});

// =====================
// HELPER FUNCTIONS
// =====================

// Récupérer un client unique
async function getSingleClientQuery(clientId: string) {
  console.log(`[API Router] Getting single client: ${clientId}`);
  
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
      c.created_by
    FROM clients c
    WHERE c.deleted_at IS NULL AND c.id = ${clientId}::uuid
    LIMIT 1
  `;
  
  if (result.length === 0) {
    return NextResponse.json({ 
      error: 'Client non trouvé',
      clientId,
      strategy: 'query'
    }, { status: 404 });
  }
  
  const row = result[0];
  
  // Get project counts separately
  let projets_count = 0;
  let projets_actifs = 0;
  
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
  
  const client = {
    id: row.id,
    nom: row.nom,
    email: row.contact_principal?.email || '',
    secteur: row.secteur || '',
    taille: row.taille || 'PME',
    contact_principal: row.contact_principal || null,
    contexte_specifique: row.contexte_specifique || '',
    statut: row.statut || 'actif',
    projets_count,
    projets_actifs,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by || 'system',
    _strategy: 'query' // Debug info
  };
  
  return NextResponse.json(client);
}

// Récupérer la liste des clients
async function getClientsList(query: Record<string, string>) {
  console.log(`[API Router] Getting clients list with filters:`, query);
  
  const search = query.search || '';
  const statut = query.statut || '';
  const taille = query.taille || '';
  const secteur = query.secteur || '';
  
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
  
  // Apply filters in memory
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
  
  const items = filteredResult.map((row: any) => ({
    id: row.id,
    nom: row.nom,
    email: row.contact_principal?.email || '',
    secteur: row.secteur || '',
    taille: row.taille || 'PME',
    contact_principal: row.contact_principal || null,
    contact_nom: row.contact_principal?.nom || '',
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
    totalPages: 1,
    _strategy: 'list'
  });
}

// Créer un nouveau client
async function createClient(body: any, user: any) {
  console.log(`[API Router] Creating client for user:`, user?.id);
  
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

  const clientId = crypto.randomUUID();
  
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
    created_by: client.created_by,
    _strategy: 'create'
  });
}