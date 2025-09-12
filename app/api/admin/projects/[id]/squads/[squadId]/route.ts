import { NextResponse } from 'next/server';
import { withAdminAuth } from '../../../../../../../lib/rbac-admin-b24';
import { sql } from '../../../../../../../lib/db';
import { log } from '../../../../../../../lib/logger';
import { TRACE_HEADER } from '../../../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// DELETE /api/admin/projects/[id]/squads/[squadId] - Detach squad from project
export const DELETE = withAdminAuth(['admin', 'manager'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const projectId = parseInt(params.id);
  const squadId = params.squadId;
  
  try {
    // Check if attachment exists and is active
    const attachmentRows = await sql`
      SELECT ps.id, ps.status, s.name as squad_name
      FROM project_squads ps
      JOIN squads s ON ps.squad_id = s.id
      WHERE ps.project_id = ${projectId} AND ps.squad_id = ${squadId}
    `;
    
    if (attachmentRows.length === 0) {
      return NextResponse.json({ 
        error: 'attachment_not_found' 
      }, { status: 404 });
    }

    const attachment = attachmentRows[0];
    
    if (attachment.status !== 'active') {
      return NextResponse.json({ 
        error: 'attachment_not_active',
        message: `Squad attachment is ${attachment.status}`
      }, { status: 400 });
    }

    // Check for active instructions tied to this project-squad combination
    const instructionRows = await sql`
      SELECT COUNT(*) as count FROM squad_instructions 
      WHERE squad_id = ${squadId} 
        AND project_id = ${projectId}
        AND status IN ('pending', 'queued', 'processing')
    `;
    
    if (parseInt(instructionRows[0].count) > 0) {
      return NextResponse.json({ 
        error: 'squad_has_active_instructions',
        message: 'Cannot detach squad with active instructions for this project'
      }, { status: 409 });
    }

    // Detach squad (soft detachment)
    const rows = await sql`
      UPDATE project_squads 
      SET status = 'detached', detached_at = NOW()
      WHERE project_id = ${projectId} AND squad_id = ${squadId}
      RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: 'detachment_failed' 
      }, { status: 500 });
    }

    const res = NextResponse.json({}, { status: 204 });
    
    log('info', 'squad_detached_from_project', {
      route: `/api/admin/projects/${projectId}/squads/${squadId}`,
      method: 'DELETE',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId,
      squad_id: squadId,
      squad_name: attachment.squad_name
    });

    return res;
  } catch (error) {
    log('error', 'squad_detachment_failed', {
      route: `/api/admin/projects/${projectId}/squads/${squadId}`,
      method: 'DELETE',
      status: 500,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.id,
      project_id: projectId,
      squad_id: squadId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({ 
      error: 'internal_error' 
    }, { status: 500 });
  }
});