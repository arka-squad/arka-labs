import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { createApiError, errorResponse } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';
import { calculateContextCompletion } from '@/lib/memory-extractor';
import { validateIdempotencyKey, createIdempotencyConflictError } from '@/lib/idempotency';
import crypto from 'crypto';

interface ContextRequest {
  project_id: string;
  type: 'constraint' | 'decision' | 'blocker' | 'insight';
  content: string;
  source_agent?: string;
  importance?: number;
}

interface ContextResponse {
  context_id: string;
  project_id: string;
  block_created: {
    id: string;
    type: string;
    hash: string;
  };
  propagation: {
    threads_notified: string[];
    agents_updated: string[];
    context_links: Array<{ target: string; relation: string }>;
  };
  structured_content: {
    type: string;
    content: string;
    impact_analysis?: string;
    urgency?: string;
    related_decisions?: string[];
  };
  completion_delta: number;
}

// POST /api/memory/context (operator+)
export const POST = withAuth(['operator', 'admin', 'owner'], async (req, user, { params }) => {
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  const idempotencyKey = req.headers.get('idempotency-key');
  
  try {
    // Validate idempotency key
    if (!idempotencyKey) {
      const error = createApiError('ERR_IDEMPOTENCY_KEY_MISSING', 'Idempotency-Key header is required', {}, traceId);
      return errorResponse(error, 400);
    }

    const idempotencyCheck = await validateIdempotencyKey(idempotencyKey, req.url, user?.sub || 'anonymous');
    if (idempotencyCheck.conflict) {
      const error = createIdempotencyConflictError(idempotencyKey, traceId);
      return errorResponse(error, 409);
    }
    
    const body: ContextRequest = await req.json();
    
    // Validate required fields
    if (!body.project_id || !body.type || !body.content) {
      const error = createApiError('ERR_MISSING_REQUIRED_FIELDS', 'project_id, type, and content are required', {}, traceId);
      return errorResponse(error, 400);
    }

    if (!['constraint', 'decision', 'blocker', 'insight'].includes(body.type)) {
      const error = createApiError('ERR_INVALID_CONTEXT_TYPE', 'type must be one of: constraint, decision, blocker, insight', 
        { provided_type: body.type }, traceId);
      return errorResponse(error, 400);
    }

    // Resolve project by ID or slug
    let project_id: number;
    
    if (/^\d+$/.test(body.project_id)) {
      project_id = parseInt(body.project_id);
    } else {
      const slugResult = await sql`
        SELECT id FROM projects WHERE slug = ${body.project_id}
      `;
      if (slugResult.length === 0) {
        const error = createApiError('ERR_PROJECT_NOT_FOUND', 'Project not found', { project_id: body.project_id }, traceId);
        return errorResponse(error, 404);
      }
      project_id = slugResult[0].id;
    }

    // Verify project exists
    const project = await sql`SELECT id, name, slug FROM projects WHERE id = ${project_id}`;
    if (project.length === 0) {
      const error = createApiError('ERR_PROJECT_NOT_FOUND', 'Project not found', { project_id }, traceId);
      return errorResponse(error, 404);
    }

    // Get current context completion for delta calculation
    const current_blocks = await sql`
      SELECT block_type FROM memory_blocks WHERE project_id = ${project_id}
    `;
    const current_completion = calculateContextCompletion(current_blocks.map(b => ({ block_type: b.block_type })) as any);

    // Map type to memory block type
    const block_type_map = {
      constraint: 'context_evolution',
      decision: 'decision',
      blocker: 'blocker', 
      insight: 'insight'
    };
    const memory_block_type = block_type_map[body.type];

    // Create structured content based on type
    let structured_content: any = {
      type: body.type,
      content: body.content
    };

    switch (body.type) {
      case 'constraint':
        structured_content = {
          ...structured_content,
          impact_analysis: extractImpactAnalysis(body.content),
          urgency: assessUrgency(body.content),
          related_decisions: extractRelatedDecisions(body.content)
        };
        break;
      case 'decision':
        structured_content = {
          ...structured_content,
          rationale: extractRationale(body.content),
          impact: extractImpacts(body.content),
          responsable: body.source_agent || user?.sub || 'unknown'
        };
        break;
      case 'blocker':
        structured_content = {
          ...structured_content,
          cause: extractCause(body.content),
          impact: extractImpacts(body.content).join('; '),
          resolution_needed: extractResolution(body.content),
          urgency: assessUrgency(body.content)
        };
        break;
      case 'insight':
        structured_content = {
          ...structured_content,
          learning: extractLearning(body.content),
          actionable: extractActionable(body.content),
          context: body.content.slice(0, 200)
        };
        break;
    }

    // Create memory block
    const content_str = JSON.stringify(structured_content, null, 2);
    const hash = crypto.createHash('sha256').update(content_str).digest('hex');
    const importance = body.importance || getDefaultImportance(body.type);
    const tags = generateContextTags(body.type, body.content);

    let saved_block;
    const context_links = [];

    await sql.begin(async (sql) => {
      // Insert memory block
      const [block] = await sql`
        INSERT INTO memory_blocks (project_id, block_type, content, agent_source, importance, tags, hash)
        VALUES (${project_id}, ${memory_block_type}, ${JSON.stringify(structured_content)}, 
                ${body.source_agent || user?.sub}, ${importance}, ${tags}, ${'sha256:' + hash})
        RETURNING id, block_type, hash
      `;
      
      saved_block = block;

      // Create context links to related blocks
      if (body.type === 'decision') {
        // Link decisions to vision blocks
        const vision_blocks = await sql`
          SELECT id FROM memory_blocks 
          WHERE project_id = ${project_id} AND block_type = 'vision'
          ORDER BY created_at DESC
          LIMIT 3
        `;
        
        for (const vision of vision_blocks) {
          const [link] = await sql`
            INSERT INTO memory_context_links (source_block_id, target_block_id, relation_type, strength)
            VALUES (${block.id}, ${vision.id}, 'relates_to', 0.8)
            RETURNING target_block_id
          `;
          context_links.push({ target: link.target_block_id, relation: 'relates_to' });
        }
      }

      if (body.type === 'constraint') {
        // Link constraints to context evolution blocks
        const context_blocks = await sql`
          SELECT id FROM memory_blocks 
          WHERE project_id = ${project_id} AND block_type = 'context_evolution'
          ORDER BY created_at DESC
          LIMIT 2
        `;
        
        for (const context of context_blocks) {
          const [link] = await sql`
            INSERT INTO memory_context_links (source_block_id, target_block_id, relation_type, strength)
            VALUES (${block.id}, ${context.id}, 'relates_to', 0.7)
            RETURNING target_block_id
          `;
          context_links.push({ target: link.target_block_id, relation: 'relates_to' });
        }
      }
    });

    // Calculate new completion and delta
    const new_blocks = await sql`
      SELECT block_type FROM memory_blocks WHERE project_id = ${project_id}
    `;
    const new_completion = calculateContextCompletion(new_blocks.map(b => ({ block_type: b.block_type })) as any);
    const completion_delta = new_completion - current_completion;

    // Get related threads to notify
    const threads_to_notify = await sql`
      SELECT DISTINCT t.id::text as thread_id
      FROM threads t
      WHERE t.project_id = ${project_id}
        AND t.last_msg_at > NOW() - INTERVAL '7 days'
      LIMIT 5
    `;
    
    const threads_notified = threads_to_notify.map(t => t.thread_id);

    // Get agents to update (agents who contributed to this project recently)
    const agents_to_update = await sql`
      SELECT DISTINCT agent_source
      FROM memory_blocks
      WHERE project_id = ${project_id}
        AND agent_source IS NOT NULL
        AND created_at > NOW() - INTERVAL '7 days'
      LIMIT 10
    `;
    
    const agents_updated = agents_to_update.map(a => a.agent_source).filter(Boolean);

    const response: ContextResponse = {
      context_id: `ctx_${Date.now().toString()}_${Math.random().toString(36).substr(2, 5)}`,
      project_id: project[0].slug || project_id.toString(),
      block_created: {
        id: saved_block.id,
        type: saved_block.block_type,
        hash: saved_block.hash
      },
      propagation: {
        threads_notified,
        agents_updated,
        context_links
      },
      structured_content,
      completion_delta: Math.round(completion_delta)
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-Trace-Id': traceId
      }
    });

  } catch (error) {
    console.error('POST /api/memory/context error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error adding context',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});

