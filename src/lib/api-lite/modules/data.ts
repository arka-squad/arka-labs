/**
 * API Lite Module: DATA
 * Extrait du module misc - B28 Phase 2
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';

export function setupDataRoutes(api: APILite) {
  console.log('🚀 Setup module data (591 lignes)...');

import { sql } from '../../db';
import { sql } from '../db';
      const search = context.query.search || '';
      const statut = context.query.statut || '';
      const secteur = context.query.secteur || '';

      try {
          SELECT 
            c.id,
            c.nom,
            c.secteur,
            c.updated_at,
            c.created_by,
            COUNT(DISTINCT p.id) as projets_count,
          SELECT 
            c.id,
            c.nom,
            c.secteur,
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
            SELECT 
              COUNT(*) as total,
          updated_at: row.updated_at,
          created_by: row.created_by || 'system'
        };

        return NextResponse.json(client);

      } catch (error) {
        console.error('Error fetching single client:', error);
        return NextResponse.json(
          { error: 'Échec du chargement du client', code: 'CLIENT_FETCH_ERROR' },
          SELECT id, nom FROM clients 
          WHERE id = ${clientId}::uuid AND deleted_at IS NULL
        `;

        if (!existingClient) {
          return NextResponse.json(
            { error: 'Client introuvable', clientId },
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
      const search = context.query.search || '';
      const client_id = context.query.client_id || '';
      const priority = context.query.priority || '';
      
      // Support pour récupérer un projet spécifique via query param
          SELECT 
            p.id,
            p.nom,
            p.description,
            p.client_id,
            p.updated_at,
            p.created_by,
            c.nom as client_name,
            c.secteur as client_secteur,
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
          SELECT id FROM clients 
          WHERE id = ${client_id}::uuid AND deleted_at IS NULL
        `;

        if (!client) {
          return NextResponse.json(
            { error: 'Client introuvable' },
            updated_at
          )
          VALUES (
          SET deleted_at = NOW(), updated_at = NOW()
      const client_id = context.query.client_id || '';
      const page = parseInt(context.query.page || '1');
      const limit = Math.min(parseInt(context.query.limit || '20'), 100);
      const offset = (page - 1) * limit;
      
        // Base query without filters for simplicity
          SELECT 
            a.id,
            a.name,
            a.role,
            a.updated_at,
            a.created_by,
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

          updated_at: row.updated_at,
          created_by: row.created_by || 'system'
        }));

        return NextResponse.json({
          success: true,
            updated_at
          )
          VALUES (
        // Check for name conflicts if name is being updated
        // Build update object
        const updateData: any = { updated_at: sql`NOW()` };
        
        if (body.name) updateData.name = body.name;
        if (body.role) updateData.role = body.role;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.prompt_system !== undefined) updateData.prompt_system = body.prompt_system;
        if (body.temperature !== undefined) updateData.temperature = body.temperature;
          updateData.tags = JSON.stringify(parsedTags);
        }

          SET ${sql(updateData)}
      const force = context.query.force === 'true';

      try {
            SELECT COUNT(*) as count
          SET deleted_at = NOW(), updated_at = NOW()
            UPDATE squad_members
      const page = parseInt(context.query.page || '1');
      const limit = Math.min(parseInt(context.query.limit || '20'), 50);
      // Support pour récupérer un squad spécifique via query param
      const squadId = context.query.id;
      if (squadId) {
          SELECT 
            s.id,
            s.name,
            s.slug,
            s.mission,
            s.updated_at,
            s.created_by,
      const force = context.query.force === 'true';

      try {
        // Check if squad exists
          SELECT id, name FROM squads 
          WHERE id = ${squadId}::uuid AND deleted_at IS NULL
        `;

        if (!existingSquad) {
          return NextResponse.json(
            { error: 'Squad introuvable', squadId },
            SELECT COUNT(*) as count
            FROM squad_members sm
            WHERE sm.squad_id = ${squadId}::uuid 
          UPDATE squads 
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id = ${squadId}::uuid AND deleted_at IS NULL
        `;

        // Deactivate all members when force deleting
        if (force) {
            UPDATE squad_members
          SELECT id FROM squads 
          WHERE id = ${squadId}::uuid AND deleted_at IS NULL
        `;

        if (!squad) {
          return NextResponse.json(
            { error: 'Squad introuvable' },
          SELECT id FROM squad_members 
          // Update existing membership
            UPDATE squad_members 
            INSERT INTO squad_members (
          UPDATE squad_members 
      const limit = Math.min(parseInt(context.query.limit || '20'), 50);

      try {
        // Verify squad exists
          SELECT id, name FROM squads 
          WHERE id = ${squadId}::uuid AND deleted_at IS NULL
        `;

        if (!squad) {
          return NextResponse.json(
            { error: 'Squad introuvable' },
          SELECT 
            id,
            instruction,
            updated_at,
            created_by
          FROM squad_instructions
          WHERE squad_id = ${squadId}::uuid
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;

          updated_at: row.updated_at,
          created_by: row.created_by || 'system'
        }));

        return NextResponse.json({
          success: true,
          squad_id: squadId,
          squad_name: squad.name,
          instructions: formattedInstructions,
          total: formattedInstructions.length
        });

      } catch (error) {
        console.error('Error listing squad instructions:', error);
        return NextResponse.json(
          { error: 'Échec du chargement des instructions', code: 'SQUAD_INSTRUCTIONS_LIST_ERROR' },
          SELECT id, name FROM squads 
          WHERE id = ${squadId}::uuid AND deleted_at IS NULL
        `;

        if (!squad) {
          return NextResponse.json(
            { error: 'Squad introuvable' },
          INSERT INTO squad_instructions (
            id,
            squad_id,
            instruction,
            updated_at
          ) VALUES (
            ${instructionId},
            ${squadId}::uuid,
            ${instruction},
          SELECT 
            t.id,
            t.name,
            t.description,
            t.updated_at,
            COUNT(DISTINCT a.id) as usage_count
            updated_at: t.updated_at
          })),
          count: templates.length
        });

      } catch (error) {
            updated_at
          ) VALUES (
            updated_at
          ) VALUES (
        query: {
          page: { type: 'number', required: false },
          limit: { type: 'number', required: false },
      const page = Math.max(1, parseInt(context.query.page || '1'));
      const limit = Math.min(50, Math.max(1, parseInt(context.query.limit || '20')));
      const offset = (page - 1) * limit;
        // Simple query without complex joins for now
          SELECT 
            d.id,
            d.name,
            d.description,
            d.type,
            d.size_bytes,
            d.updated_at,
          ${type ? sql`AND d.type = ${type}` : sql``}
          SELECT COUNT(*) as count FROM documents d
          WHERE d.deleted_at IS NULL
          ${type ? sql`AND d.type = ${type}` : sql``}
          updated_at: doc.updated_at
        }));

        const totalCount = parseInt(countResult[0].count);
        const hasMore = offset + limit < totalCount;

        return NextResponse.json({
          items,
          page,
          limit,
          count: totalCount,
          has_more: hasMore,
          INSERT INTO documents (
            id,
            name,
            description,
            type,
            size_bytes,
            updated_at
          ) VALUES (
            ${documentId},
            ${name},
            ${description || ''},
            ${type},
            ${size_bytes},
            'processing',
            UPDATE documents 
          SELECT 
            d.*,
          updated_at: document.updated_at
        });

      } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
          { error: 'Échec du chargement du document', code: 'DOCUMENT_FETCH_ERROR' },
        query: {
          force: { type: 'enum', values: ['true', 'false'], required: false }
        }
      }),
  // ============================================
  // ROUTES THREADS/CHAT MANAGEMENT
  // ============================================

  // Lister les threads avec pagination et filtres
  api.route('/api/admin/threads')
    .get()
    .middleware(
      validationMiddleware({
        query: {
          page: { type: 'number', required: false },
          limit: { type: 'number', required: false },
      const page = Math.max(1, parseInt(context.query.page || '1'));
      const limit = Math.min(50, Math.max(1, parseInt(context.query.limit || '20')));
      const offset = (page - 1) * limit;
          SELECT 
            t.id,
            t.title,
            t.updated_at,
          SELECT COUNT(*) as count FROM threads t
          WHERE t.deleted_at IS NULL
          updated_at: thread.updated_at
        }));

        const totalCount = parseInt(countResult[0].count);
        const hasMore = offset + limit < totalCount;

        return NextResponse.json({
          items,
          page,
          limit,
          count: totalCount,
          has_more: hasMore,
          INSERT INTO threads (
            id,
            title,
            updated_at
          ) VALUES (
            ${threadId},
            ${title},
            'active',
            INSERT INTO thread_messages (
              id,
              thread_id,
              content,
              sender_type,
              sender_id,
              created_at
            ) VALUES (
              ${initialMessageId},
              ${threadId},
              ${initial_message},
              'user',
              ${user?.id || 'system'},
              NOW()
            )
          `;
        }

        // Clear cache
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Thread "${title}" créé avec succès`,
          thread: {
            id: newThread.id,
            title: newThread.title,
        query: {
          page: { type: 'number', required: false },
          limit: { type: 'number', required: false },
          since: { type: 'string', required: false } // ISO datetime
        }
      }),
  api.route('/api/admin/threads/:id/messages')
    .post()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
        body: {
          content: { type: 'string', required: true, min: 1, max: 4000 },
          SELECT 
            (SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL) as total_clients,
            (SELECT COUNT(*) FROM squads WHERE deleted_at IS NULL) as total_squads,
            (SELECT COUNT(*) FROM documents WHERE deleted_at IS NULL) as total_documents,
            (SELECT COUNT(*) FROM threads WHERE deleted_at IS NULL) as total_threads,
            (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users
        `;

        // Stats des 30 derniers jours
          SELECT 
            (SELECT COUNT(*) FROM threads WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as threads_last_30d,
            (SELECT COUNT(*) FROM thread_messages WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as messages_last_30d
        `;

        // Top projets par activité
          SELECT 
            p.id,
            p.name,
              THEN EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 3600 
              END), 0) as avg_completion_hours
          SELECT 
            s.id,
            s.name,
        query: {
          page: { type: 'number', required: false },
          limit: { type: 'number', required: false },
          role: { type: 'enum', values: ['admin', 'manager', 'operator', 'viewer'], required: false },
        query: {
          page: { type: 'number', required: false },
          limit: { type: 'number', required: false },
          level: { type: 'enum', values: ['error', 'warn', 'info', 'debug'], required: false },
          component: { type: 'string', required: false, max: 50 },
          since: { type: 'string', required: false } // ISO datetime
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .cache(60) // 1 minute de cache (logs récents)
    .handler(async (context) => {
      const page = Math.max(1, parseInt(context.query.page || '1'));
      const limit = Math.min(200, Math.max(1, parseInt(context.query.limit || '50')));
      const offset = (page - 1) * limit;
      const { level, component, since } = context.query;

      try {
        // For demo, we'll create some example logs since we don't have a real logs table
        // In production, you'd query actual system logs
        
          SELECT 
            'log_' || generate_random_uuid() as id,
            CASE 
              WHEN random() < 0.1 THEN 'error'
              WHEN random() < 0.3 THEN 'warn'
              WHEN random() < 0.8 THEN 'info'
              ELSE 'debug'
            END as level,
            CASE 
              WHEN random() < 0.2 THEN 'api-router'
              WHEN random() < 0.4 THEN 'database'
          ${level ? sql`WHERE level = ${level}` : sql``}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

        const items = logs
          .filter(log => !component || log.component === component)
          .filter(log => !since || log.created_at > new Date(since))
          .slice(0, limit)
          .map(log => ({
            id: log.id,
            level: log.level,
            component: log.component,
            message: log.message,
            created_at: log.created_at
          }));

        return NextResponse.json({
          logs: items,
          page,
          limit,
          count: items.length,
          has_more: items.length === limit,
          filters: { level, component, since: since || null },
          note: "Demo logs - En production, connecter à un système de logs réel"
        });

      } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json(
          { error: 'Échec du chargement des logs', code: 'BACKOFFICE_LOGS_ERROR' },
        query: {
          timeframe: { type: 'enum', values: ['1h', '24h', '7d', '30d'], required: false },
          metric: { type: 'enum', values: ['response_time', 'throughput', 'errors', 'cache_hits'], required: false }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .cache(180) // 3 minutes - analytics évoluent rapidement
    .handler(async (context) => {
      const timeframe = context.query.timeframe || '24h';
      const metric = context.query.metric;

      try {
        const now = new Date();
        let timeWindow: Date;
        
        switch (timeframe) {
          case '1h': timeWindow = new Date(now.getTime() - 60 * 60 * 1000); break;
          case '24h': timeWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
          case '7d': timeWindow = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
          case '30d': timeWindow = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
          default: timeWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        query: {
      const { type, format = 'json', date_from, date_to } = context.query;

      try {
        let data: any = {};
        const dateFilter = date_from && date_to ? 
          sql`AND created_at BETWEEN ${date_from} AND ${date_to}` : sql``;

        switch (type) {
          case 'clients':
                     c.name as client_name, p.created_at, p.updated_at
                     s.created_at, s.updated_at
              FROM squads s
      SELECT 
        s.*,
      SELECT 
        a.id,
        a.name,
        a.role,
      SELECT 
        id,
        instruction,
        updated_at
      FROM squad_instructions
      WHERE squad_id = ${squadId}::uuid
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const squad = {
      id: row.id,
      name: row.name,
      slug: row.slug || '',
      mission: row.mission || '',
      updated_at: row.updated_at,
      created_by: row.created_by || 'system'
    };

    return NextResponse.json(squad);

  } catch (error) {
    console.error('Error fetching single squad:', error);
    return NextResponse.json(
      { error: 'Échec du chargement du squad', code: 'SQUAD_FETCH_ERROR' },
      SELECT 
        a.*,
      SELECT 
        p.id,
        p.nom,
      SELECT 
        s.id,
        s.name,
        s.slug,
      updated_at: row.updated_at,
      created_by: row.created_by || 'system'
    };

      SELECT 
        p.*,
        c.nom as client_name,
        c.secteur as client_secteur,
      updated_at: row.updated_at,
      created_by: row.created_by || 'system'
    };


  console.log('✅ Module data configuré');
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
