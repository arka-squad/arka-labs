/**
 * API Lite Module: SYSTEM
 * Extrait du module misc - B28 Phase 2
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';

export function setupSystemRoutes(api: APILite) {
  console.log('🚀 Setup module system (1096 lignes)...');

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
            COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as projets_actifs
          FROM clients c
  api.route('/api/admin/clients/:id')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const clientId = context.params.id;

      try {
          }, { status: 404 });
        }

        const row = result[0];

              COUNT(*) FILTER (WHERE status = 'active') as actifs
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
            { status: 404 }
          );
        }

        // Soft delete
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES PROJETS
  // ============================================

  // Liste des projets
      const status = context.query.status || '';
            p.status,
            p.priority,
            p.budget,
            p.deadline,
            p.tags,
            p.requirements,
            p.created_at,
            COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_count
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
          status: row.status || 'draft',
          priority: row.priority || 'medium',
          budget: row.budget || null,
          deadline: row.deadline || null,
          tags: row.tags || [],
          requirements: row.requirements || {},
          { status: 500 }
        );
      }
    })
    .build();

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

            status,
            priority,
            budget,
            deadline,
            tags,
            requirements,
            created_by,
            created_at,
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

          { status: 500 }
        );
      }
    })
    .build();

  // Modification d'un projet
          status: { type: 'enum', values: ['draft', 'active', 'on_hold', 'completed', 'cancelled'] },
          priority: { type: 'enum', values: ['low', 'medium', 'high', 'urgent'] },
          budget: { type: 'number', min: 0 },
          deadline: { type: 'string' },
          tags: { type: 'string' },
          requirements: { type: 'string' }
        }
      }),
            { status: 404 }
          );
        }

        // Soft delete
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
      const status = context.query.status || 'active';
            a.version,
            a.description,
            a.tags,
            a.status,
            a.temperature,
            COUNT(DISTINCT sm.squad_id) FILTER (WHERE sm.status = 'active') as squads_count
        if (status && status !== 'all') {
          filteredResult = filteredResult.filter((row: any) => row.status === status);
        }
          version: row.version || '1.0',
          description: row.description || '',
          tags: JSON.parse(row.tags || '[]'),
          status: row.status || 'active',
          temperature: row.temperature || 0.7,
          { status: 500 }
        );
      }
    })
    .build();

          version: { type: 'string' },
          description: { type: 'string', max: 1000 },
          tags: { type: 'string' }, // JSON array
          prompt_system: { type: 'string', min: 10, max: 5000 },
          temperature: { type: 'number', min: 0, max: 2 },
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
        version = '1.0',
        description = '',
        tags = '[]',
        prompt_system = '',
        temperature = 0.7,
        status = 'active'
      } = body;

      try {
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

            version,
            description,
            tags,
            prompt_system,
            temperature,
            status,
            created_by,
            created_at,
            ${version},
            ${description},
            ${JSON.stringify(parsedTags)},
            ${prompt_system},
            ${temperature},
            ${status},
            ${user?.id || 'system'},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING *
        `;

              status,
              created_at
            ) VALUES (
          { status: 500 }
        );
      }
    })
    .build();

          version: { type: 'string' },
          description: { type: 'string', max: 1000 },
          tags: { type: 'string' },
          prompt_system: { type: 'string', min: 10, max: 5000 },
          temperature: { type: 'number', min: 0, max: 2 },
          status: { type: 'enum', values: ['active', 'inactive', 'archived'] }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
            { status: 404 }
          );
        }

              { status: 409 }
            );
          }
        }

        if (body.version) updateData.version = body.version;
        if (body.status) updateData.status = body.status;
        
        if (body.tags) {
          const parsedTags = typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags;
            { status: 500 }
          );
        }

          { status: 500 }
        );
      }
    })
    .build();

            { status: 404 }
          );
        }

        // Check for active assignments unless force is specified
        if (!force) {
            AND pa.status = 'active'
            AND p.status = 'active'
            AND p.deleted_at IS NULL
          `;

          if (parseInt(activeAssignmentsCount.count) > 0) {
            return NextResponse.json(
              { 
              { status: 409 }
            );
          }
        }

            SET status = 'inactive', updated_at = NOW()
            SET status = 'inactive', updated_at = NOW()
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES SQUADS
  // ============================================

  // Liste des squads
  api.route('/api/admin/squads')
    .get()
    .middleware(rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] }))
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const status = context.query.status || 'active';
      const offset = (page - 1) * limit;
      
            s.status,
            s.created_at,
          status: { type: 'enum', values: ['active', 'inactive', 'archived'] }
        }
      }),
  api.route('/api/admin/squads/:id')
    .put()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
        body: {
          name: { type: 'string', min: 3, max: 100 },
          mission: { type: 'string', max: 800 },
          status: { type: 'enum', values: ['active', 'inactive', 'archived'] }
        }
      }),
  api.route('/api/admin/squads/:id')
    .delete()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin'] })
    )
    .handler(async (context) => {
      const squadId = context.params.id;
      const user = context.metadata.get('user');
            { status: 404 }
          );
        }

        // Check for active members unless force is specified
        if (!force) {
            AND sm.status = 'active'
          `;

          if (parseInt(activeMembersCount.count) > 0) {
            return NextResponse.json(
              { 
                error: 'Cannot delete squad with active members',
                active_members: parseInt(activeMembersCount.count),
                suggestion: 'Use ?force=true to override or remove members first'
              },
              { status: 409 }
            );
          }
        }

        // Soft delete the squad
            SET status = 'inactive', updated_at = NOW()
            WHERE squad_id = ${squadId}::uuid AND status = 'active'
          `;
        }

        // Clear cache après suppression
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Squad "${existingSquad.name}" supprimé avec succès`,
          deleted_id: squadId,
          force_used: force
        });

      } catch (error) {
        console.error('Error deleting squad:', error);
        return NextResponse.json(
          { error: 'Échec de la suppression du squad', code: 'SQUAD_DELETE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES SQUAD MEMBERS
  // ============================================

  // Ajouter un membre au squad
  api.route('/api/admin/squads/:id/members')
    .post()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
        body: {
          status: { type: 'enum', values: ['active', 'inactive'] }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const squadId = context.params.id;
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

            { status: 404 }
          );
        }

            { status: 404 }
          );
        }

        // Check if already member
            SET status = ${status}, updated_at = NOW()
          status
        });

      } catch (error) {
        console.error('Error adding squad member:', error);
        return NextResponse.json(
          { error: 'Échec de l\'ajout du membre', code: 'SQUAD_MEMBER_ADD_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Supprimer un membre du squad
          AND sm.status = 'active'
        `;

        if (!member) {
          return NextResponse.json(
            { error: 'Membre introuvable dans ce squad' },
            { status: 404 }
          );
        }

        // Deactivate membership
          SET status = 'inactive', updated_at = NOW()
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES SQUAD INSTRUCTIONS
  // ============================================

  // Lister les instructions d'un squad
  api.route('/api/admin/squads/:id/instructions')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const squadId = context.params.id;
      const status = context.query.status || '';
            { status: 404 }
          );
        }

            status,
            priority,
            created_at,
        // Apply status filter if provided
        let instructions = result;
        if (status && status !== 'all') {
          instructions = instructions.filter((row: any) => row.status === status);
        }

        const formattedInstructions = instructions.map((row: any) => ({
          id: row.id,
          instruction: row.instruction,
          status: row.status || 'pending',
          priority: row.priority || 'medium',
          created_at: row.created_at,
          { status: 500 }
        );
      }
    })
    .build();

  // Créer une instruction pour un squad
  api.route('/api/admin/squads/:id/instructions')
    .post()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
        body: {
          instruction: { type: 'string', required: true, min: 10, max: 1000 },
          priority: { type: 'enum', values: ['low', 'medium', 'high', 'urgent'] },
          status: { type: 'enum', values: ['pending', 'in_progress', 'completed', 'cancelled'] }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const squadId = context.params.id;
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

      const {
        instruction,
        priority = 'medium',
        status = 'pending'
      } = body;

      try {
        // Verify squad exists
            { status: 404 }
          );
        }

        const instructionId = crypto.randomUUID();

            status,
            priority,
            created_by,
            created_at,
            ${status},
            ${priority},
            ${user?.id || 'system'},
            NOW(),
            NOW()
          )
          RETURNING *
        `;

        const newInstruction = result[0];

        // Clear cache
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Instruction ajoutée au squad "${squad.name}"`,
          id: newInstruction.id,
          squad_id: squadId,
          instruction: newInstruction.instruction,
          status: newInstruction.status,
          priority: newInstruction.priority,
          created_at: newInstruction.created_at,
          created_by: newInstruction.created_by
        });

      } catch (error) {
        console.error('Error creating squad instruction:', error);
        return NextResponse.json(
          { error: 'Échec de la création de l\'instruction', code: 'SQUAD_INSTRUCTION_CREATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
          { status: 500 }
        );
      }
    })
    .build();

            { status: 404 }
          );
        }

              { status: 404 }
            );
          }
        }

            status,
            template_id,
            created_by,
            created_at,
        }, { status: 201 });

      } catch (error) {
          { status: 500 }
        );
      }
    })
    .build();

            { status: 404 }
          );
        }

              { status: 404 }
            );
          }
        }

            status,
            template_id,
            created_by,
            created_at,
        }, { status: 201 });

      } catch (error) {
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES DOCUMENTS MANAGEMENT
  // ============================================

  // Lister les documents avec pagination et filtres
  api.route('/api/admin/documents')
    .get()
    .middleware(
      validationMiddleware({
          status: { type: 'enum', values: ['active', 'archived', 'processing'], required: false }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(180) // 3 minutes de cache
    .handler(async (context) => {
        if (status) {
          whereConditions.push(`d.status = $${params.length + 1}`);
          params.push(status);
        }

            d.status,
          ${status ? sql`AND d.status = ${status}` : sql``}
          ORDER BY d.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

          ${status ? sql`AND d.status = ${status}` : sql``}
        `;

        const items = documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          description: doc.description,
          type: doc.type,
          size_bytes: parseInt(doc.size_bytes) || 0,
          size_mb: Math.round((parseInt(doc.size_bytes) || 0) / 1024 / 1024 * 100) / 100,
          status: doc.status,
          { status: 500 }
        );
      }
    })
    .build();

              { status: 404 }
            );
          }
        }

        // Create document record
        const documentId = crypto.randomUUID();
        
            status,
          // For now, just update status to active
            SET status = 'active', updated_at = NOW()
            WHERE id = ${documentId}
          `;
        }

        // Clear cache
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Document "${name}" créé avec succès`,
          document: {
            id: newDocument.id,
            name: newDocument.name,
            description: newDocument.description,
            type: newDocument.type,
            size_bytes: newDocument.size_bytes,
            size_mb: Math.round((newDocument.size_bytes || 0) / 1024 / 1024 * 100) / 100,
            status: content ? 'active' : 'processing',
        }, { status: 201 });

      } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json(
          { error: 'Échec de la création du document', code: 'DOCUMENT_CREATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Récupérer un document spécifique par ID
  api.route('/api/admin/documents/:id')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const documentId = context.params.id;

      try {
            { status: 404 }
          );
        }

        return NextResponse.json({
          id: document.id,
          name: document.name,
          description: document.description,
          type: document.type,
          size_bytes: parseInt(document.size_bytes) || 0,
          size_mb: Math.round((parseInt(document.size_bytes) || 0) / 1024 / 1024 * 100) / 100,
          status: document.status,
          { status: 500 }
        );
      }
    })
    .build();

  // Supprimer un document (soft delete)
  api.route('/api/admin/documents/:id')
    .delete()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
          status: { type: 'enum', values: ['active', 'archived', 'closed'], required: false }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(120) // 2 minutes de cache (conversations changent souvent)
    .handler(async (context) => {
            t.status,
          ${status ? sql`AND t.status = ${status}` : sql``}
          ${status ? sql`AND t.status = ${status}` : sql``}
        `;

        const items = threads.map(thread => ({
          id: thread.id,
          title: thread.title,
          status: thread.status,
          { status: 500 }
        );
      }
    })
    .build();

  // Créer un nouveau thread de conversation
  api.route('/api/admin/threads')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          title: { type: 'string', required: true, min: 3, max: 200 },
              { status: 404 }
            );
          }
        }

              { status: 404 }
            );
          }
        }

        const threadId = crypto.randomUUID();

        // Create thread
            status,
            status: newThread.status,
        }, { status: 201 });

      } catch (error) {
        console.error('Error creating thread:', error);
        return NextResponse.json(
          { error: 'Échec de la création du thread', code: 'THREAD_CREATE_ERROR' },
          { status: 500 }
        );
      }
    })
    .build();

  // Récupérer les messages d'un thread
  api.route('/api/admin/threads/:id/messages')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
            p.status,
            COALESCE(AVG(CASE WHEN p.status = 'completed' AND p.deadline IS NOT NULL 
          GROUP BY p.id, p.name, p.status, p.completed_at, p.created_at
          ORDER BY (COUNT(DISTINCT a.id) + COUNT(DISTINCT t.id)) DESC
          LIMIT 10
        `;

        // Performance des squads
            COUNT(DISTINCT si.id) FILTER (WHERE si.status = 'completed') as completed_instructions,
            COUNT(DISTINCT si.id) as total_instructions,
            ROUND(
              (COUNT(DISTINCT si.id) FILTER (WHERE si.status = 'completed')::float / 
               NULLIF(COUNT(DISTINCT si.id), 0) * 100)::numeric, 2
            ) as completion_rate_percent
          FROM squads s
          LEFT JOIN squad_members sm ON s.id = sm.squad_id
  api.route('/api/admin/backoffice/users')
    .get()
    .middleware(
      validationMiddleware({
          status: { type: 'enum', values: ['active', 'inactive', 'suspended'], required: false }
        }
      }),
  api.route('/api/admin/backoffice/settings')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          category: { type: 'enum', values: ['system', 'security', 'features', 'performance'], required: true },
          key: { type: 'string', required: true, min: 1, max: 100 },
          value: { type: 'string', required: true, max: 1000 },
          description: { type: 'string', required: false, max: 500 }
        }
      }),
  api.route('/api/admin/backoffice/logs')
    .get()
    .middleware(
      validationMiddleware({
              ELSE 'System health check passed'
            END as message,
            (NOW() - (random() * interval '24 hours'))::timestamp as created_at
          FROM generate_series(1, ${limit + 10}) s
          { status: 500 }
        );
      }
    })
    .build();

  // ============================================
  // ROUTES FINALES - PHASE 9 (100% COMPLETION!)
  // ============================================

  // Analytics avancées pour performance monitoring
  api.route('/api/admin/analytics/performance')
    .get()
    .middleware(
      validationMiddleware({
          { status: 500 }
        );
      }
    })
    .build();

  // Gestion des intégrations et webhooks externes
  api.route('/api/admin/integrations/webhooks')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          name: { type: 'string', required: true, min: 3, max: 100 },
          url: { type: 'string', required: true, min: 10, max: 500 },
          events: { type: 'string', required: true }, // JSON array as string
          secret: { type: 'string', required: false, max: 255 },
          active: { type: 'enum', values: ['true', 'false'], required: false }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin'] }) // Seuls les admins peuvent créer des webhooks
    )
    .handler(async (context) => {
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

      const { name, url, events, secret, active = 'true' } = body;

      try {
        // Validate URL format
        try {
          new URL(url);
        } catch {
          return NextResponse.json(
            { error: 'URL invalide', code: 'INVALID_WEBHOOK_URL' },
            { status: 400 }
          );
        }

        // Validate events JSON
        let parsedEvents;
        try {
          parsedEvents = JSON.parse(events);
          if (!Array.isArray(parsedEvents)) {
            throw new Error('Events must be an array');
          }
        } catch {
          return NextResponse.json(
            { error: 'Events doit être un tableau JSON valide', code: 'INVALID_EVENTS_FORMAT' },
            { status: 400 }
          );
        }

        const webhookId = crypto.randomUUID();
        const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

        // Create webhook
              SELECT p.id, p.name, p.description, p.status, p.budget, p.deadline,
                     status, created_at, updated_at
        COUNT(DISTINCT si.id) FILTER (WHERE si.status = 'completed') as completed_instructions
      FROM squads s
      LEFT JOIN squad_members sm ON s.id = sm.squad_id
      LEFT JOIN squad_instructions si ON s.id = si.squad_id
      WHERE s.id = ${squadId}::uuid AND s.deleted_at IS NULL
      GROUP BY s.id
    `;

    if (result.length === 0) {
      return NextResponse.json({
        error: 'Squad non trouvé',
        squadId
      }, { status: 404 });
    }

    const row = result[0];

        sm.status as membership_status,
        sm.created_at as joined_at
      FROM squad_members sm
      AND sm.status = 'active'
      AND a.deleted_at IS NULL
      ORDER BY sm.created_at DESC
    `;

    // Get recent instructions
        status,
        priority,
        created_at,
      status: row.status || 'active',
      members_count: parseInt(row.members_count) || 0,
      total_instructions: parseInt(row.total_instructions) || 0,
      recent_instructions: parseInt(row.recent_instructions) || 0,
      completed_instructions: parseInt(row.completed_instructions) || 0,
      members,
      recent_instructions_list: recentInstructions,
      created_at: row.created_at,
      { status: 500 }
    );
  }
}

        COUNT(DISTINCT sm.squad_id) FILTER (WHERE sm.status = 'active') as squads_count,
        -- Performance metrics
        CASE 
            (CAST(SUBSTRING(a.version FROM '^([0-9]+)') AS INTEGER) * 20) +
      }, { status: 404 });
    }

    const row = result[0];

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
      AND pa.status = 'active'
      AND p.deleted_at IS NULL
      ORDER BY pa.created_at DESC
    `;

    // Get squad memberships
        sm.status as membership_status,
        sm.created_at as joined_at
      FROM squad_members sm
      JOIN squads s ON sm.squad_id = s.id
      AND sm.status = 'active'
      AND s.deleted_at IS NULL
      ORDER BY sm.created_at DESC
    `;

      version: row.version || '1.0',
      description: row.description || '',
      tags: JSON.parse(row.tags || '[]'),
      prompt_system: row.prompt_system || '',
      temperature: row.temperature || 0.7,
      status: row.status || 'active',
      projets_actifs: parseInt(row.projets_actifs) || 0,
      projets_total: parseInt(row.projets_total) || 0,
      squads_count: parseInt(row.squads_count) || 0,
      performance_score: parseInt(row.performance_score) || 0,
      { status: 500 }
    );
  }
}

        COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_assigned,
        -- Budget analysis
        CASE 
          WHEN p.deadline IS NOT NULL AND p.created_at IS NOT NULL THEN
        END as deadline_status,
        CASE 
          WHEN p.created_at IS NOT NULL AND p.deadline IS NOT NULL THEN
            EXTRACT(DAYS FROM (COALESCE(p.deadline, p.created_at + INTERVAL '30 days') - p.created_at))
          ELSE NULL
        END as total_duration_days,
        CASE 
          WHEN p.deadline IS NOT NULL THEN
            EXTRACT(DAYS FROM (p.deadline - CURRENT_DATE))
          ELSE NULL
      }, { status: 404 });
    }

    const row = result[0];

      status: row.status || 'draft',
      priority: row.priority || 'medium',
      budget: row.budget || null,
      deadline: row.deadline || null,
      tags: row.tags || [],
      requirements: row.requirements || {},
      deadline_status: row.deadline_status || 'ok',
      total_duration_days: parseInt(row.total_duration_days) || null,
      { status: 500 }
    );
  }
}
}

// Export pour compatibilité avec l'ancien système
export { APILite };

  console.log('✅ Module misc configuré');
}


  console.log('✅ Module system configuré');
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