// Helper functions

function extractImpactAnalysis(content: string): string {
  const impact_keywords = ['impact', 'conséquence', 'effet', 'influence'];
  for (const keyword of impact_keywords) {
    if (content.toLowerCase().includes(keyword)) {
      const sentences = content.split('.');
      const relevant = sentences.find(s => s.toLowerCase().includes(keyword));
      if (relevant) return relevant.trim();
    }
  }
  return 'Impact analysis needed';
}

function assessUrgency(content: string): string {
  const urgent_keywords = ['urgent', 'critique', 'immédiat', 'bloquant'];
  const important_keywords = ['important', 'priorité', 'attention'];
  
  const content_lower = content.toLowerCase();
  if (urgent_keywords.some(k => content_lower.includes(k))) return 'high';
  if (important_keywords.some(k => content_lower.includes(k))) return 'medium';
  return 'low';
}

function extractRelatedDecisions(content: string): string[] {
  const decisions = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('décision') || line.toLowerCase().includes('choix')) {
      decisions.push(line.trim());
    }
  }
  
  return decisions.slice(0, 3);
}

function extractRationale(content: string): string {
  const rationale_keywords = ['parce que', 'car', 'en raison de', 'étant donné', 'vu que'];
  for (const keyword of rationale_keywords) {
    const index = content.toLowerCase().indexOf(keyword);
    if (index !== -1) {
      return content.substring(index).split('.')[0];
    }
  }
  return '';
}

