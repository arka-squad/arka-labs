/**
 * API Lite Module: AGENTS
 * Extrait du module misc - B28 Phase 2
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';

export function setupAgentsRoutes(api: APILite) {
  console.log('🚀 Setup module agents (950 lignes)...');

      const taille = context.query.taille || '';
        const result = await sql`
            c.taille,
            c.contact_principal,
            c.contexte_specifique,
            c.statut,
            c.created_at,
        const result = await sql`
            c.taille,
            c.contact_principal,
            c.contexte_specifique,
            c.statut,
            c.created_at,
          email: row.contact_principal?.email || '',
          secteur: row.secteur || '',
          taille: row.taille || 'PME',
          contact_principal: row.contact_principal || null,
          contexte_specifique: row.contexte_specifique || '',
          statut: row.statut || 'actif',
          projets_count,
          projets_actifs,
          created_at: row.created_at,
          taille: { type: 'enum', values: ['TPE', 'PME', 'ETI', 'GE'] },
          contact_principal: { type: 'string', required: true }, // JSON object validation would need custom logic
          contexte_specifique: { type: 'string', max: 2000 },
          statut: { type: 'enum', values: ['actif', 'inactif', 'prospect', 'archive'] }
        }
      }),
  api.route('/api/admin/clients/:id')
    .put()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
        body: {
          nom: { type: 'string', min: 1, max: 255 },
          secteur: { type: 'string', min: 1, max: 255 },
          taille: { type: 'enum', values: ['TPE', 'PME', 'ETI', 'GE'] },
          contexte_specifique: { type: 'string', max: 2000 },
          statut: { type: 'enum', values: ['actif', 'inactif', 'prospect', 'archive'] }
        }
      }),
  api.route('/api/admin/clients/:id')
    .delete()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin'] })
    )
    .handler(async (context) => {
      const clientId = context.params.id;
      const user = context.metadata.get('user');

      try {
        // Check if client exists
        const [existingClient] = await sql`
        await sql`
        const result = await sql`
            c.taille as client_taille,
            COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_count,
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

          client_taille: row.client_taille || '',
          agents_count: parseInt(row.agents_count) || 0,
          squads_count: parseInt(row.squads_count) || 0,
          created_at: row.created_at,
  // Détail d'un projet
        const [client] = await sql`
        const result = await sql`
        await sql`
  // ROUTES AGENTS
  // ============================================

  // Liste des agents
  api.route('/api/admin/agents')
    .get()
    .middleware(rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] }))
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      // Support pour récupérer un agent spécifique via query param
      const agentId = context.query.id;
      if (agentId) {
        return await getSingleAgent(agentId);
      }

      try {
        const result = await sql`
            a.domaine,
          FROM agents a
          LEFT JOIN squad_members sm ON a.id = sm.agent_id
          WHERE a.deleted_at IS NULL
          GROUP BY a.id
          ORDER BY a.created_at DESC
          LIMIT 100
        `;

        // Apply filters in memory for simplicity (can be optimized later)
        let filteredResult = result;

        const agents = paginatedResult.map((row: any) => ({
          id: row.id,
          name: row.name,
          role: row.role || '',
          domaine: row.domaine || '',
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
  // Détail d'un agent
  api.route('/api/admin/agents/:id')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
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
        domaine = 'Tech',
        const agentId = crypto.randomUUID();

        const result = await sql`
          INSERT INTO agents (
            id,
            name,
            role,
            domaine,
            ${agentId},
            ${name},
            ${role},
            ${domaine},
        const agent = result[0];

          await sql`
              agent_id,
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
  // Modification d'un agent
  api.route('/api/admin/agents/:id')
    .put()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
        body: {
          name: { type: 'string', min: 2, max: 100 },
          role: { type: 'string', min: 3, max: 100 },
          domaine: { type: 'enum', values: ['RH', 'Tech', 'Marketing', 'Finance', 'Ops'] },
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
        if (body.domaine) updateData.domaine = body.domaine;
        const result = await sql`
          UPDATE agents 
          WHERE id = ${agentId}::uuid AND deleted_at IS NULL
          RETURNING *
        `;

        if (result.length === 0) {
          return NextResponse.json(
            { error: 'Échec de la mise à jour de l\'agent' },
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
  // Suppression d'un agent
  api.route('/api/admin/agents/:id')
    .delete()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin'] })
    )
    .handler(async (context) => {
      const agentId = context.params.id;
      const user = context.metadata.get('user');
        // Check if agent exists
        const [existingAgent] = await sql`
          SELECT id, name FROM agents 
          WHERE id = ${agentId}::uuid AND deleted_at IS NULL
        `;

        if (!existingAgent) {
          return NextResponse.json(
            { error: 'Agent introuvable', agentId },
          const [activeAssignmentsCount] = await sql`
            WHERE pa.agent_id = ${agentId}::uuid 
        // Soft delete the agent
        await sql`
          UPDATE agents 
          WHERE id = ${agentId}::uuid AND deleted_at IS NULL
        `;

        // Deactivate all assignments when force deleting
        if (force) {
          await sql`
            WHERE agent_id = ${agentId}::uuid AND status = 'active'
          `;

          await sql`
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
      const domain = context.query.domain || '';
        return await getSingleSquad(squadId);
      }

      try {
        const result = await sql`
            s.domain,
            COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
            COUNT(DISTINCT si.id) FILTER (WHERE si.created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_instructions
          FROM squads s
          LEFT JOIN squad_members sm ON s.id = sm.squad_id
  api.route('/api/admin/squads/:id')
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
      return await getSingleSquad(squadId);
    })
    .build();

  // Création d'un squad
  api.route('/api/admin/squads')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          name: { type: 'string', required: true, min: 3, max: 100 },
          mission: { type: 'string', max: 800 },
          domain: { type: 'enum', values: ['RH', 'Tech', 'Marketing', 'Finance', 'Ops'], required: true },
          domain: { type: 'enum', values: ['RH', 'Tech', 'Marketing', 'Finance', 'Ops'] },
        const [existingSquad] = await sql`
          const [activeMembersCount] = await sql`
        await sql`
          await sql`
          agent_id: { type: 'uuid', required: true },
      const { agent_id, status = 'active' } = body;

      try {
        // Verify squad exists
        const [squad] = await sql`
        // Verify agent exists
        const [agent] = await sql`
          SELECT id, name FROM agents 
          WHERE id = ${agent_id}::uuid AND deleted_at IS NULL
        `;

        if (!agent) {
          return NextResponse.json(
            { error: 'Agent introuvable' },
        const [existingMember] = await sql`
          WHERE squad_id = ${squadId}::uuid AND agent_id = ${agent_id}::uuid
        `;

        if (existingMember) {
          await sql`
            WHERE squad_id = ${squadId}::uuid AND agent_id = ${agent_id}::uuid
          `;
        } else {
          // Create new membership
          await sql`
              squad_id, agent_id, status, created_at, updated_at
            ) VALUES (
              ${squadId}::uuid, ${agent_id}::uuid, ${status}, NOW(), NOW()
            )
          `;
        }

        // Clear cache
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Agent "${agent.name}" ${existingMember ? 'mis à jour dans' : 'ajouté au'} squad`,
          squad_id: squadId,
          agent_id: agent_id,
  api.route('/api/admin/squads/:id/members/:agentId')
    .delete()
    .middleware(
      validationMiddleware({
        params: { 
          id: { type: 'uuid', required: true },
          agentId: { type: 'uuid', required: true }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const squadId = context.params.id;
      const agentId = context.params.agentId;
      const user = context.metadata.get('user');

      try {
        // Verify membership exists
        const [member] = await sql`
          SELECT sm.id, a.name as agent_name, s.name as squad_name
          FROM squad_members sm
          JOIN agents a ON sm.agent_id = a.id
          JOIN squads s ON sm.squad_id = s.id
          WHERE sm.squad_id = ${squadId}::uuid 
          AND sm.agent_id = ${agentId}::uuid
        await sql`
          WHERE squad_id = ${squadId}::uuid AND agent_id = ${agentId}::uuid
        `;

        // Clear cache
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Agent "${member.agent_name}" retiré du squad "${member.squad_name}"`,
          squad_id: squadId,
          agent_id: agentId
        });

      } catch (error) {
        console.error('Error removing squad member:', error);
        return NextResponse.json(
          { error: 'Échec de la suppression du membre', code: 'SQUAD_MEMBER_REMOVE_ERROR' },
        const [squad] = await sql`
        const result = await sql`
        const [squad] = await sql`
        const result = await sql`
  // ROUTES TEMPLATES AGENTS
  // ============================================

  // Lister les templates d'agents disponibles
  api.route('/api/admin/agents/templates')
    .get()
    .middleware(
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(600) // 10 minutes de cache (templates changent peu)
    .handler(async (context) => {
      try {
        const templates = await sql`
            t.domain,
            t.template_config,
            t.default_prompt,
            t.tags,
            t.created_at,
          FROM agent_templates t
          LEFT JOIN agents a ON a.template_id = t.id AND a.deleted_at IS NULL
          WHERE t.is_active = true
          GROUP BY t.id
          ORDER BY t.usage_count DESC, t.created_at DESC
        `;

        return NextResponse.json({
          templates: templates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            domain: t.domain,
            config: t.template_config,
            default_prompt: t.default_prompt,
            tags: t.tags || [],
            usage_count: parseInt(t.usage_count) || 0,
            created_at: t.created_at,
        console.error('Error fetching agent templates:', error);
        return NextResponse.json(
          { error: 'Échec du chargement des templates', code: 'AGENT_TEMPLATES_FETCH_ERROR' },
  // Créer un agent depuis un template
  api.route('/api/admin/agents/from-template')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          template_id: { type: 'uuid', required: true },
          name: { type: 'string', required: true, min: 3, max: 100 },
        const [template] = await sql`
          SELECT * FROM agent_templates 
          WHERE id = ${template_id}::uuid AND is_active = true
        `;

        if (!template) {
          return NextResponse.json(
            { error: 'Template introuvable ou inactif' },
        // Create agent from template
        const agentId = crypto.randomUUID();
        const config = {
          ...template.template_config,
          ...(customizations ? JSON.parse(customizations) : {})
        };

        const result = await sql`
          INSERT INTO agents (
            id,
            name,
            prompt,
            config,
            tags,
            temperature,
            ${agentId},
            ${name},
            ${template.default_prompt},
            ${JSON.stringify(config)},
            ${JSON.stringify(template.tags || [])},
            ${config.temperature || 0.7},
        const newAgent = result[0];

          await sql`
          message: `Agent "${name}" créé depuis template "${template.name}"`,
          agent: {
            id: newAgent.id,
            name: newAgent.name,
            prompt: newAgent.prompt,
            config: newAgent.config,
            tags: newAgent.tags,
            temperature: newAgent.temperature,
            status: newAgent.status,
            template_id: newAgent.template_id,
            created_at: newAgent.created_at
          }
        console.error('Error creating agent from template:', error);
        return NextResponse.json(
          { error: 'Échec de la création de l\'agent depuis template', code: 'AGENT_FROM_TEMPLATE_ERROR' },
  // Dupliquer un agent existant
  api.route('/api/admin/agents/:id/duplicate')
    .post()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
        body: {
          name: { type: 'string', required: true, min: 3, max: 100 },
      const agentId = context.params.id;
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

        // Get original agent
        const [originalAgent] = await sql`
          SELECT * FROM agents 
          WHERE id = ${agentId}::uuid AND deleted_at IS NULL
        `;

        if (!originalAgent) {
          return NextResponse.json(
            { error: 'Agent source introuvable' },
        // Create duplicated agent
        const newAgentId = crypto.randomUUID();
        
        const result = await sql`
          INSERT INTO agents (
            id,
            name,
            prompt,
            config,
            tags,
            temperature,
            ${newAgentId},
            ${name},
            ${originalAgent.prompt},
            ${originalAgent.config},
            ${originalAgent.tags},
            ${originalAgent.temperature},
            ${originalAgent.template_id},
            ${user?.id || 'system'},
            NOW(),
            NOW()
          )
          RETURNING *
        `;

        const newAgent = result[0];

          await sql`
          message: `Agent "${name}" dupliqué depuis "${originalAgent.name}"`,
          agent: {
            id: newAgent.id,
            name: newAgent.name,
            prompt: newAgent.prompt,
            config: newAgent.config,
            tags: newAgent.tags,
            temperature: newAgent.temperature,
            status: newAgent.status,
            template_id: newAgent.template_id,
            created_at: newAgent.created_at,
            duplicated_from: agentId
          }
        console.error('Error duplicating agent:', error);
        return NextResponse.json(
          { error: 'Échec de la duplication de l\'agent', code: 'AGENT_DUPLICATE_ERROR' },
        const documents = await sql`
            u.email as uploaded_by_email
          FROM documents d
        const countResult = await sql`
          uploaded_by_email: doc.uploaded_by_email,
          created_at: doc.created_at,
        const result = await sql`
          await sql`
        const [document] = await sql`
            u.email as uploaded_by_email
          FROM documents d
          uploaded_by_email: document.uploaded_by_email,
          created_at: document.created_at,
          agent_id: { type: 'uuid', required: false },
        const threads = await sql`
            t.agent_id,
            t.created_by,
            t.created_at,
            a.name as agent_name,
            u.email as created_by_email,
            COUNT(DISTINCT m.id) as messages_count,
            MAX(m.created_at) as last_message_at
          FROM threads t
          LEFT JOIN agents a ON t.agent_id = a.id
          LEFT JOIN users u ON t.created_by = u.id
          LEFT JOIN thread_messages m ON t.id = m.thread_id
          WHERE t.deleted_at IS NULL
          ${agent_id ? sql`AND t.agent_id = ${agent_id}::uuid` : sql``}
          GROUP BY t.id, p.name, a.name, u.email
          ORDER BY COALESCE(MAX(m.created_at), t.created_at) DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

        const countResult = await sql`
          ${agent_id ? sql`AND t.agent_id = ${agent_id}::uuid` : sql``}
          agent_id: thread.agent_id,
          agent_name: thread.agent_name,
          created_by: thread.created_by,
          created_by_email: thread.created_by_email,
          messages_count: parseInt(thread.messages_count) || 0,
          last_message_at: thread.last_message_at,
          created_at: thread.created_at,
          agent_id: { type: 'uuid', required: false },
          initial_message: { type: 'string', required: false, max: 4000 }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator'] })
    )
    .handler(async (context) => {
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

        // Verify agent exists (if specified)
        if (agent_id) {
          const [agent] = await sql`
            SELECT id FROM agents 
            WHERE id = ${agent_id}::uuid AND deleted_at IS NULL
          `;
          
          if (!agent) {
            return NextResponse.json(
              { error: 'Agent introuvable' },
        const result = await sql`
            agent_id,
            created_by,
            created_at,
            ${agent_id || null},
            ${user?.id || 'system'},
            NOW(),
            NOW()
          )
          RETURNING *
        `;

        const newThread = result[0];

        // Add initial message if provided
        let initialMessageId = null;
        if (initial_message) {
          initialMessageId = crypto.randomUUID();
          await sql`
            agent_id: newThread.agent_id,
            created_by: newThread.created_by,
            created_at: newThread.created_at,
            messages_count: initial_message ? 1 : 0,
            initial_message_id: initialMessageId
          }
          sender_type: { type: 'enum', values: ['user', 'agent', 'system'], required: false }
        }
      }),
  // ============================================
  // ROUTES BACKOFFICE ADMINISTRATION
  // ============================================

  // Dashboard stats pour backoffice admin
  api.route('/api/admin/backoffice/stats')
    .get()
    .middleware(
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .cache(300) // 5 minutes de cache (stats ne changent pas trop vite)
    .handler(async (context) => {
      try {
        // Stats générales du système
        const [systemStats] = await sql`
            (SELECT COUNT(*) FROM agents WHERE deleted_at IS NULL) as total_agents,
        const [recentStats] = await sql`
            (SELECT COUNT(*) FROM agents WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as agents_last_30d,
            COUNT(DISTINCT a.id) as agents_count,
            COUNT(DISTINCT t.id) as threads_count,
          LEFT JOIN agents a ON pa.agent_id = a.id AND a.deleted_at IS NULL
        const squadPerformance = await sql`
            s.domain,
            COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as active_members,
        const logs = await sql`
              WHEN random() < 0.1 THEN 'Database connection failed'
        // Simulated performance analytics (en production: vraies métriques)
        const analytics = {
          timeframe,
          period_start: timeWindow.toISOString(),
          period_end: now.toISOString(),
          
          response_times: {
            avg_ms: Math.floor(150 + Math.random() * 100),
            p95_ms: Math.floor(300 + Math.random() * 200),
            p99_ms: Math.floor(500 + Math.random() * 300)
          },
          
          throughput: {
            total_requests: Math.floor(1000 + Math.random() * 5000),
            requests_per_minute: Math.floor(50 + Math.random() * 200),
            peak_rpm: Math.floor(100 + Math.random() * 400)
          },
          
          error_rates: {
            total_errors: Math.floor(Math.random() * 50),
            error_rate_percent: (Math.random() * 2).toFixed(2),
            top_errors: [
              { code: '401', count: Math.floor(Math.random() * 20) },
              { code: '404', count: Math.floor(Math.random() * 15) },
              { code: '500', count: Math.floor(Math.random() * 5) }
            ]
          },
          
          cache_performance: {
            hit_rate_percent: (75 + Math.random() * 20).toFixed(1),
            total_hits: Math.floor(800 + Math.random() * 2000),
            total_misses: Math.floor(200 + Math.random() * 500)
          },
          
          top_endpoints: [
            { path: '/api/admin/clients', requests: Math.floor(100 + Math.random() * 300), avg_ms: Math.floor(80 + Math.random() * 50) },
            { path: '/api/admin/agents', requests: Math.floor(70 + Math.random() * 150), avg_ms: Math.floor(85 + Math.random() * 55) },
            { path: '/api/admin/squads', requests: Math.floor(60 + Math.random() * 120), avg_ms: Math.floor(95 + Math.random() * 65) }
          ]
        };

        // Filter by specific metric if requested
        if (metric) {
          const filteredAnalytics: any = { timeframe, period_start: analytics.period_start, period_end: analytics.period_end };
          switch (metric) {
            case 'response_time':
              filteredAnalytics.response_times = analytics.response_times;
              break;
            case 'throughput':
              filteredAnalytics.throughput = analytics.throughput;
              break;
            case 'errors':
              filteredAnalytics.error_rates = analytics.error_rates;
              break;
            case 'cache_hits':
              filteredAnalytics.cache_performance = analytics.cache_performance;
              break;
          }
          return NextResponse.json(filteredAnalytics);
        }

        return NextResponse.json(analytics);

      } catch (error) {
        console.error('Error fetching performance analytics:', error);
        return NextResponse.json(
          { error: 'Échec du chargement des analytics', code: 'ANALYTICS_PERFORMANCE_ERROR' },
        const result = await sql`
  api.route('/api/admin/exports/data')
    .get()
    .middleware(
      validationMiddleware({
            const clients = await sql`
              SELECT id, name, email, company, status, created_at, updated_at
              FROM clients 
              WHERE deleted_at IS NULL ${dateFilter}
              ORDER BY created_at DESC
            `;
            data = { clients, count: clients.length };
            break;

          case 'agents':
            const agents = await sql`
              FROM agents 
              WHERE deleted_at IS NULL ${dateFilter}
              ORDER BY created_at DESC
            `;
            data = { agents, count: agents.length };
            break;

          case 'squads':
            const squads = await sql`
              SELECT s.id, s.name, s.mission, s.domain, s.status,
                     COUNT(DISTINCT sm.agent_id) as members_count,
  api.route('/api/admin/maintenance/cleanup')
    .post()
    .middleware(
      validationMiddleware({
        body: {
      rbacMiddleware({ required: true, roles: ['admin'] }) // Seuls les admins peuvent faire la maintenance
    )
    .handler(async (context) => {
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

      const { operation, force = 'false', dry_run = 'false' } = body;
      const isDryRun = dry_run === 'true';
      const isForce = force === 'true';

      try {
        const results: any = {};
        const startTime = Date.now();

        switch (operation) {
          case 'cache':
            // Clear API cache
            api.clearCache();
            results.cache = {
              operation: 'cleared',
              items_removed: 'all_cache_entries',
              dry_run: isDryRun
            };
            break;

          case 'logs':
            if (!isDryRun) {
              // En production: vraie suppression de logs anciens
              const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 jours
              results.logs = {
                operation: 'cleaned',
                cutoff_date: cutoffDate.toISOString(),
                estimated_removed: '1000+ old log entries',
                dry_run: isDryRun
              };
            } else {
              results.logs = {
                operation: 'simulated',
                would_remove: '~1000 log entries older than 30 days',
                dry_run: isDryRun
              };
            }
            break;

// Helper function pour récupérer un squad détaillé
async function getSingleSquad(squadId: string) {
  try {
    const result = await sql`
        COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
        COUNT(DISTINCT si.id) as total_instructions,
        COUNT(DISTINCT si.id) FILTER (WHERE si.created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_instructions,
    // Get active members with details
    const members = await sql`
        a.domaine,
        a.status as agent_status,
      JOIN agents a ON sm.agent_id = a.id
      WHERE sm.squad_id = ${squadId}::uuid
    const recentInstructions = await sql`
      domain: row.domain || 'Tech',
// Helper function pour récupérer un agent détaillé
async function getSingleAgent(agentId: string) {
  try {
    const result = await sql`
      FROM agents a
      LEFT JOIN squad_members sm ON a.id = sm.agent_id
      WHERE a.id = ${agentId}::uuid AND a.deleted_at IS NULL
      GROUP BY a.id
    `;

    if (result.length === 0) {
      return NextResponse.json({
        error: 'Agent non trouvé',
        agentId
      WHERE pa.agent_id = ${agentId}::uuid 
    const squadMemberships = await sql`
        s.domain,
      WHERE sm.agent_id = ${agentId}::uuid
    const agent = {
      id: row.id,
      name: row.name,
      role: row.role || '',
      domaine: row.domaine || '',
    return NextResponse.json(agent);

  } catch (error) {
    console.error('Error fetching single agent:', error);
    return NextResponse.json(
      { error: 'Échec du chargement de l\'agent', code: 'AGENT_FETCH_ERROR' },
// Helper function pour récupérer un projet détaillé
    const result = await sql`
        c.taille as client_taille,
        c.contact_principal as client_contact,
        COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_assigned,
            COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') * 400 * 
            GREATEST(1, EXTRACT(DAYS FROM (COALESCE(p.deadline, p.created_at + INTERVAL '30 days') - p.created_at)))
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
        END as days_remaining
      GROUP BY p.id, c.nom, c.secteur, c.taille, c.contact_principal
    `;

    if (result.length === 0) {
      return NextResponse.json({
        error: 'Projet non trouvé',
      client_taille: row.client_taille || '',
      client_contact: row.client_contact || null,
      agents_assigned: parseInt(row.agents_assigned) || 0,
      squads_assigned: parseInt(row.squads_assigned) || 0,
      estimated_cost: parseFloat(row.estimated_cost) || 0,
      budget_utilization_percent: parseFloat(row.budget_utilization_percent) || 0,
      days_remaining: parseInt(row.days_remaining) || null,
      created_at: row.created_at,

  console.log('✅ Module agents configuré');
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
