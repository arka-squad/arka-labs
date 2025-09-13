// ============================================
// lib/api-lite/setup.ts
// Configuration et enregistrement des routes
// ============================================

import { APILite } from './core';
import { corsMiddleware, validationMiddleware, rbacMiddleware, loggingMiddleware } from './middleware';
import { sql } from '../db';
import { withAdminAuth } from '../rbac-admin-b24';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================
// Configuration des environnements
// ============================================

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================
// Setup principal des routes
// ============================================

export function setupAPIRoutes(): APILite {
  const api = new APILite();

  // Middlewares globaux
  api.use(corsMiddleware({
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  }));

  // Logging en développement uniquement
  if (isDevelopment) {
    api.use(loggingMiddleware({ logBody: false, logHeaders: false }));
  }

  // ============================================
  // ROUTES SYSTÈME
  // ============================================

  // Health check (critique - doit être rapide)
  api.route('/api/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown'
      });
    })
    .build();

  // Stats du système (protégé par API key)
  api.route('/api/admin/router/stats')
    .get()
    .auth(true, true) // Require API key
    .handler(async (context) => {
      const stats = api.getStats();
      return NextResponse.json({
        ...stats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV
      });
    })
    .build();

  // Clear cache (admin uniquement)
  api.route('/api/admin/router/cache')
    .delete()
    .auth(true, true) // Require API key
    .handler(async (context) => {
      api.clearCache();
      return NextResponse.json({ message: 'Cache cleared' });
    })
    .build();

  // ============================================
  // ROUTES CLIENTS
  // ============================================

  // Liste des clients
  api.route('/api/admin/clients')
    .get()
    .middleware(rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] }))
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const search = context.query.search || '';
      const statut = context.query.statut || '';
      const taille = context.query.taille || '';
      const secteur = context.query.secteur || '';

      try {
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
          totalPages: 1
        });

      } catch (error) {
        console.error('Error listing clients:', error);
        return NextResponse.json(
          { error: 'Failed to list clients', code: 'CLIENTS_LIST_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Détail d'un client
  api.route('/api/admin/clients/:id')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const clientId = context.params.id;

      try {
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
            clientId
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
          created_by: row.created_by || 'system'
        };

        return NextResponse.json(client);

      } catch (error) {
        console.error('Error fetching single client:', error);
        return NextResponse.json(
          { error: 'Échec du chargement du client', code: 'CLIENT_FETCH_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Création d'un client
  api.route('/api/admin/clients')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          nom: { type: 'string', required: true, min: 1, max: 255 },
          secteur: { type: 'string', required: true, min: 1, max: 255 },
          taille: { type: 'enum', values: ['TPE', 'PME', 'ETI', 'GE'] },
          contact_principal: { type: 'string', required: true }, // JSON object validation would need custom logic
          contexte_specifique: { type: 'string', max: 2000 },
          statut: { type: 'enum', values: ['actif', 'inactif', 'prospect', 'archive'] }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const user = context.metadata.get('user');
      const body = context.metadata.get('body');

      const {
        nom,
        secteur,
        taille = 'PME',
        contact_principal,
        contexte_specifique = '',
        statut = 'actif'
      } = body;

      try {
        // Validate contact_principal structure
        let parsedContact;
        if (typeof contact_principal === 'string') {
          parsedContact = JSON.parse(contact_principal);
        } else {
          parsedContact = contact_principal;
        }

        if (!parsedContact.nom || !parsedContact.email) {
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
            ${taille},
            ${JSON.stringify(parsedContact)},
            ${contexte_specifique},
            ${statut},
            ${user?.id || 'system'},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING id, nom, secteur, taille, contact_principal, contexte_specifique, statut, created_at, created_by
        `;

        const client = result[0];

        // Clear cache après création
        api.clearCache();

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
    })
    .build();

  // Modification d'un client
  api.route('/api/admin/clients/:id')
    .put()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } },
        body: {
          nom: { type: 'string', min: 1, max: 255 },
          secteur: { type: 'string', min: 1, max: 255 },
          taille: { type: 'enum', values: ['TPE', 'PME', 'ETI', 'GE'] },
          contexte_specifique: { type: 'string', max: 2000 },
          statut: { type: 'enum', values: ['actif', 'inactif', 'prospect', 'archive'] }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const clientId = context.params.id;
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

      try {
        // Check if client exists
        const [existingClient] = await sql`
          SELECT id FROM clients 
          WHERE id = ${clientId}::uuid AND deleted_at IS NULL
        `;

        if (!existingClient) {
          return NextResponse.json(
            { error: 'Client introuvable', clientId },
            { status: 404 }
          );
        }

        // Build update object
        const updateData: any = { updated_at: sql`NOW()` };
        
        if (body.nom) updateData.nom = body.nom;
        if (body.secteur) updateData.secteur = body.secteur;
        if (body.taille) updateData.taille = body.taille;
        if (body.contexte_specifique !== undefined) updateData.contexte_specifique = body.contexte_specifique;
        if (body.statut) updateData.statut = body.statut;
        if (body.contact_principal) {
          const parsedContact = typeof body.contact_principal === 'string' 
            ? JSON.parse(body.contact_principal) 
            : body.contact_principal;
          updateData.contact_principal = JSON.stringify(parsedContact);
        }

        const result = await sql`
          UPDATE clients 
          SET ${sql(updateData)}
          WHERE id = ${clientId}::uuid AND deleted_at IS NULL
          RETURNING *
        `;

        if (result.length === 0) {
          return NextResponse.json(
            { error: 'Échec de la mise à jour du client' },
            { status: 500 }
          );
        }

        const updatedClient = {
          ...result[0],
          contact_principal: typeof result[0].contact_principal === 'string' 
            ? JSON.parse(result[0].contact_principal) 
            : result[0].contact_principal
        };

        // Clear cache après modification
        api.clearCache();

        return NextResponse.json({
          success: true,
          ...updatedClient
        });

      } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json(
          { error: 'Échec de la mise à jour du client', code: 'CLIENT_UPDATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Suppression d'un client
  api.route('/api/admin/clients/:id')
    .delete()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin'] })
    )
    .handler(async (context) => {
      const clientId = context.params.id;
      const user = context.metadata.get('user');

      try {
        // Check if client exists
        const [existingClient] = await sql`
          SELECT id, nom FROM clients 
          WHERE id = ${clientId}::uuid AND deleted_at IS NULL
        `;

        if (!existingClient) {
          return NextResponse.json(
            { error: 'Client introuvable', clientId },
            { status: 404 }
          );
        }

        // Soft delete
        await sql`
          UPDATE clients 
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id = ${clientId}::uuid AND deleted_at IS NULL
        `;

        // Clear cache après suppression
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Client "${existingClient.nom}" supprimé avec succès`,
          deleted_id: clientId
        });

      } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
          { error: 'Échec de la suppression du client', code: 'CLIENT_DELETE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES PROJETS
  // ============================================

  // Liste des projets
  api.route('/api/admin/projects')
    .get()
    .middleware(rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] }))
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const search = context.query.search || '';
      const client_id = context.query.client_id || '';
      const status = context.query.status || '';
      const priority = context.query.priority || '';
      
      // Support pour récupérer un projet spécifique via query param
      const projectId = context.query.id;
      if (projectId) {
        return await getSingleProject(projectId);
      }

      try {
        const result = await sql`
          SELECT 
            p.id,
            p.nom,
            p.description,
            p.client_id,
            p.status,
            p.priority,
            p.budget,
            p.deadline,
            p.tags,
            p.requirements,
            p.created_at,
            p.updated_at,
            p.created_by,
            c.nom as client_name,
            c.secteur as client_secteur,
            c.taille as client_taille,
            COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_count,
            COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_count
          FROM projects p
          LEFT JOIN clients c ON p.client_id = c.id
          LEFT JOIN project_assignments pa ON p.id = pa.project_id
          LEFT JOIN project_squads ps ON p.id = ps.project_id
          WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL
          GROUP BY p.id, c.nom, c.secteur, c.taille
          ORDER BY p.created_at DESC
          LIMIT 100
        `;

        // Apply filters in memory for now
        let filteredResult = result;

        if (search) {
          const searchLower = search.toLowerCase();
          filteredResult = filteredResult.filter((row: any) =>
            row.nom?.toLowerCase().includes(searchLower) ||
            row.description?.toLowerCase().includes(searchLower) ||
            row.client_name?.toLowerCase().includes(searchLower)
          );
        }

        if (client_id && client_id !== '') {
          filteredResult = filteredResult.filter((row: any) => row.client_id === client_id);
        }

        if (status && status !== '') {
          filteredResult = filteredResult.filter((row: any) => row.status === status);
        }

        if (priority && priority !== '') {
          filteredResult = filteredResult.filter((row: any) => row.priority === priority);
        }

        const items = filteredResult.map((row: any) => ({
          id: row.id,
          nom: row.nom,
          description: row.description || '',
          client_id: row.client_id,
          client_name: row.client_name,
          client_secteur: row.client_secteur || '',
          client_taille: row.client_taille || '',
          status: row.status || 'draft',
          priority: row.priority || 'medium',
          budget: row.budget || null,
          deadline: row.deadline || null,
          tags: row.tags || [],
          requirements: row.requirements || {},
          agents_count: parseInt(row.agents_count) || 0,
          squads_count: parseInt(row.squads_count) || 0,
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
        console.error('Error listing projects:', error);
        return NextResponse.json(
          { error: 'Failed to list projects', code: 'PROJECTS_LIST_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Détail d'un projet
  api.route('/api/admin/projects/:id')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const projectId = context.params.id;
      return await getSingleProject(projectId);
    })
    .build();

  // Création d'un projet
  api.route('/api/admin/projects')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          nom: { type: 'string', required: true, min: 1, max: 255 },
          description: { type: 'string', max: 2000 },
          client_id: { type: 'uuid', required: true },
          status: { type: 'enum', values: ['draft', 'active', 'on_hold', 'completed', 'cancelled'] },
          priority: { type: 'enum', values: ['low', 'medium', 'high', 'urgent'] },
          budget: { type: 'number', min: 0 },
          deadline: { type: 'string' }, // Date string validation would need custom logic
          tags: { type: 'string' }, // JSON array validation would need custom logic
          requirements: { type: 'string' } // JSON object validation would need custom logic
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const user = context.metadata.get('user');
      const body = context.metadata.get('body');

      const {
        nom,
        description = '',
        client_id,
        status = 'draft',
        priority = 'medium',
        budget = null,
        deadline = null,
        tags = '[]',
        requirements = '{}'
      } = body;

      try {
        // Validate client exists
        const [client] = await sql`
          SELECT id FROM clients 
          WHERE id = ${client_id}::uuid AND deleted_at IS NULL
        `;

        if (!client) {
          return NextResponse.json(
            { error: 'Client introuvable' },
            { status: 400 }
          );
        }

        // Parse JSON fields
        let parsedTags, parsedRequirements;
        try {
          parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
          parsedRequirements = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
        } catch (e) {
          return NextResponse.json(
            { error: 'Format JSON invalide pour tags ou requirements' },
            { status: 400 }
          );
        }

        const projectId = crypto.randomUUID();

        const result = await sql`
          INSERT INTO projects (
            id,
            nom,
            description,
            client_id,
            status,
            priority,
            budget,
            deadline,
            tags,
            requirements,
            created_by,
            created_at,
            updated_at
          )
          VALUES (
            ${projectId},
            ${nom},
            ${description},
            ${client_id}::uuid,
            ${status},
            ${priority},
            ${budget},
            ${deadline ? new Date(deadline) : null},
            ${JSON.stringify(parsedTags)},
            ${JSON.stringify(parsedRequirements)},
            ${user?.id || 'system'},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING *
        `;

        const project = result[0];

        // Clear cache après création
        api.clearCache();

        return NextResponse.json({
          success: true,
          id: project.id,
          nom: project.nom,
          description: project.description,
          client_id: project.client_id,
          status: project.status,
          priority: project.priority,
          budget: project.budget,
          deadline: project.deadline,
          tags: project.tags,
          requirements: project.requirements,
          created_at: project.created_at,
          created_by: project.created_by
        });

      } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
          { error: 'Échec de la création du projet', code: 'PROJECT_CREATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Modification d'un projet
  api.route('/api/admin/projects/:id')
    .put()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } },
        body: {
          nom: { type: 'string', min: 1, max: 255 },
          description: { type: 'string', max: 2000 },
          status: { type: 'enum', values: ['draft', 'active', 'on_hold', 'completed', 'cancelled'] },
          priority: { type: 'enum', values: ['low', 'medium', 'high', 'urgent'] },
          budget: { type: 'number', min: 0 },
          deadline: { type: 'string' },
          tags: { type: 'string' },
          requirements: { type: 'string' }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const projectId = context.params.id;
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

      try {
        // Check if project exists
        const [existingProject] = await sql`
          SELECT id FROM projects 
          WHERE id = ${projectId}::uuid AND deleted_at IS NULL
        `;

        if (!existingProject) {
          return NextResponse.json(
            { error: 'Projet introuvable', projectId },
            { status: 404 }
          );
        }

        // Build update object
        const updateData: any = { updated_at: sql`NOW()` };
        
        if (body.nom) updateData.nom = body.nom;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.status) updateData.status = body.status;
        if (body.priority) updateData.priority = body.priority;
        if (body.budget !== undefined) updateData.budget = body.budget;
        if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null;
        
        if (body.tags) {
          const parsedTags = typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags;
          updateData.tags = JSON.stringify(parsedTags);
        }
        
        if (body.requirements) {
          const parsedReqs = typeof body.requirements === 'string' ? JSON.parse(body.requirements) : body.requirements;
          updateData.requirements = JSON.stringify(parsedReqs);
        }

        const result = await sql`
          UPDATE projects 
          SET ${sql(updateData)}
          WHERE id = ${projectId}::uuid AND deleted_at IS NULL
          RETURNING *
        `;

        if (result.length === 0) {
          return NextResponse.json(
            { error: 'Échec de la mise à jour du projet' },
            { status: 500 }
          );
        }

        const updatedProject = {
          ...result[0],
          tags: typeof result[0].tags === 'string' ? JSON.parse(result[0].tags) : result[0].tags,
          requirements: typeof result[0].requirements === 'string' ? JSON.parse(result[0].requirements) : result[0].requirements
        };

        // Clear cache après modification
        api.clearCache();

        return NextResponse.json({
          success: true,
          ...updatedProject
        });

      } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
          { error: 'Échec de la mise à jour du projet', code: 'PROJECT_UPDATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Suppression d'un projet
  api.route('/api/admin/projects/:id')
    .delete()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin'] })
    )
    .handler(async (context) => {
      const projectId = context.params.id;
      const user = context.metadata.get('user');

      try {
        // Check if project exists
        const [existingProject] = await sql`
          SELECT id, nom FROM projects 
          WHERE id = ${projectId}::uuid AND deleted_at IS NULL
        `;

        if (!existingProject) {
          return NextResponse.json(
            { error: 'Projet introuvable', projectId },
            { status: 404 }
          );
        }

        // Soft delete
        await sql`
          UPDATE projects 
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id = ${projectId}::uuid AND deleted_at IS NULL
        `;

        // Clear cache après suppression
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Projet "${existingProject.nom}" supprimé avec succès`,
          deleted_id: projectId
        });

      } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
          { error: 'Échec de la suppression du projet', code: 'PROJECT_DELETE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES AGENTS
  // ============================================

  // Liste des agents
  api.route('/api/admin/agents')
    .get()
    .middleware(rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] }))
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const project_id = context.query.project_id || '';
      const client_id = context.query.client_id || '';
      const status = context.query.status || 'active';
      const page = parseInt(context.query.page || '1');
      const limit = Math.min(parseInt(context.query.limit || '20'), 100);
      const offset = (page - 1) * limit;
      
      // Support pour récupérer un agent spécifique via query param
      const agentId = context.query.id;
      if (agentId) {
        return await getSingleAgent(agentId);
      }

      try {
        // Base query without filters for simplicity
        const result = await sql`
          SELECT 
            a.id,
            a.name,
            a.role,
            a.domaine,
            a.version,
            a.description,
            a.tags,
            a.status,
            a.temperature,
            a.max_tokens,
            a.created_at,
            a.updated_at,
            a.created_by,
            COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active' AND p.status = 'active') as projets_actifs,
            COUNT(DISTINCT pa.project_id) as projets_total,
            COUNT(DISTINCT sm.squad_id) FILTER (WHERE sm.status = 'active') as squads_count
          FROM agents a
          LEFT JOIN project_assignments pa ON a.id = pa.agent_id
          LEFT JOIN projects p ON pa.project_id = p.id AND p.deleted_at IS NULL
          LEFT JOIN squad_members sm ON a.id = sm.agent_id
          WHERE a.deleted_at IS NULL
          GROUP BY a.id
          ORDER BY a.created_at DESC
          LIMIT 100
        `;

        // Apply filters in memory for simplicity (can be optimized later)
        let filteredResult = result;

        if (status && status !== 'all') {
          filteredResult = filteredResult.filter((row: any) => row.status === status);
        }
        if (project_id) {
          // This would need a separate query to be fully accurate, but simplified for now
          // Could be improved with a more complex query structure
        }
        if (client_id) {
          // This would need a separate query to be fully accurate, but simplified for now
        }

        // Apply pagination in memory
        const startIndex = offset;
        const endIndex = startIndex + limit;
        const paginatedResult = filteredResult.slice(startIndex, endIndex);

        const agents = paginatedResult.map((row: any) => ({
          id: row.id,
          name: row.name,
          role: row.role || '',
          domaine: row.domaine || '',
          version: row.version || '1.0',
          description: row.description || '',
          tags: JSON.parse(row.tags || '[]'),
          status: row.status || 'active',
          temperature: row.temperature || 0.7,
          max_tokens: row.max_tokens || 2000,
          projets_actifs: parseInt(row.projets_actifs) || 0,
          projets_total: parseInt(row.projets_total) || 0,
          squads_count: parseInt(row.squads_count) || 0,
          created_at: row.created_at,
          updated_at: row.updated_at,
          created_by: row.created_by || 'system'
        }));

        return NextResponse.json({
          success: true,
          agents,
          pagination: {
            page,
            limit,
            total: agents.length,
            pages: Math.ceil(agents.length / limit)
          }
        });

      } catch (error) {
        console.error('Error listing agents:', error);
        return NextResponse.json(
          { error: 'Failed to list agents', code: 'AGENTS_LIST_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Détail d'un agent
  api.route('/api/admin/agents/:id')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const agentId = context.params.id;
      return await getSingleAgent(agentId);
    })
    .build();

  // Création d'un agent
  api.route('/api/admin/agents')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          name: { type: 'string', required: true, min: 2, max: 100 },
          role: { type: 'string', required: true, min: 3, max: 100 },
          domaine: { type: 'enum', values: ['RH', 'Tech', 'Marketing', 'Finance', 'Ops'] },
          project_id: { type: 'number', required: true },
          version: { type: 'string' },
          description: { type: 'string', max: 1000 },
          tags: { type: 'string' }, // JSON array
          prompt_system: { type: 'string', min: 10, max: 5000 },
          temperature: { type: 'number', min: 0, max: 2 },
          max_tokens: { type: 'number', min: 100, max: 8000 },
          status: { type: 'enum', values: ['active', 'inactive', 'archived'] }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const user = context.metadata.get('user');
      const body = context.metadata.get('body');

      const {
        name,
        role,
        domaine = 'Tech',
        project_id,
        version = '1.0',
        description = '',
        tags = '[]',
        prompt_system = '',
        temperature = 0.7,
        max_tokens = 2000,
        status = 'active'
      } = body;

      try {
        // Validate project exists
        const [project] = await sql`
          SELECT id, client_id FROM projects 
          WHERE id = ${project_id} AND deleted_at IS NULL
        `;

        if (!project) {
          return NextResponse.json(
            { error: 'Projet introuvable' },
            { status: 400 }
          );
        }

        // Parse JSON fields
        let parsedTags;
        try {
          parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        } catch (e) {
          return NextResponse.json(
            { error: 'Format JSON invalide pour tags' },
            { status: 400 }
          );
        }

        const agentId = crypto.randomUUID();

        const result = await sql`
          INSERT INTO agents (
            id,
            name,
            role,
            domaine,
            version,
            description,
            tags,
            prompt_system,
            temperature,
            max_tokens,
            status,
            created_by,
            created_at,
            updated_at
          )
          VALUES (
            ${agentId},
            ${name},
            ${role},
            ${domaine},
            ${version},
            ${description},
            ${JSON.stringify(parsedTags)},
            ${prompt_system},
            ${temperature},
            ${max_tokens},
            ${status},
            ${user?.id || 'system'},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING *
        `;

        const agent = result[0];

        // Assign to project if specified
        if (project_id) {
          await sql`
            INSERT INTO project_assignments (
              project_id,
              agent_id,
              status,
              created_at
            ) VALUES (
              ${project_id},
              ${agentId},
              'active',
              CURRENT_TIMESTAMP
            )
          `;
        }

        // Clear cache après création
        api.clearCache();

        return NextResponse.json({
          success: true,
          id: agent.id,
          name: agent.name,
          role: agent.role,
          domaine: agent.domaine,
          version: agent.version,
          description: agent.description,
          tags: agent.tags,
          status: agent.status,
          created_at: agent.created_at,
          created_by: agent.created_by
        });

      } catch (error) {
        console.error('Error creating agent:', error);
        return NextResponse.json(
          { error: 'Échec de la création de l\'agent', code: 'AGENT_CREATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Modification d'un agent
  api.route('/api/admin/agents/:id')
    .put()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } },
        body: {
          name: { type: 'string', min: 2, max: 100 },
          role: { type: 'string', min: 3, max: 100 },
          domaine: { type: 'enum', values: ['RH', 'Tech', 'Marketing', 'Finance', 'Ops'] },
          version: { type: 'string' },
          description: { type: 'string', max: 1000 },
          tags: { type: 'string' },
          prompt_system: { type: 'string', min: 10, max: 5000 },
          temperature: { type: 'number', min: 0, max: 2 },
          max_tokens: { type: 'number', min: 100, max: 8000 },
          status: { type: 'enum', values: ['active', 'inactive', 'archived'] }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const agentId = context.params.id;
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

      try {
        // Check if agent exists
        const [existingAgent] = await sql`
          SELECT id, name FROM agents 
          WHERE id = ${agentId}::uuid AND deleted_at IS NULL
        `;

        if (!existingAgent) {
          return NextResponse.json(
            { error: 'Agent introuvable', agentId },
            { status: 404 }
          );
        }

        // Check for name conflicts if name is being updated
        if (body.name && body.name !== existingAgent.name) {
          const [conflictingAgent] = await sql`
            SELECT id FROM agents 
            WHERE LOWER(name) = LOWER(${body.name}) 
            AND id != ${agentId}::uuid
            AND deleted_at IS NULL
          `;

          if (conflictingAgent) {
            return NextResponse.json(
              { error: 'Un agent avec ce nom existe déjà' },
              { status: 409 }
            );
          }
        }

        // Build update object
        const updateData: any = { updated_at: sql`NOW()` };
        
        if (body.name) updateData.name = body.name;
        if (body.role) updateData.role = body.role;
        if (body.domaine) updateData.domaine = body.domaine;
        if (body.version) updateData.version = body.version;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.prompt_system !== undefined) updateData.prompt_system = body.prompt_system;
        if (body.temperature !== undefined) updateData.temperature = body.temperature;
        if (body.max_tokens !== undefined) updateData.max_tokens = body.max_tokens;
        if (body.status) updateData.status = body.status;
        
        if (body.tags) {
          const parsedTags = typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags;
          updateData.tags = JSON.stringify(parsedTags);
        }

        const result = await sql`
          UPDATE agents 
          SET ${sql(updateData)}
          WHERE id = ${agentId}::uuid AND deleted_at IS NULL
          RETURNING *
        `;

        if (result.length === 0) {
          return NextResponse.json(
            { error: 'Échec de la mise à jour de l\'agent' },
            { status: 500 }
          );
        }

        const updatedAgent = {
          ...result[0],
          tags: typeof result[0].tags === 'string' ? JSON.parse(result[0].tags) : result[0].tags
        };

        // Clear cache après modification
        api.clearCache();

        return NextResponse.json({
          success: true,
          ...updatedAgent
        });

      } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json(
          { error: 'Échec de la mise à jour de l\'agent', code: 'AGENT_UPDATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Suppression d'un agent
  api.route('/api/admin/agents/:id')
    .delete()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'uuid', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin'] })
    )
    .handler(async (context) => {
      const agentId = context.params.id;
      const user = context.metadata.get('user');
      const force = context.query.force === 'true';

      try {
        // Check if agent exists
        const [existingAgent] = await sql`
          SELECT id, name FROM agents 
          WHERE id = ${agentId}::uuid AND deleted_at IS NULL
        `;

        if (!existingAgent) {
          return NextResponse.json(
            { error: 'Agent introuvable', agentId },
            { status: 404 }
          );
        }

        // Check for active assignments unless force is specified
        if (!force) {
          const [activeAssignmentsCount] = await sql`
            SELECT COUNT(*) as count
            FROM project_assignments pa
            JOIN projects p ON pa.project_id = p.id
            WHERE pa.agent_id = ${agentId}::uuid 
            AND pa.status = 'active'
            AND p.status = 'active'
            AND p.deleted_at IS NULL
          `;

          if (parseInt(activeAssignmentsCount.count) > 0) {
            return NextResponse.json(
              { 
                error: 'Cannot delete agent with active project assignments',
                active_assignments: parseInt(activeAssignmentsCount.count),
                suggestion: 'Use ?force=true to override or reassign projects first'
              },
              { status: 409 }
            );
          }
        }

        // Soft delete the agent
        await sql`
          UPDATE agents 
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id = ${agentId}::uuid AND deleted_at IS NULL
        `;

        // Deactivate all assignments when force deleting
        if (force) {
          await sql`
            UPDATE project_assignments
            SET status = 'inactive', updated_at = NOW()
            WHERE agent_id = ${agentId}::uuid AND status = 'active'
          `;

          await sql`
            UPDATE squad_members
            SET status = 'inactive', updated_at = NOW()
            WHERE agent_id = ${agentId}::uuid AND status = 'active'
          `;
        }

        // Clear cache après suppression
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Agent "${existingAgent.name}" supprimé avec succès`,
          deleted_id: agentId,
          force_used: force
        });

      } catch (error) {
        console.error('Error deleting agent:', error);
        return NextResponse.json(
          { error: 'Échec de la suppression de l\'agent', code: 'AGENT_DELETE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES SQUADS (à continuer...)
  // ============================================

  console.log('✅ API Routes configured successfully');
  return api;

// Helper function pour récupérer un agent détaillé
async function getSingleAgent(agentId: string) {
  try {
    const result = await sql`
      SELECT 
        a.*,
        COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active' AND p.status = 'active') as projets_actifs,
        COUNT(DISTINCT pa.project_id) as projets_total,
        COUNT(DISTINCT sm.squad_id) FILTER (WHERE sm.status = 'active') as squads_count,
        -- Performance metrics
        CASE 
          WHEN COUNT(DISTINCT pa.project_id) = 0 THEN 0
          ELSE LEAST(
            (CAST(SUBSTRING(a.version FROM '^([0-9]+)') AS INTEGER) * 20) +
            (COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active') * 15) +
            (COUNT(DISTINCT pa.project_id) * 8),
            100
          )
        END as performance_score
      FROM agents a
      LEFT JOIN project_assignments pa ON a.id = pa.agent_id
      LEFT JOIN projects p ON pa.project_id = p.id AND p.deleted_at IS NULL
      LEFT JOIN squad_members sm ON a.id = sm.agent_id
      WHERE a.id = ${agentId}::uuid AND a.deleted_at IS NULL
      GROUP BY a.id
    `;

    if (result.length === 0) {
      return NextResponse.json({
        error: 'Agent non trouvé',
        agentId
      }, { status: 404 });
    }

    const row = result[0];

    // Get active project assignments with project details
    const projectAssignments = await sql`
      SELECT 
        p.id,
        p.nom,
        p.status,
        p.priority,
        p.budget,
        p.deadline,
        pa.status as assignment_status,
        pa.created_at as assigned_at,
        c.nom as client_name,
        CASE 
          WHEN p.deadline < CURRENT_DATE THEN 'depassee'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'proche'
          ELSE 'ok'
        END as deadline_status
      FROM project_assignments pa
      JOIN projects p ON pa.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      WHERE pa.agent_id = ${agentId}::uuid 
      AND pa.status = 'active'
      AND p.deleted_at IS NULL
      ORDER BY pa.created_at DESC
    `;

    // Get squad memberships
    const squadMemberships = await sql`
      SELECT 
        s.id,
        s.name,
        s.slug,
        s.domain,
        sm.status as membership_status,
        sm.created_at as joined_at
      FROM squad_members sm
      JOIN squads s ON sm.squad_id = s.id
      WHERE sm.agent_id = ${agentId}::uuid
      AND sm.status = 'active'
      AND s.deleted_at IS NULL
      ORDER BY sm.created_at DESC
    `;

    const agent = {
      id: row.id,
      name: row.name,
      role: row.role || '',
      domaine: row.domaine || '',
      version: row.version || '1.0',
      description: row.description || '',
      tags: JSON.parse(row.tags || '[]'),
      prompt_system: row.prompt_system || '',
      temperature: row.temperature || 0.7,
      max_tokens: row.max_tokens || 2000,
      status: row.status || 'active',
      projets_actifs: parseInt(row.projets_actifs) || 0,
      projets_total: parseInt(row.projets_total) || 0,
      squads_count: parseInt(row.squads_count) || 0,
      performance_score: parseInt(row.performance_score) || 0,
      project_assignments: projectAssignments,
      squad_memberships: squadMemberships,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by || 'system'
    };

    return NextResponse.json(agent);

  } catch (error) {
    console.error('Error fetching single agent:', error);
    return NextResponse.json(
      { error: 'Échec du chargement de l\'agent', code: 'AGENT_FETCH_ERROR' },
      { status: 500 }
    );
  }
}

// Helper function pour récupérer un projet détaillé
async function getSingleProject(projectId: string) {
  try {
    const result = await sql`
      SELECT 
        p.*,
        c.nom as client_name,
        c.secteur as client_secteur,
        c.taille as client_taille,
        c.contact_principal as client_contact,
        COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_assigned,
        COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_assigned,
        -- Budget analysis
        CASE 
          WHEN p.deadline IS NOT NULL AND p.created_at IS NOT NULL THEN
            COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') * 400 * 
            GREATEST(1, EXTRACT(DAYS FROM (p.deadline - p.created_at)))
          ELSE 0
        END as estimated_cost,
        CASE 
          WHEN p.budget IS NOT NULL AND p.budget > 0 THEN
            ((COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') * 400 * 
              GREATEST(1, EXTRACT(DAYS FROM (COALESCE(p.deadline, p.created_at + INTERVAL '30 days') - p.created_at)))) 
              / p.budget) * 100
          ELSE 0
        END as budget_utilization_percent,
        -- Timeline analysis
        CASE 
          WHEN p.deadline IS NULL THEN 'no_deadline'
          WHEN p.deadline < CURRENT_DATE THEN 'overdue'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '3 days' THEN 'critical'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
          ELSE 'ok'
        END as deadline_status,
        CASE 
          WHEN p.created_at IS NOT NULL AND p.deadline IS NOT NULL THEN
            EXTRACT(DAYS FROM (p.deadline - p.created_at))
          ELSE NULL
        END as total_duration_days,
        CASE 
          WHEN p.deadline IS NOT NULL THEN
            EXTRACT(DAYS FROM (p.deadline - CURRENT_DATE))
          ELSE NULL
        END as days_remaining
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_assignments pa ON p.id = pa.project_id
      LEFT JOIN project_squads ps ON p.id = ps.project_id
      WHERE p.id = ${projectId}::uuid AND p.deleted_at IS NULL
      GROUP BY p.id, c.nom, c.secteur, c.taille, c.contact_principal
    `;

    if (result.length === 0) {
      return NextResponse.json({
        error: 'Projet non trouvé',
        projectId
      }, { status: 404 });
    }

    const row = result[0];

    const project = {
      id: row.id,
      nom: row.nom,
      description: row.description || '',
      client_id: row.client_id,
      client_name: row.client_name,
      client_secteur: row.client_secteur || '',
      client_taille: row.client_taille || '',
      client_contact: row.client_contact || null,
      status: row.status || 'draft',
      priority: row.priority || 'medium',
      budget: row.budget || null,
      deadline: row.deadline || null,
      tags: row.tags || [],
      requirements: row.requirements || {},
      agents_assigned: parseInt(row.agents_assigned) || 0,
      squads_assigned: parseInt(row.squads_assigned) || 0,
      estimated_cost: parseFloat(row.estimated_cost) || 0,
      budget_utilization_percent: parseFloat(row.budget_utilization_percent) || 0,
      deadline_status: row.deadline_status || 'ok',
      total_duration_days: parseInt(row.total_duration_days) || null,
      days_remaining: parseInt(row.days_remaining) || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by || 'system'
    };

    return NextResponse.json(project);

  } catch (error) {
    console.error('Error fetching single project:', error);
    return NextResponse.json(
      { error: 'Échec du chargement du projet', code: 'PROJECT_FETCH_ERROR' },
      { status: 500 }
    );
  }
}
}

// Export pour compatibilité avec l'ancien système
export { APILite };