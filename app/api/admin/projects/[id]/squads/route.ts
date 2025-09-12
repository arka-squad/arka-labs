import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../../lib/rbac-admin-b24';
import { sql } from '../../../../../../lib/db';
import { log } from '../../../../../../lib/logger';
import { validateSquadState, validateProjectState } from '../../../../../../lib/squad-utils';
import { TRACE_HEADER } from '../../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas
const AttachSquadSchema = z.object({
  squad_id: z.string().uuid()
});

// POST /api/admin/projects/[id]/squads - Attach squad to project
export const POST = withAdminAuth(['admin', 'manager'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const projectId = parseInt(params.id);
  
  try {
    const body = await req.json();
    const { squad_id } = AttachSquadSchema.parse(body);
    
    // Validate project state (must be active)
    const projectValidation = await validateProjectState(projectId, ['active']);
    if (!projectValidation.valid) {
      return NextResponse.json({ 
        error: projectValidation.error 
      }, { status: projectValidation.error === 'Project not found' ? 404 : 400 });
    }

    // Validate squad state (must be active)
    const squadValidation = await validateSquadState(squad_id, ['active']);
    if (!squadValidation.valid) {
      return NextResponse.json({ 
        error: squadValidation.error 
      }, { status: squadValidation.error === 'Squad not found' ? 404 : 400 });
    }

    // Get squad details
    const squadRows = await sql`
      SELECT id, name, domain FROM squads 
      WHERE id = ${squad_id} AND deleted_at IS NULL
    `;
    
    const squad = squadRows[0];

    // Check if already attached
    const existingRows = await sql`
      SELECT status FROM project_squads 
      WHERE project_id = ${projectId} AND squad_id = ${squad_id}
    `;
    
    if (existingRows.length > 0) {
      const currentStatus = existingRows[0].status;
      if (currentStatus === 'active') {
        return NextResponse.json({ 
          error: 'squad_already_attached' 
        }, { status: 409 });
      }
      
      // Reactivate if previously detached
      const rows = await sql`
        UPDATE project_squads 
        SET status = 'active', attached_by = ${user.id}, 
            attached_at = NOW(), detached_at = NULL
        WHERE project_id = ${projectId} AND squad_id = ${squad_id}
        RETURNING project_id, squad_id, status, attached_by, attached_at
      `;
      
      const attachment = rows[0];
      
      const response = {
        project_id: attachment.project_id,
        squad_id: attachment.squad_id,
        squad_name: squad.name,
        status: attachment.status,
        attached_by: attachment.attached_by,
        attached_at: attachment.attached_at,
        capabilities: [
          'instruction_creation',
          'document_access',
          'performance_tracking'
        ]
      };

      const res = NextResponse.json(response, { status: 201 });
      
      log('info', 'squad_reattached_to_project', {
        route: `/api/admin/projects/${projectId}/squads`,
        method: 'POST',
        status: res.status,
        duration_ms: Date.now() - start,
        trace_id: traceId,
        user_id: user.id,
        project_id: projectId,
        squad_id,
        squad_name: squad.name
      });

      return res;
    }

    // Check project squad limits (reasonable limit for performance)
    const countRows = await sql`
      SELECT COUNT(*) as count FROM project_squads 
      WHERE project_id = ${projectId} AND status = 'active'
    `;
    
    if (parseInt(countRows[0].count) >= 10) {
      return NextResponse.json({ 
        error: 'project_squads_limit_reached',
        message: 'Maximum 10 active squads per project'
      }, { status: 422 });
    }

    // Create new attachment
    const rows = await sql`
      INSERT INTO project_squads (project_id, squad_id, attached_by)
      VALUES (${projectId}, ${squad_id}, ${user.id})
      RETURNING project_id, squad_id, status, attached_by, attached_at
    `;

    const attachment = rows[0];
    
    // TODO: Integration hook to propagate project context (B22)
    // await executeHook('onProjectSquadAttached', projectId, squad_id);

    const response = {
      project_id: attachment.project_id,
      squad_id: attachment.squad_id,
      squad_name: squad.name,
      status: attachment.status,
      attached_by: attachment.attached_by,
      attached_at: attachment.attached_at,
      capabilities: [
        'instruction_creation',
        'document_access', 
        'performance_tracking'
      ]
    };

    const res = NextResponse.json(response, { status: 201 });
    
    log('info', 'squad_attached_to_project', {
      route: `/api/admin/projects/${projectId}/squads`,
      method: 'POST',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId,
      squad_id,
      squad_name: squad.name,
      squad_domain: squad.domain
    });

    return res;
  } catch (error) {
    log('error', 'squad_attachment_failed', {
      route: `/api/admin/projects/${projectId}/squads`,
      method: 'POST',
      status: 500,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'validation_failed', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'internal_error' 
    }, { status: 500 });
  }
});