import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { createApiError, errorResponse } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';
import { calculateContextCompletion } from '@/lib/memory-extractor';
import { validateIdempotencyKey, createIdempotencyConflictError } from '@/lib/idempotency';
import crypto from 'crypto';

interface SnapshotRequest {
  project_id: string;
  snapshot_type: 'milestone' | 'manual';
  include_archived?: boolean;
}

interface SnapshotResponse {
  snapshot_id: string;
  project_id: string;
  snapshot_type: string;
  content_hash: string;
  size_mb: number;
  blocks_count: number;
  content_summary: {
    vision_blocks: number;
    decisions: number;
    context_evolution: number;
    agents_interactions: number;
    governance_trace: number;
    blockers: number;
    insights: number;
  };
  metadata: {
    completion_percentage: number;
    active_agents: number;
    critical_decisions: string[];
    gates_passed: string[];
    blockers_active: string[];
  };
  created_at: string;
}

// POST /api/memory/snapshot (owner)
export const POST = withAuth(['owner'], async (req, user, { params }) => {
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
    
    const body: SnapshotRequest = await req.json();
    
    // Validate required fields
    if (!body.project_id || !body.snapshot_type) {
      const error = createApiError('ERR_MISSING_REQUIRED_FIELDS', 'project_id and snapshot_type are required', {}, traceId);
      return errorResponse(error, 400);
    }

    if (!['milestone', 'manual'].includes(body.snapshot_type)) {
      const error = createApiError('ERR_INVALID_SNAPSHOT_TYPE', 'snapshot_type must be milestone or manual', 
        { provided_type: body.snapshot_type }, traceId);
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

    // Get all memory blocks for the project
    const memory_blocks = await sql`
      SELECT 
        mb.id,
        mb.block_type,
        mb.content,
        mb.agent_source,
        mb.importance,
        mb.tags,
        mb.created_at,
        mb.hash
      FROM memory_blocks mb
      WHERE mb.project_id = ${project_id}
        ${body.include_archived ? sql`` : sql`AND (mb.expires_at IS NULL OR mb.expires_at > NOW())`}
      ORDER BY mb.created_at DESC
    `;

    if (memory_blocks.length === 0) {
      const error = createApiError('ERR_NO_MEMORY_BLOCKS', 'No memory blocks found for this project', { project_id }, traceId);
      return errorResponse(error, 404);
    }

    // Calculate content summary
    const content_summary = memory_blocks.reduce((acc, block) => {
      switch (block.block_type) {
        case 'vision':
          acc.vision_blocks++;
          break;
        case 'decision':
          acc.decisions++;
          break;
        case 'context_evolution':
          acc.context_evolution++;
          break;
        case 'agents_interaction':
          acc.agents_interactions++;
          break;
        case 'governance':
          acc.governance_trace++;
          break;
        case 'blocker':
          acc.blockers++;
          break;
        case 'insight':
          acc.insights++;
          break;
      }
      return acc;
    }, {
      vision_blocks: 0,
      decisions: 0,
      context_evolution: 0,
      agents_interactions: 0,
      governance_trace: 0,
      blockers: 0,
      insights: 0
    });

    // Calculate context completion
    const completion_percentage = calculateContextCompletion(memory_blocks.map(b => ({ block_type: b.block_type })) as any);

    // Extract active agents
    const agents_set = new Set<string>();
    memory_blocks
      .filter(b => b.agent_source)
      .forEach(b => agents_set.add(b.agent_source));
    const active_agents = agents_set.size;

    // Extract critical decisions
    const critical_decisions = memory_blocks
      .filter(b => b.block_type === 'decision' && b.importance >= 8)
      .map(b => {
        const content = b.content as any;
        return content.decision || content.summary || 'Décision critique';
      })
      .slice(0, 5);

    // Extract gates passed from governance blocks
    const gates_passed = memory_blocks
      .filter(b => b.block_type === 'governance')
      .map(b => {
        const content = b.content as any;
        return content.gate_passed || content.gates_passed || [];
      })
      .flat()
      .filter(Boolean)
      .slice(0, 10);

    // Extract active blockers
    const blockers_active = memory_blocks
      .filter(b => b.block_type === 'blocker')
      .map(b => {
        const content = b.content as any;
        return content.blocker || content.summary || 'Blocage non spécifié';
      })
      .slice(0, 5);

    // Create snapshot content for hashing
    const snapshot_content = {
      project_id,
      timestamp: new Date().toISOString(),
      blocks_count: memory_blocks.length,
      content_summary,
      metadata: {
        completion_percentage,
        active_agents,
        critical_decisions,
        gates_passed,
        blockers_active
      },
      blocks: memory_blocks.map(b => ({
        id: b.id,
        type: b.block_type,
        content: b.content,
        importance: b.importance,
        hash: b.hash,
        created_at: b.created_at.toISOString()
      }))
    };

    // Calculate content hash and size
    const content_json = JSON.stringify(snapshot_content, null, 2);
    const content_hash = crypto.createHash('sha256').update(content_json).digest('hex');
    const size_mb = Buffer.byteLength(content_json, 'utf8') / (1024 * 1024);

    // Save snapshot to database
    const snapshot_id = `snap_${Date.now()}_${body.snapshot_type}_${Math.random().toString(36).substr(2, 5)}`;
    
    const [saved_snapshot] = await sql`
      INSERT INTO memory_snapshots (
        id, project_id, snapshot_type, content_hash, size_mb, blocks_count, 
        created_by, metadata
      )
      VALUES (
        ${snapshot_id}, ${project_id}, ${body.snapshot_type}, ${'sha256:' + content_hash}, 
        ${size_mb}, ${memory_blocks.length}, ${user?.sub}, 
        ${JSON.stringify({
          completion_percentage,
          active_agents,
          critical_decisions,
          gates_passed,
          blockers_active,
          content_summary
        })}
      )
      RETURNING id, created_at
    `;

    const response: SnapshotResponse = {
      snapshot_id: saved_snapshot.id,
      project_id: project[0].slug || project_id.toString(),
      snapshot_type: body.snapshot_type,
      content_hash: 'sha256:' + content_hash,
      size_mb: Math.round(size_mb * 100) / 100, // Round to 2 decimal places
      blocks_count: memory_blocks.length,
      content_summary,
      metadata: {
        completion_percentage,
        active_agents,
        critical_decisions,
        gates_passed,
        blockers_active
      },
      created_at: saved_snapshot.created_at.toISOString()
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-Trace-Id': traceId
      }
    });

  } catch (error) {
    console.error('POST /api/memory/snapshot error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error creating snapshot',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});