function extractImpacts(content: string): string[] {
  const impact_lines = content.split('\n').filter(line => 
    line.toLowerCase().includes('impact') || line.toLowerCase().includes('conséquence')
  );
  return impact_lines.slice(0, 3);
}

function extractCause(content: string): string {
  return content.split('.')[0]?.trim() || content.slice(0, 100);
}

function extractResolution(content: string): string {
  const resolution_keywords = ['solution', 'résolution', 'action', 'next step'];
  for (const keyword of resolution_keywords) {
    if (content.toLowerCase().includes(keyword)) {
      const sentences = content.split('.');
      const relevant = sentences.find(s => s.toLowerCase().includes(keyword));
      if (relevant) return relevant.trim();
    }
  }
  return '';
}

function extractLearning(content: string): string {
  const learning_keywords = ['apprentissage', 'leçon', 'retour', 'expérience'];
  for (const keyword of learning_keywords) {
    if (content.toLowerCase().includes(keyword)) {
      return content.split('.').find(s => s.toLowerCase().includes(keyword))?.trim() || '';
    }
  }
  return '';
}

function extractActionable(content: string): string {
  return extractResolution(content) || 'No specific actions identified';
}

function getDefaultImportance(type: string): number {
  switch (type) {
    case 'constraint': return 7;
    case 'decision': return 8;
    case 'blocker': return 9;
    case 'insight': return 6;
    default: return 5;
  }
}

function generateContextTags(type: string, content: string): string[] {
  const tags = [type];
  
  const content_lower = content.toLowerCase();
  if (content_lower.includes('budget')) tags.push('budget');
  if (content_lower.includes('planning')) tags.push('planning');
  if (content_lower.includes('sécurité')) tags.push('sécurité');
  if (content_lower.includes('technique')) tags.push('technique');
  if (content_lower.includes('qualité')) tags.push('qualité');
  
  return tags.slice(0, 5);
}