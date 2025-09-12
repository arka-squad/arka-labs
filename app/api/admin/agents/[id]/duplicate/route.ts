import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../../lib/rbac-admin';
import { sql } from '../../../../../../lib/db';
import { log } from '../../../../../../lib/logger';
import { TRACE_HEADER } from '../../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for agent duplication
const DuplicateAgentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  version: z.string().regex(/^\d+\.\d+$/).optional(),
  description_suffix: z.string().max(200).optional(),
  keep_assignments: z.boolean().optional().default(false),
  auto_activate: z.boolean().optional().default(true)
});

// POST /api/admin/agents/[id]/duplicate - Duplicate agent with version increment
export const POST = withAdminAuth(['admin', 'manager'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const agentId = params.id;
  
  try {
    const body = await req.json();
    const data = DuplicateAgentSchema.parse(body);

    // Get original agent details
    const [originalAgent] = await sql`
      SELECT * FROM agents 
      WHERE id = ${agentId} AND deleted_at IS NULL
    `;

    if (!originalAgent) {
      return NextResponse.json(
        { 
          error: 'Agent original introuvable',
          code: 'AGENT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Parse tags safely
    let tags = [];
    try {
      tags = JSON.parse(originalAgent.tags || '[]');
    } catch (e) {
      tags = [];
    }

    // Calculate new version if not provided
    let newVersion = data.version;
    if (!newVersion) {
      const versionParts = originalAgent.version.split('.');
      const majorVersion = parseInt(versionParts[0]);
      const minorVersion = parseInt(versionParts[1]) + 1;
      newVersion = `${majorVersion}.${minorVersion}`;
    }

    // Generate new name if not provided
    const newName = data.name || `${originalAgent.name} v${newVersion}`;

    // Check for name conflicts
    const [existingAgent] = await sql`
      SELECT id FROM agents 
      WHERE LOWER(name) = LOWER(${newName}) 
      AND deleted_at IS NULL
    `;

    if (existingAgent) {
      return NextResponse.json(
        { 
          error: 'Un agent avec ce nom existe déjà',
          code: 'AGENT_NAME_CONFLICT',
          suggested_name: `${newName} (${Date.now()})`,
          trace_id: traceId
        },
        { status: 409 }
      );
    }

    // Create duplicated agent
    const newDescription = originalAgent.description + 
      (data.description_suffix ? ` - ${data.description_suffix}` : ` (Duplicated from v${originalAgent.version})`);

    const [duplicatedAgent] = await sql`
      INSERT INTO agents (
        name, role, domaine, version, description, tags,
        prompt_system, temperature, max_tokens, is_template,
        original_agent_id, status, created_by
      ) VALUES (
        ${newName}, ${originalAgent.role}, ${originalAgent.domaine}, 
        ${newVersion}, ${newDescription}, ${JSON.stringify(tags)},
        ${originalAgent.prompt_system}, ${originalAgent.temperature}, 
        ${originalAgent.max_tokens}, ${originalAgent.is_template},
        ${agentId}, ${data.auto_activate ? 'active' : 'inactive'}, ${user.sub}
      )
      RETURNING *
    `;

    // Copy project assignments if requested
    let copiedAssignments = 0;
    if (data.keep_assignments) {
      const assignments = await sql`
        INSERT INTO project_assignments (project_id, agent_id, status, created_by)
        SELECT pa.project_id, ${duplicatedAgent.id}, 'active', ${user.sub}
        FROM project_assignments pa
        JOIN projects p ON pa.project_id = p.id
        WHERE pa.agent_id = ${agentId} 
        AND pa.status = 'active'
        AND p.status = 'active'
        AND p.deleted_at IS NULL
        RETURNING *
      `;
      copiedAssignments = assignments.length;
    }

    // Get performance data for response
    const [performanceData] = await sql`
      SELECT 
        COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active' AND p.status = 'active') as projets_actifs,
        COUNT(DISTINCT pa.project_id) as projets_total,
        CASE 
          WHEN COUNT(DISTINCT pa.project_id) = 0 THEN 0
          ELSE LEAST(
            (CAST(SUBSTRING(${newVersion} FROM '^([0-9]+)') AS INTEGER) * 20) +
            (COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active') * 15) +
            (COUNT(DISTINCT pa.project_id) * 8),
            100
          )
        END as performance_score
      FROM project_assignments pa
      LEFT JOIN projects p ON pa.project_id = p.id AND p.deleted_at IS NULL
      WHERE pa.agent_id = ${duplicatedAgent.id}
    `;

    const response = NextResponse.json({
      ...duplicatedAgent,
      tags: JSON.parse(duplicatedAgent.tags || '[]'),
      projets_actifs: parseInt(performanceData?.projets_actifs || '0'),
      projets_total: parseInt(performanceData?.projets_total || '0'),
      performance_score: parseInt(performanceData?.performance_score || '0'),
      duplication_info: {
        original_agent_id: agentId,
        original_name: originalAgent.name,
        original_version: originalAgent.version,
        assignments_copied: copiedAssignments,
        version_incremented: !data.version
      }
    }, { status: 201 });

    log('info', 'agent_duplicate_success', {
      route: '/api/admin/agents/[id]/duplicate',
      method: 'POST',
      status: response.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      original_agent_id: agentId,
      new_agent_id: duplicatedAgent.id,
      new_agent_name: duplicatedAgent.name,
      new_version: newVersion,
      assignments_copied: copiedAssignments
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: error.errors,
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    log('error', 'agent_duplicate_error', {
      route: '/api/admin/agents/[id]/duplicate',
      method: 'POST',
      status: 500,
      error: error instanceof Error ? error.message : String(error),
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      agent_id: agentId
    });

    return NextResponse.json(
      { 
        error: 'Failed to duplicate agent',
        code: 'AGENT_DUPLICATE_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});