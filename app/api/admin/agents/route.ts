import { NextRequest, NextResponse } from 'next/server';
import { requireManager, requireViewer } from '../../../../lib/rbac-admin-b24';
import { sql, getDb } from '@/lib/db';
import { log } from '@/lib/logger';
import { z } from 'zod';

// Schema validation for agent creation
const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  template_id: z.string().uuid().optional(),
  project_id: z.number().int().positive(),
  role: z.string().min(1).max(50),
  domaine: z.enum(['RH', 'Finance', 'Marketing', 'Operations', 'Support']),
  configuration: z.object({
    temperature: z.number().min(0).max(1).optional(),
    max_tokens: z.number().min(1).max(10000).optional(),
    tools: z.array(z.string()).optional(),
    policies: z.array(z.string()).optional(),
    provider_preference: z.enum(['claude', 'gpt', 'gemini']).optional()
  }).optional(),
  wake_prompt: z.string().optional()
});

// GET /api/admin/agents - List all agents
export const GET = requireViewer()(
  async (req: NextRequest, user: any) => {
    try {
      const url = new URL(req.url);
      const project_id = url.searchParams.get('project_id');
      const client_id = url.searchParams.get('client_id');
      const status = url.searchParams.get('status') || 'active';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          ai.*,
          at.name as template_name,
          at.category as template_category,
          p.name as project_name,
          c.name as client_name,
          COUNT(*) OVER() as total_count
        FROM agent_instances ai
        LEFT JOIN agent_templates at ON ai.template_id = at.id
        LEFT JOIN projects p ON ai.project_id = p.id
        LEFT JOIN clients c ON ai.client_id = c.id
        WHERE ai.deleted_at IS NULL
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (project_id) {
        query += ` AND ai.project_id = $${paramIndex++}`;
        params.push(parseInt(project_id));
      }

      if (client_id) {
        query += ` AND ai.client_id = $${paramIndex++}`;
        params.push(client_id);
      }

      if (status && status !== 'all') {
        query += ` AND ai.status = $${paramIndex++}`;
        params.push(status);
      }

      // Apply RBAC filters for non-admin users
      if (user.role === 'manager') {
        query += ` AND ai.created_by = $${paramIndex++}`;
        params.push(user.email);
      } else if (user.role === 'operator') {
        // Operators can only see agents from their assigned projects
        query += ` AND ai.project_id IN (
          SELECT project_id FROM user_project_assignments 
          WHERE user_id = $${paramIndex++}
        )`;
        params.push(user.id);
      }

      query += ` ORDER BY ai.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
      params.push(limit, offset);

      // Use direct database query for dynamic SQL
      const db = getDb();
      const result = await db.query(query, params);
      const rows = result.rows;
      
      const total = rows[0]?.total_count || 0;
      const agents = rows.map((row: any) => {
        const { total_count, ...agent } = row;
        return agent;
      });

      log('info', 'agents_listed', { 
        route: '/api/admin/agents', 
        status: 200,
        user: user.email,
        count: agents.length,
        filters: { project_id, client_id, status }
      });

      return NextResponse.json({
        agents,
        pagination: {
          page,
          limit,
          total: parseInt(total),
          pages: Math.ceil(parseInt(total) / limit)
        }
      });

    } catch (error) {
      log('error', 'agents_list_failed', { 
        route: '/api/admin/agents', 
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }
  }
);

// POST /api/admin/agents - Create new agent
export const POST = requireManager()(
  async (req: NextRequest, user: any) => {
    try {
      const body = await req.json();
      
      // Validate input
      const validatedData = createAgentSchema.parse(body);
      
      // Check if project exists and user has access
      const project = await sql`
        SELECT id, client_id FROM projects 
        WHERE id = ${validatedData.project_id}
      `;
      
      if (project.length === 0) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // If template_id provided, fetch template config
      let templateConfig = {};
      let templateData = null;
      if (validatedData.template_id) {
        const template = await sql`
          SELECT * FROM agent_templates 
          WHERE id = ${validatedData.template_id} AND is_active = true
        `;
        
        if (template.length === 0) {
          return NextResponse.json(
            { error: 'Template not found or inactive' },
            { status: 404 }
          );
        }
        
        templateData = template[0];
        templateConfig = templateData.default_config;
      }

      // Merge configurations (template -> custom)
      const finalConfig = {
        ...templateConfig,
        ...validatedData.configuration
      };

      // Get or create context for this agent
      const contextHierarchy = await getEffectiveContext(
        project[0].client_id,
        validatedData.project_id
      );

      // Create agent instance
      const [newAgent] = await sql`
        INSERT INTO agent_instances (
          template_id,
          project_id,
          client_id,
          name,
          role,
          domaine,
          configuration,
          context_config,
          wake_prompt,
          status,
          created_by
        ) VALUES (
          ${validatedData.template_id || null},
          ${validatedData.project_id},
          ${project[0].client_id},
          ${validatedData.name},
          ${validatedData.role},
          ${validatedData.domaine},
          ${JSON.stringify(finalConfig)},
          ${JSON.stringify(contextHierarchy)},
          ${validatedData.wake_prompt || templateData?.base_prompt || ''},
          'configuring',
          ${user.email}
        ) RETURNING *
      `;

      // Initialize agent context in hierarchy
      await sql`
        INSERT INTO context_hierarchy (
          level, entity_id, configuration, parent_level, parent_entity_id
        ) VALUES (
          'agent',
          ${newAgent.id},
          ${JSON.stringify(finalConfig)},
          'project',
          ${validatedData.project_id.toString()}
        ) ON CONFLICT (level, entity_id) DO UPDATE
        SET configuration = EXCLUDED.configuration,
            updated_at = NOW()
      `;

      log('info', 'agent_created', { 
        route: '/api/admin/agents', 
        status: 201,
        user: user.email,
        agent_id: newAgent.id,
        project_id: validatedData.project_id
      });

      return NextResponse.json(newAgent, { status: 201 });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }

      log('error', 'agent_creation_failed', { 
        route: '/api/admin/agents', 
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return NextResponse.json(
        { error: 'Failed to create agent' },
        { status: 500 }
      );
    }
  }
);

// Helper function to get effective context hierarchy
async function getEffectiveContext(clientId: string, projectId: number) {
  const contexts = await sql`
    SELECT level, configuration, overrides
    FROM context_hierarchy
    WHERE (level = 'arka' AND entity_id = 'global')
       OR (level = 'client' AND entity_id = ${clientId})
       OR (level = 'project' AND entity_id = ${projectId.toString()})
    ORDER BY 
      CASE level 
        WHEN 'arka' THEN 1
        WHEN 'client' THEN 2
        WHEN 'project' THEN 3
      END
  `;

  // Merge contexts hierarchically
  let effectiveConfig = {};
  for (const context of contexts) {
    effectiveConfig = {
      ...effectiveConfig,
      ...context.configuration,
      ...(context.overrides || {})
    };
  }

  return effectiveConfig;
}