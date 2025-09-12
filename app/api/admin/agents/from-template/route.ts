import { NextRequest, NextResponse } from 'next/server';
import { requireManager } from '@/lib/rbac-admin-b24';
import { sql } from '@/lib/db';
import { log } from '@/lib/logger';
import { z } from 'zod';

// Schema validation for creating agent from template
const createFromTemplateSchema = z.object({
  template_id: z.string().uuid(),
  project_id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  customization: z.object({
    temperature: z.number().min(0).max(1).optional(),
    max_tokens: z.number().min(1).max(10000).optional(),
    tools: z.array(z.string()).optional(),
    policies: z.array(z.string()).optional(),
    provider_preference: z.enum(['claude', 'gpt', 'gemini']).optional(),
    wake_prompt_override: z.string().optional()
  }).optional()
});

// POST /api/admin/agents/from-template - Create agent from template
export const POST = requireManager()(
  async (req: NextRequest, user: any) => {
    try {
      const body = await req.json();
      
      // Validate input
      const validatedData = createFromTemplateSchema.parse(body);
      
      // Fetch template
      const [template] = await sql`
        SELECT * FROM agent_templates 
        WHERE id = ${validatedData.template_id} AND is_active = true
      `;
      
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found or inactive' },
          { status: 404 }
        );
      }
      
      // Check if project exists
      const [project] = await sql`
        SELECT id, client_id, name as project_name, status
        FROM projects 
        WHERE id = ${validatedData.project_id}
      `;
      
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      // Get client context for prompt adaptation
      const [client] = await sql`
        SELECT name as client_name, metadata
        FROM clients 
        WHERE id = ${project.client_id}
      `;
      
      // Get hierarchical context
      const contextHierarchy = await getContextHierarchy(
        project.client_id,
        validatedData.project_id
      );
      
      // Merge configurations: template -> context -> customization
      const finalConfig = {
        ...template.default_config,
        ...contextHierarchy.effective_config,
        ...validatedData.customization
      };
      
      // Adapt base prompt to project/client context
      const adaptedPrompt = adaptPromptToContext(
        template.base_prompt,
        {
          client_name: client?.client_name || 'Client',
          project_name: project.project_name,
          client_metadata: client?.metadata || {},
          context: contextHierarchy
        }
      );
      
      // Use custom wake prompt if provided, otherwise use adapted prompt
      const wakePrompt = validatedData.customization?.wake_prompt_override || adaptedPrompt;
      
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
          metrics,
          created_by
        ) VALUES (
          ${validatedData.template_id},
          ${validatedData.project_id},
          ${project.client_id},
          ${validatedData.name},
          ${template.slug},
          ${template.category},
          ${JSON.stringify(finalConfig)},
          ${JSON.stringify(contextHierarchy)},
          ${wakePrompt},
          'configuring',
          ${JSON.stringify({
            template_version: template.version,
            setup_estimated_minutes: template.estimated_setup_minutes,
            capabilities_count: template.capabilities?.length || 0
          })},
          ${user.email}
        ) RETURNING *
      `;
      
      // Initialize agent in context hierarchy
      await sql`
        INSERT INTO context_hierarchy (
          level, entity_id, configuration, 
          parent_level, parent_entity_id, metadata
        ) VALUES (
          'agent',
          ${newAgent.id},
          ${JSON.stringify(finalConfig)},
          'project',
          ${validatedData.project_id.toString()},
          ${JSON.stringify({
            template_id: validatedData.template_id,
            template_name: template.name,
            created_from_template: true
          })}
        ) ON CONFLICT (level, entity_id) DO UPDATE
        SET configuration = EXCLUDED.configuration,
            metadata = EXCLUDED.metadata,
            updated_at = NOW()
      `;
      
      log('info', 'agent_created_from_template', { 
        route: '/api/admin/agents/from-template', 
        status: 201,
        user: user.email,
        agent_id: newAgent.id,
        template_id: validatedData.template_id,
        project_id: validatedData.project_id
      });
      
      // Return enriched response
      return NextResponse.json({
        ...newAgent,
        template_info: {
          id: template.id,
          name: template.name,
          category: template.category,
          version: template.version
        },
        project_info: {
          id: project.id,
          name: project.project_name,
          client_name: client?.client_name
        },
        setup_guidance: {
          estimated_minutes: template.estimated_setup_minutes,
          required_integrations: template.required_integrations || [],
          preview_tasks: template.preview_tasks || [],
          next_steps: [
            'Review and adjust configuration if needed',
            'Test agent with preview tasks',
            'Activate agent when ready'
          ]
        }
      }, { status: 201 });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      
      log('error', 'agent_from_template_failed', { 
        route: '/api/admin/agents/from-template', 
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return NextResponse.json(
        { error: 'Failed to create agent from template' },
        { status: 500 }
      );
    }
  }
);

// Helper function to get context hierarchy
async function getContextHierarchy(clientId: string, projectId: number) {
  const contexts = await sql`
    SELECT level, entity_id, configuration, overrides, metadata
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
  
  // Build hierarchy tree and compute effective config
  const hierarchy: any = {
    arka: null,
    client: null,
    project: null,
    effective_config: {}
  };
  
  for (const ctx of contexts) {
    hierarchy[ctx.level] = {
      configuration: ctx.configuration,
      overrides: ctx.overrides,
      metadata: ctx.metadata
    };
    
    // Merge into effective config
    hierarchy.effective_config = {
      ...hierarchy.effective_config,
      ...ctx.configuration,
      ...(ctx.overrides || {})
    };
  }
  
  return hierarchy;
}

// Helper function to adapt prompt to context
function adaptPromptToContext(
  basePrompt: string, 
  context: {
    client_name: string;
    project_name: string;
    client_metadata: any;
    context: any;
  }
): string {
  let adaptedPrompt = basePrompt;
  
  // Replace placeholders
  adaptedPrompt = adaptedPrompt
    .replace(/\{client_name\}/g, context.client_name)
    .replace(/\{project_name\}/g, context.project_name);
  
  // Add context-specific instructions
  const contextInstructions: string[] = [];
  
  if (context.context.effective_config.language) {
    contextInstructions.push(
      `Langue principale: ${context.context.effective_config.language}`
    );
  }
  
  if (context.context.effective_config.timezone) {
    contextInstructions.push(
      `Fuseau horaire: ${context.context.effective_config.timezone}`
    );
  }
  
  if (context.client_metadata?.industry) {
    contextInstructions.push(
      `Secteur d'activité: ${context.client_metadata.industry}`
    );
  }
  
  if (context.client_metadata?.size) {
    contextInstructions.push(
      `Taille de l'entreprise: ${context.client_metadata.size}`
    );
  }
  
  if (contextInstructions.length > 0) {
    adaptedPrompt += `\n\nContexte spécifique:\n- ${contextInstructions.join('\n- ')}`;
  }
  
  return adaptedPrompt;
}