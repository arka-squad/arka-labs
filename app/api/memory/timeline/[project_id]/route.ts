import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { createApiError, errorResponse } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';

interface TimelineEntry {
  timestamp: string;
  type: string;
  agent: string;
  content: {
    summary: string;
    impact?: string;
    decisions_triggered?: string[];
    rationale?: string;
    impact_agents?: string[];
  };
  block_id: string;
  importance: number;
}

interface TimelineResponse {
  project_id: string;
  timeline: TimelineEntry[];
  page: number;
  limit: number;
  total: number;
  filters_applied: string[];
}

// GET /api/memory/timeline/:project_id
export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req, user, { params }) => {
  const { project_id } = params;
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  
  try {
    const url = new URL(req.url);
    
    // Parse query parameters
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;
    
    // Filters
    const from = url.searchParams.get('from'); // ISO date
    const to = url.searchParams.get('to'); // ISO date
    const type = url.searchParams.get('type'); // block type filter
    const agent = url.searchParams.get('agent'); // agent filter
    const sort = url.searchParams.get('sort') || 'ts:desc'; // ts:desc, ts:asc, importance:desc
    
    const filters_applied: string[] = [];

    // Resolve project by ID or slug
    let resolved_project_id: number;
    
    if (/^\d+$/.test(project_id)) {
      resolved_project_id = parseInt(project_id);
    } else {
      const slugResult = await sql`
        SELECT id FROM projects WHERE slug = ${project_id}
      `;
      if (slugResult.length === 0) {
        const error = createApiError('ERR_PROJECT_NOT_FOUND', 'Project not found', { project_id }, traceId);
        return errorResponse(error, 404);
      }
      resolved_project_id = slugResult[0].id;
    }

    // Verify project exists
    const project = await sql`
      SELECT id, name, slug FROM projects WHERE id = ${resolved_project_id}
    `;
    
    if (project.length === 0) {
      const error = createApiError('ERR_PROJECT_NOT_FOUND', 'Project not found', { project_id }, traceId);
      return errorResponse(error, 404);
    }

    // Build dynamic query with filters
    let whereConditions = [`mb.project_id = ${resolved_project_id}`];
    
    if (from) {
      try {
        const fromDate = new Date(from);
        whereConditions.push(`mb.created_at >= '${fromDate.toISOString()}'`);
        filters_applied.push(`from:${from}`);
      } catch {
        const error = createApiError('ERR_INVALID_DATE_FORMAT', 'Invalid from date format, expected ISO string', { from }, traceId);
        return errorResponse(error, 400);
      }
    }
    
    if (to) {
      try {
        const toDate = new Date(to);
        whereConditions.push(`mb.created_at <= '${toDate.toISOString()}'`);
        filters_applied.push(`to:${to}`);
      } catch {
        const error = createApiError('ERR_INVALID_DATE_FORMAT', 'Invalid to date format, expected ISO string', { to }, traceId);
        return errorResponse(error, 400);
      }
    }
    
    if (type) {
      const valid_types = ['vision', 'context_evolution', 'agents_interaction', 'decision', 'blocker', 'insight', 'governance'];
      if (valid_types.includes(type)) {
        whereConditions.push(`mb.block_type = '${type}'`);
        filters_applied.push(`type:${type}`);
      } else {
        const error = createApiError('ERR_INVALID_BLOCK_TYPE', 'Invalid block type filter', { type, valid_types }, traceId);
        return errorResponse(error, 400);
      }
    }
    
    if (agent) {
      whereConditions.push(`mb.agent_source = '${agent}'`);
      filters_applied.push(`agent:${agent}`);
    }

    // Build ORDER BY clause
    let orderBy = 'mb.created_at DESC';
    if (sort === 'ts:asc') {
      orderBy = 'mb.created_at ASC';
    } else if (sort === 'importance:desc') {
      orderBy = 'mb.importance DESC, mb.created_at DESC';
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM memory_blocks mb
      WHERE ${sql.unsafe(whereClause)}
    `;
    const total = parseInt(countResult[0].total);

    // Get timeline entries
    const timeline_blocks = await sql`
      SELECT 
        mb.id,
        mb.block_type,
        mb.content,
        mb.agent_source,
        mb.importance,
        mb.created_at
      FROM memory_blocks mb
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY ${sql.unsafe(orderBy)}
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Format timeline entries
    const timeline: TimelineEntry[] = timeline_blocks.map(block => {
      const content = block.content as any;
      let summary = '';
      let impact = '';
      let decisions_triggered: string[] = [];
      let rationale = '';
      let impact_agents: string[] = [];

      // Extract summary and details based on block type
      switch (block.block_type) {
        case 'vision':
          summary = content.objectif || content.summary || 'Vision définie';
          impact = `Livrables: ${(content.livrables || []).join(', ')}`;
          break;
          
        case 'decision':
          summary = content.decision || content.summary || 'Décision prise';
          rationale = content.rationale || '';
          impact_agents = extractAgents(content.impact || []);
          break;
          
        case 'context_evolution':
          summary = `Évolution: ${content.new_state || content.summary || 'Contexte modifié'}`;
          impact = content.impact_analysis || '';
          impact_agents = content.agents_impacted || [];
          decisions_triggered = content.decisions_triggered || [];
          break;
          
        case 'blocker':
          summary = content.blocker || content.summary || 'Blocage identifié';
          impact = content.impact || '';
          break;
          
        case 'agents_interaction':
          summary = content.summary || 'Interaction agents';
          decisions_triggered = content.decisions_prises || [];
          impact_agents = content.participants || [];
          break;
          
        case 'governance':
          summary = content.gate_passed ? `Gate ${content.gate_passed} passé` : 'Validation gouvernance';
          impact = content.validation_details || '';
          break;
          
        case 'insight':
          summary = content.insight || content.summary || 'Insight capturé';
          impact = content.learning || '';
          break;
          
        default:
          summary = content.summary || 'Activité mémoire';
      }

      return {
        timestamp: block.created_at.toISOString(),
        type: block.block_type,
        agent: block.agent_source || 'System',
        content: {
          summary,
          impact: impact || undefined,
          decisions_triggered: decisions_triggered.length > 0 ? decisions_triggered : undefined,
          rationale: rationale || undefined,
          impact_agents: impact_agents.length > 0 ? impact_agents : undefined
        },
        block_id: block.id,
        importance: block.importance
      };
    });

    const response: TimelineResponse = {
      project_id: project[0].slug || resolved_project_id.toString(),
      timeline,
      page,
      limit,
      total,
      filters_applied
    };

    // Generate ETag based on latest entry timestamp
    const etag = timeline.length > 0 
      ? `"${Buffer.from(timeline[0].timestamp).toString('base64')}"` 
      : `"empty-${Date.now()}"`;
    
    const ifNoneMatch = req.headers.get('if-none-match');
    
    if (ifNoneMatch === etag) {
      return new Response(null, { 
        status: 304,
        headers: {
          'ETag': etag,
          'X-Trace-Id': traceId
        }
      });
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'ETag': etag,
        'X-Trace-Id': traceId
      }
    });

  } catch (error) {
    console.error('GET /api/memory/timeline/:project_id error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error retrieving timeline',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});

// Helper function to extract agent names from various content structures
function extractAgents(content: any): string[] {
  if (Array.isArray(content)) {
    return content.filter(item => typeof item === 'string').slice(0, 5);
  }
  if (typeof content === 'string') {
    // Extract agent names from text using common patterns
    const agent_patterns = ['PMO', 'AGP', 'heloise-rh', 'agp-gate', 'Héloïse', 'archiviste'];
    const found_agents = [];
    
    for (const agent of agent_patterns) {
      if (content.toLowerCase().includes(agent.toLowerCase())) {
        found_agents.push(agent);
      }
    }
    
    return found_agents;
  }
  return [];
}