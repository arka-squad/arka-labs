import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { createApiError, errorResponse } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';
import { calculateContextCompletion } from '@/lib/memory-extractor';

interface ProjectMemoryResponse {
  project_id: string;
  project_name: string;
  memory_summary: {
    total_blocks: number;
    by_type: Record<string, number>;
    context_completion: number;
    last_updated: string;
  };
  memory_blocks: Array<{
    id: string;
    type: string;
    content: Record<string, any>;
    agent_source?: string;
    importance: number;
    tags: string[];
    created_at: string;
    thread_ref?: string;
  }>;
  agents_state: Record<string, {
    last_contribution: string;
    blocks_contributed: number;
  }>;
  governance: {
    current_phase: string;
    gates_passed: string[];
    next_milestone: string;
    blockers_active: string[];
  };
}

// GET /api/memory/project/:id
export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req, user, { params }) => {
  const { id } = params;
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  
  try {
    // Resolve project by ID or slug
    let project_id: number;
    
    if (/^\d+$/.test(id)) {
      // Numeric ID
      project_id = parseInt(id);
    } else {
      // Slug lookup
      const slugResult = await sql`
        SELECT id FROM projects WHERE slug = ${id}
      `;
      if (slugResult.length === 0) {
        const error = createApiError('ERR_PROJECT_NOT_FOUND', 'Project not found', { project_id: id }, traceId);
        return errorResponse(error, 404);
      }
      project_id = slugResult[0].id;
    }

    // Get project info
    const project = await sql`
      SELECT id, name, slug, created_at, updated_at
      FROM projects 
      WHERE id = ${project_id}
    `;
    
    if (project.length === 0) {
      const error = createApiError('ERR_PROJECT_NOT_FOUND', 'Project not found', { project_id }, traceId);
      return errorResponse(error, 404);
    }

    const projectData = project[0];

    // Get all memory blocks for this project
    const memory_blocks = await sql`
      SELECT 
        mb.id,
        mb.block_type,
        mb.content,
        mb.agent_source,
        mb.importance,
        mb.tags,
        mb.created_at,
        mb.thread_id
      FROM memory_blocks mb
      WHERE mb.project_id = ${project_id}
      ORDER BY mb.created_at DESC
    `;

    // Calculate memory summary
    const total_blocks = memory_blocks.length;
    const by_type = memory_blocks.reduce((acc: Record<string, number>, block: any) => {
      acc[block.block_type] = (acc[block.block_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const context_completion = calculateContextCompletion(
      memory_blocks.map((b: any) => ({ block_type: b.block_type })) as any
    );

    const last_updated = memory_blocks.length > 0 
      ? memory_blocks[0].created_at.toISOString() 
      : projectData.created_at.toISOString();

    // Calculate agents state
    const agents_state: Record<string, { last_contribution: string; blocks_contributed: number }> = {};
    
    for (const block of memory_blocks) {
      if (block.agent_source) {
        if (!agents_state[block.agent_source]) {
          agents_state[block.agent_source] = {
            last_contribution: block.created_at.toISOString(),
            blocks_contributed: 0
          };
        }
        
        agents_state[block.agent_source].blocks_contributed++;
        
        // Update last contribution if this block is more recent
        if (new Date(block.created_at) > new Date(agents_state[block.agent_source].last_contribution)) {
          agents_state[block.agent_source].last_contribution = block.created_at.toISOString();
        }
      }
    }

    // Extract governance information from governance blocks
    const governance_blocks = memory_blocks.filter((b: any) => b.block_type === 'governance');
    let governance = {
      current_phase: 'execution',
      gates_passed: [] as string[],
      next_milestone: '',
      blockers_active: [] as string[]
    };

    if (governance_blocks.length > 0) {
      const latest_governance = governance_blocks[0];
      const gov_content = latest_governance.content as any;
      
      governance = {
        current_phase: gov_content.current_phase || 'execution',
        gates_passed: gov_content.gates_passed || (gov_content.gate_passed ? [gov_content.gate_passed] : []),
        next_milestone: gov_content.next_milestone || '',
        blockers_active: []
      };
    }

    // Get active blockers
    const blocker_blocks = memory_blocks.filter((b: any) => b.block_type === 'blocker');
    governance.blockers_active = blocker_blocks.map((b: any) => {
      const content = b.content as any;
      return content.blocker || content.summary || 'Unknown blocker';
    }).slice(0, 5); // Max 5 active blockers

    // Format memory blocks for response
    const formatted_blocks = memory_blocks.slice(0, 50).map((block: any) => ({ // Limit to 50 most recent
      id: block.id,
      type: block.block_type,
      content: block.content,
      agent_source: block.agent_source,
      importance: block.importance,
      tags: block.tags || [],
      created_at: block.created_at.toISOString(),
      thread_ref: block.thread_id || undefined
    }));

    const response: ProjectMemoryResponse = {
      project_id: projectData.slug || project_id.toString(),
      project_name: projectData.name,
      memory_summary: {
        total_blocks,
        by_type,
        context_completion,
        last_updated
      },
      memory_blocks: formatted_blocks,
      agents_state,
      governance
    };

    // Generate ETag based on last_updated
    const etag = `"${Buffer.from(last_updated).toString('base64')}"`;
    const ifNoneMatch = req.headers.get('if-none-match');
    
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { 
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
    console.error('GET /api/memory/project/:id error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error retrieving project memory',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});