import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { createApiError, errorResponse } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';
// JSZip removed - will use JSON export instead of ZIP for now
import crypto from 'crypto';

// GET /api/memory/export/:project_id (owner)
export const GET = withAuth(['owner'], async (req, user, { params }) => {
  const { project_id } = params;
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  
  try {
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

    // Get project info
    const project = await sql`
      SELECT id, name, slug, created_at FROM projects WHERE id = ${resolved_project_id}
    `;
    
    if (project.length === 0) {
      const error = createApiError('ERR_PROJECT_NOT_FOUND', 'Project not found', { project_id }, traceId);
      return errorResponse(error, 404);
    }

    const projectData = project[0];
    const export_timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `arkameta_${projectData.slug || resolved_project_id}_${export_timestamp}.zip`;

    // Get all memory blocks
    const memory_blocks = await sql`
      SELECT 
        mb.id,
        mb.block_type,
        mb.content,
        mb.agent_source,
        mb.importance,
        mb.tags,
        mb.created_at,
        mb.hash,
        mb.thread_id
      FROM memory_blocks mb
      WHERE mb.project_id = ${resolved_project_id}
      ORDER BY mb.created_at ASC
    `;

    // Get context links
    const context_links = await sql`
      SELECT 
        mcl.id,
        mcl.source_block_id,
        mcl.target_block_id,
        mcl.relation_type,
        mcl.strength,
        mcl.created_at
      FROM memory_context_links mcl
      JOIN memory_blocks mb_source ON mcl.source_block_id = mb_source.id
      WHERE mb_source.project_id = ${resolved_project_id}
    `;

    // Get snapshots
    const snapshots = await sql`
      SELECT 
        id,
        snapshot_type,
        content_hash,
        size_mb,
        blocks_count,
        created_by,
        metadata,
        created_at
      FROM memory_snapshots
      WHERE project_id = ${resolved_project_id}
      ORDER BY created_at DESC
    `;

    if (memory_blocks.length === 0) {
      const error = createApiError('ERR_NO_MEMORY_BLOCKS', 'No memory blocks found for export', { project_id }, traceId);
      return errorResponse(error, 404);
    }

    // Create comprehensive export structure
    const blocksByType = memory_blocks.reduce((acc: Record<string, any[]>, block: any) => {
      if (!acc[block.block_type]) acc[block.block_type] = [];
      acc[block.block_type].push({
        id: block.id,
        content: block.content,
        agent_source: block.agent_source,
        importance: block.importance,
        tags: block.tags || [],
        created_at: block.created_at.toISOString(),
        thread_id: block.thread_id,
        hash: block.hash
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Timeline
    const timeline = memory_blocks.map((block: any) => ({
      timestamp: block.created_at.toISOString(),
      type: block.block_type,
      agent: block.agent_source || 'system',
      block_id: block.id,
      importance: block.importance,
      content_summary: extractContentSummary(block.content, block.block_type),
      hash: block.hash
    }));

    // Governance traces
    const governance_blocks = memory_blocks.filter((b: any) => b.block_type === 'governance');
    const gates_trace = governance_blocks.map((block: any) => ({
      timestamp: block.created_at.toISOString(),
      gate: (block.content as any).gate_passed || 'unknown',
      validator: block.agent_source,
      details: (block.content as any).validation_details || '',
      criteria: (block.content as any).criteres_respectes || [],
      block_id: block.id
    }));

    const decision_blocks = memory_blocks.filter((b: any) => b.block_type === 'decision' && b.importance >= 8);
    const validation_decisions = decision_blocks.map((block: any) => ({
      timestamp: block.created_at.toISOString(),
      decision: (block.content as any).decision || 'decision',
      rationale: (block.content as any).rationale || '',
      impact: (block.content as any).impact || [],
      responsible: block.agent_source,
      importance: block.importance,
      block_id: block.id
    }));

    // Evidence
    const evidence = {
      snapshots_history: snapshots.map((s: any) => ({
        id: s.id,
        type: s.snapshot_type,
        content_hash: s.content_hash,
        size_mb: s.size_mb,
        blocks_count: s.blocks_count,
        created_by: s.created_by,
        metadata: s.metadata,
        created_at: s.created_at.toISOString()
      })),
      context_links: context_links.map((link: any) => ({
        id: link.id,
        source_block_id: link.source_block_id,
        target_block_id: link.target_block_id,
        relation_type: link.relation_type,
        strength: link.strength,
        created_at: link.created_at.toISOString()
      }))
    };

    // Calculate integrity hashes
    const blocks_content = JSON.stringify(blocksByType);
    const links_content = JSON.stringify(evidence.context_links);
    const snapshots_content = JSON.stringify(evidence.snapshots_history);
    
    const integrity = {
      blocks_hash: 'sha256:' + crypto.createHash('sha256').update(blocks_content).digest('hex'),
      links_hash: 'sha256:' + crypto.createHash('sha256').update(links_content).digest('hex'),
      snapshots_hash: 'sha256:' + crypto.createHash('sha256').update(snapshots_content).digest('hex'),
      individual_blocks: memory_blocks.reduce((acc: Record<string, string>, block: any) => {
        acc[block.id] = block.hash;
        return acc;
      }, {} as Record<string, string>)
    };

    // Complete export structure
    const exportData = {
      manifest: {
        project: {
          id: resolved_project_id,
          name: projectData.name,
          slug: projectData.slug,
          created_at: projectData.created_at.toISOString()
        },
        export: {
          timestamp: new Date().toISOString(),
          exported_by: user?.sub,
          total_blocks: memory_blocks.length,
          total_links: context_links.length,
          total_snapshots: snapshots.length,
          format: 'JSON',
          version: 'B22-v1.0'
        },
        integrity
      },
      memory_blocks: blocksByType,
      timeline,
      governance: {
        gates_trace,
        validation_decisions
      },
      evidence,
      readme: `# ArkaMeta Memory Export - ${projectData.name}\n\nExported: ${new Date().toISOString()}\nBy: ${user?.sub}\nBlocks: ${memory_blocks.length}\nLinks: ${context_links.length}\nSnapshots: ${snapshots.length}\n\nGenerated by ArkaMeta Core B22 v1.0`
    };

    const exportJson = JSON.stringify(exportData, null, 2);
    const content_hash = crypto.createHash('sha256').update(exportJson).digest('hex');

    return new NextResponse(exportJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename.replace('.zip', '.json')}"`,
        'Content-Length': Buffer.byteLength(exportJson).toString(),
        'Content-MD5': crypto.createHash('md5').update(exportJson).digest('base64'),
        'Digest': `SHA-256=${crypto.createHash('sha256').update(exportJson).digest('base64')}`,
        'X-Trace-Id': traceId,
        'X-Export-Hash': 'sha256:' + content_hash
      }
    });

  } catch (error) {
    console.error('GET /api/memory/export/:project_id error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error during export',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});

// Helper function to extract content summary based on block type
function extractContentSummary(content: any, block_type: string): string {
  switch (block_type) {
    case 'vision':
      return content.objectif || content.summary || 'Vision statement';
    case 'decision':
      return content.decision || content.summary || 'Decision made';
    case 'context_evolution':
      return content.new_state || content.summary || 'Context change';
    case 'blocker':
      return content.blocker || content.summary || 'Blocker identified';
    case 'agents_interaction':
      return content.summary || 'Agent interaction';
    case 'governance':
      return content.gate_passed ? `Gate ${content.gate_passed}` : 'Governance event';
    case 'insight':
      return content.insight || content.summary || 'Insight captured';
    default:
      return content.summary || 'Memory event';
  }
}