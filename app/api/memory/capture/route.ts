import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { createApiError, errorResponse } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';
import { extractMemoryBlocks, calculateContextCompletion } from '@/lib/memory-extractor';
import { validateIdempotencyKey, createIdempotencyConflictError } from '@/lib/idempotency';

interface CaptureRequest {
  thread_id?: string;
  content_blocks: string[];
  force_extraction?: boolean;
  project_id?: number;
  agent_source?: string;
}

interface CaptureResponse {
  memory_blocks_created: number;
  project_id: string;
  blocks: Array<{
    id: string;
    type: string;
    content: Record<string, any>;
    agent_source?: string;
    importance: number;
    hash: string;
  }>;
  context_completion: number;
  agents_notified: string[];
  propagation: {
    threads_updated: number;
    context_links_created: number;
  };
}

// POST /api/memory/capture (operator+)
export const POST = withAuth(['editor', 'admin', 'owner'], async (req, user, { params }) => {
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  const idempotencyKey = req.headers.get('idempotency-key');
  
  try {
    // Validate idempotency key
    if (!idempotencyKey) {
      const error = createApiError('ERR_IDEMPOTENCY_KEY_MISSING', 'Idempotency-Key header is required', {}, traceId);
      return errorResponse(error, 400);
    }

    if (!validateIdempotencyKey(idempotencyKey)) {
      const error = createApiError('ERR_VALIDATION_FAILED', 'Invalid idempotency key format', { key: idempotencyKey }, traceId);
      return errorResponse(error, 400);
    }
    
    const body: CaptureRequest = await req.json();
    
    // Validate required fields
    if (!body.content_blocks || !Array.isArray(body.content_blocks) || body.content_blocks.length === 0) {
      const error = createApiError('ERR_INVALID_CONTENT_BLOCKS', 'content_blocks must be a non-empty array', {}, traceId);
      return errorResponse(error, 400);
    }

    // Get thread and extract content
    let content_text = '';
    let project_id = body.project_id;
    
    if (body.thread_id) {
      // Get thread messages and project_id
      const thread = await sql`
        SELECT t.project_id, array_agg(m.content ORDER BY m.ts) as messages
        FROM threads t
        LEFT JOIN messages m ON m.thread_id = t.id
        WHERE t.id = ${body.thread_id}
        GROUP BY t.id, t.project_id
      `;
      
      if (thread.length === 0) {
        const error = createApiError('ERR_THREAD_NOT_FOUND', 'Thread not found', { thread_id: body.thread_id }, traceId);
        return errorResponse(error, 404);
      }
      
      project_id = thread[0].project_id;
      content_text = (thread[0].messages || []).join('\n\n');
    }

    if (!project_id) {
      const error = createApiError('ERR_PROJECT_ID_REQUIRED', 'project_id is required when thread_id is not provided', {}, traceId);
      return errorResponse(error, 400);
    }

    // Verify project exists
    const project = await sql`SELECT id, name, slug FROM projects WHERE id = ${project_id}`;
    if (project.length === 0) {
      const error = createApiError('ERR_PROJECT_NOT_FOUND', 'Project not found', { project_id }, traceId);
      return errorResponse(error, 404);
    }

    // If no content from thread, require manual content
    if (!content_text.trim()) {
      if (!body.content_blocks.some((block: any) => block.trim())) {
        const error = createApiError('ERR_NO_CONTENT', 'No content to extract from thread or content_blocks', {}, traceId);
        return errorResponse(error, 400);
      }
      content_text = body.content_blocks.join('\n\n');
    }

    // Extract memory blocks using AI pattern detection
    const extraction = extractMemoryBlocks(content_text, body.agent_source);
    
    if (extraction.blocks.length === 0) {
      const error = createApiError('ERR_NO_MEMORY_BLOCKS_EXTRACTED', 'No meaningful memory blocks could be extracted from content', 
        { extraction_confidence: extraction.metadata.confidence }, traceId);
      return errorResponse(error, 422);
    }

    // Save memory blocks to database
    const saved_blocks: any[] = [];
    const context_links_created: any[] = [];
    
    await sql.begin(async (sql: any) => {
      for (const block of extraction.blocks) {
        const [saved] = await sql`
          INSERT INTO memory_blocks (project_id, thread_id, block_type, content, agent_source, importance, tags, hash)
          VALUES (${project_id}, ${body.thread_id || null}, ${block.block_type}, ${JSON.stringify(block.content)}, 
                  ${block.agent_source || body.agent_source || user?.sub}, ${block.importance}, ${block.tags}, ${block.hash})
          RETURNING id, block_type, content, agent_source, importance, hash
        `;
        
        saved_blocks.push({
          id: saved.id,
          type: saved.block_type,
          content: saved.content,
          agent_source: saved.agent_source,
          importance: saved.importance,
          hash: saved.hash
        });
      }

      // Create context links based on semantic relationships
      // For now, implement basic linking: decision blocks relate to vision blocks
      const vision_blocks = saved_blocks.filter((b: any) => b.type === 'vision');
      const decision_blocks = saved_blocks.filter((b: any) => b.type === 'decision');
      
      for (const decision of decision_blocks) {
        for (const vision of vision_blocks) {
          const [link] = await sql`
            INSERT INTO memory_context_links (source_block_id, target_block_id, relation_type, strength)
            VALUES (${decision.id}, ${vision.id}, 'relates_to', 0.7)
            RETURNING id
          `;
          context_links_created.push(link.id);
        }
      }
    });

    // Calculate updated context completion
    const all_blocks = await sql`
      SELECT block_type FROM memory_blocks WHERE project_id = ${project_id}
    `;
    const context_completion = calculateContextCompletion(all_blocks.map((b: any) => ({ block_type: b.block_type })) as any);

    // Get agents mentioned for notification
    const agents_notified = [...new Set(extraction.metadata.agent_mentions)];

    // Update threads if thread_id provided
    let threads_updated = 0;
    if (body.thread_id) {
      await sql`
        UPDATE thread_state 
        SET context_hint = COALESCE(context_hint, '{}') || ${JSON.stringify({ 
          memory_blocks_added: saved_blocks.length,
          last_extraction: new Date().toISOString(),
          completion: context_completion
        })}
        WHERE thread_id = ${body.thread_id}
      `;
      threads_updated = 1;
    }

    const response: CaptureResponse = {
      memory_blocks_created: saved_blocks.length,
      project_id: project[0].slug || project_id.toString(),
      blocks: saved_blocks,
      context_completion,
      agents_notified,
      propagation: {
        threads_updated,
        context_links_created: context_links_created.length
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-Trace-Id': traceId
      }
    });

  } catch (error) {
    console.error('POST /api/memory/capture error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error during memory capture',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});