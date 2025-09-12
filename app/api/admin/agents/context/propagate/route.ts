import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/rbac-admin-b24';
import { sql } from '@/lib/db';
import { log } from '@/lib/logger';
import { z } from 'zod';

// Schema validation for context propagation
const propagateContextSchema = z.object({
  level: z.enum(['arka', 'client', 'project', 'agent']),
  entity_id: z.string(),
  configuration: z.record(z.any()),
  overrides: z.record(z.any()).optional(),
  propagate_to_children: z.boolean().default(true),
  preserve_local_overrides: z.boolean().default(true)
});

// POST /api/admin/agents/context/propagate - Propagate context changes
export const POST = requireAdmin()(
  async (req: NextRequest, user: any) => {
    try {
      const body = await req.json();
      
      // Validate input
      const validatedData = propagateContextSchema.parse(body);
      
      // Start transaction for atomic updates
      await sql`BEGIN`;
      
      try {
        // Update or insert context at specified level
        await sql`
          INSERT INTO context_hierarchy (
            level, entity_id, configuration, overrides, updated_at
          ) VALUES (
            ${validatedData.level},
            ${validatedData.entity_id},
            ${JSON.stringify(validatedData.configuration)},
            ${JSON.stringify(validatedData.overrides || {})},
            NOW()
          ) ON CONFLICT (level, entity_id) DO UPDATE
          SET configuration = EXCLUDED.configuration,
              overrides = EXCLUDED.overrides,
              updated_at = NOW()
        `;
        
        // Get affected entities for propagation
        let affectedEntities: any[] = [];
        
        if (validatedData.propagate_to_children) {
          switch (validatedData.level) {
            case 'arka':
              // Affects all clients, projects, and agents
              affectedEntities = await sql`
                SELECT 'client' as level, id::text as entity_id FROM clients
                UNION ALL
                SELECT 'project' as level, id::text as entity_id FROM projects
                UNION ALL
                SELECT 'agent' as level, id::text as entity_id FROM agent_instances
                WHERE deleted_at IS NULL
              `;
              break;
              
            case 'client':
              // Affects all projects and agents of this client
              affectedEntities = await sql`
                SELECT 'project' as level, id::text as entity_id 
                FROM projects WHERE client_id = ${validatedData.entity_id}
                UNION ALL
                SELECT 'agent' as level, ai.id::text as entity_id 
                FROM agent_instances ai
                WHERE ai.client_id = ${validatedData.entity_id}
                AND ai.deleted_at IS NULL
              `;
              break;
              
            case 'project':
              // Affects all agents of this project
              affectedEntities = await sql`
                SELECT 'agent' as level, id::text as entity_id 
                FROM agent_instances
                WHERE project_id = ${parseInt(validatedData.entity_id)}
                AND deleted_at IS NULL
              `;
              break;
              
            case 'agent':
              // No children to propagate to
              break;
          }
        }
        
        // Update effective configurations for affected entities
        for (const entity of affectedEntities) {
          await updateEffectiveConfiguration(
            entity.level,
            entity.entity_id,
            validatedData.preserve_local_overrides
          );
        }
        
        // Invalidate cache for all affected entities
        const cacheKeys = [
          `${validatedData.level}:${validatedData.entity_id}`,
          ...affectedEntities.map(e => `${e.level}:${e.entity_id}`)
        ];
        
        // Mark cache entries as expired
        if (cacheKeys.length > 0) {
          await sql`
            UPDATE config_cache 
            SET expires_at = NOW()
            WHERE cache_key = ANY(${cacheKeys})
          `;
        }
        
        // Commit transaction
        await sql`COMMIT`;
        
        // Log the propagation event
        log('info', 'context_propagated', { 
          route: '/api/admin/agents/context/propagate', 
          status: 200,
          user: user.email,
          level: validatedData.level,
          entity_id: validatedData.entity_id,
          affected_count: affectedEntities.length
        });
        
        return NextResponse.json({
          success: true,
          level: validatedData.level,
          entity_id: validatedData.entity_id,
          affected_entities: affectedEntities.length,
          cache_invalidated: cacheKeys.length,
          message: `Context propagated successfully to ${affectedEntities.length} entities`
        });
        
      } catch (error) {
        // Rollback transaction on error
        await sql`ROLLBACK`;
        throw error;
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      
      log('error', 'context_propagation_failed', { 
        route: '/api/admin/agents/context/propagate', 
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return NextResponse.json(
        { error: 'Failed to propagate context' },
        { status: 500 }
      );
    }
  }
);

// Helper function to update effective configuration for an entity
async function updateEffectiveConfiguration(
  level: string,
  entityId: string,
  preserveOverrides: boolean
): Promise<void> {
  // Get the hierarchy chain for this entity
  let hierarchyChain: any[] = [];
  
  switch (level) {
    case 'agent':
      const [agent] = await sql`
        SELECT project_id, client_id FROM agent_instances WHERE id = ${entityId}
      `;
      if (agent) {
        hierarchyChain = await sql`
          SELECT level, configuration, overrides
          FROM context_hierarchy
          WHERE (level = 'arka' AND entity_id = 'global')
             OR (level = 'client' AND entity_id = ${agent.client_id})
             OR (level = 'project' AND entity_id = ${agent.project_id.toString()})
             OR (level = 'agent' AND entity_id = ${entityId})
          ORDER BY 
            CASE level 
              WHEN 'arka' THEN 1
              WHEN 'client' THEN 2
              WHEN 'project' THEN 3
              WHEN 'agent' THEN 4
            END
        `;
      }
      break;
      
    case 'project':
      const [project] = await sql`
        SELECT client_id FROM projects WHERE id = ${parseInt(entityId)}
      `;
      if (project) {
        hierarchyChain = await sql`
          SELECT level, configuration, overrides
          FROM context_hierarchy
          WHERE (level = 'arka' AND entity_id = 'global')
             OR (level = 'client' AND entity_id = ${project.client_id})
             OR (level = 'project' AND entity_id = ${entityId})
          ORDER BY 
            CASE level 
              WHEN 'arka' THEN 1
              WHEN 'client' THEN 2
              WHEN 'project' THEN 3
            END
        `;
      }
      break;
      
    case 'client':
      hierarchyChain = await sql`
        SELECT level, configuration, overrides
        FROM context_hierarchy
        WHERE (level = 'arka' AND entity_id = 'global')
           OR (level = 'client' AND entity_id = ${entityId})
        ORDER BY 
          CASE level 
            WHEN 'arka' THEN 1
            WHEN 'client' THEN 2
          END
      `;
      break;
  }
  
  // Compute effective configuration
  let effectiveConfig = {};
  let localOverrides = {};
  
  for (const ctx of hierarchyChain) {
    if (ctx.level === level && preserveOverrides) {
      // Preserve local overrides if requested
      localOverrides = ctx.overrides || {};
    } else {
      // Merge configurations
      effectiveConfig = {
        ...effectiveConfig,
        ...ctx.configuration
      };
      
      // Apply overrides at each level
      if (ctx.overrides) {
        effectiveConfig = {
          ...effectiveConfig,
          ...ctx.overrides
        };
      }
    }
  }
  
  // Apply preserved local overrides on top
  if (preserveOverrides) {
    effectiveConfig = {
      ...effectiveConfig,
      ...localOverrides
    };
  }
  
  // Update the entity's context_config if it's an agent
  if (level === 'agent') {
    await sql`
      UPDATE agent_instances 
      SET context_config = ${JSON.stringify(effectiveConfig)},
          updated_at = NOW()
      WHERE id = ${entityId}
    `;
  }
  
  // Store in cache
  await sql`
    INSERT INTO config_cache (
      cache_key, cached_value, computed_at, expires_at
    ) VALUES (
      ${`${level}:${entityId}`},
      ${JSON.stringify(effectiveConfig)},
      NOW(),
      NOW() + INTERVAL '5 minutes'
    ) ON CONFLICT (cache_key) DO UPDATE
    SET cached_value = EXCLUDED.cached_value,
        computed_at = NOW(),
        expires_at = NOW() + INTERVAL '5 minutes',
        hit_count = config_cache.hit_count + 1
  `;
}