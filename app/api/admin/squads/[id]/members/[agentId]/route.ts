import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '../../../../../../../lib/rbac-admin';
import { sql } from '../../../../../../../lib/db';
import { log } from '../../../../../../../lib/logger';
import { TRACE_HEADER } from '../../../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// DELETE /api/admin/squads/[id]/members/[agentId] - Remove member from squad
export const DELETE = withAdminAuth(['squads:add_members'], 'squad')(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const squadId = params.id;
  const agentId = params.agentId;
  
  try {
    // Check if membership exists and is active
    const { rows: memberRows } = await sql`
      SELECT sm.id, sm.status, sm.role, a.name as agent_name
      FROM squad_members sm
      LEFT JOIN agents a ON sm.agent_id = a.id
      WHERE sm.squad_id = ${squadId} AND sm.agent_id = ${agentId}
    `;
    
    if (memberRows.length === 0) {
      return NextResponse.json({ 
        error: 'member_not_found' 
      }, { status: 404 });
    }

    const member = memberRows[0];
    
    if (member.status !== 'active') {
      return NextResponse.json({ 
        error: 'member_not_active' 
      }, { status: 400 });
    }

    // Check if this is the last lead member
    if (member.role === 'lead') {
      const { rows: leadCountRows } = await sql`
        SELECT COUNT(*) as count FROM squad_members 
        WHERE squad_id = ${squadId} AND role = 'lead' AND status = 'active'
      `;
      
      if (parseInt(leadCountRows[0].count) <= 1) {
        return NextResponse.json({ 
          error: 'cannot_remove_last_lead',
          message: 'Squad must have at least one lead member'
        }, { status: 409 });
      }
    }

    // Check for active instructions assigned to this member
    const { rows: instructionRows } = await sql`
      SELECT COUNT(*) as count FROM squad_instructions si
      WHERE si.squad_id = ${squadId} 
        AND si.status IN ('pending', 'queued', 'processing')
        AND si.metadata->>'assigned_agent_id' = ${agentId}
    `;
    
    if (parseInt(instructionRows[0].count) > 0) {
      return NextResponse.json({ 
        error: 'agent_has_active_instructions',
        message: 'Cannot remove agent with active instructions'
      }, { status: 409 });
    }

    // Deactivate membership (soft delete)
    const { rows } = await sql`
      UPDATE squad_members 
      SET status = 'inactive'
      WHERE squad_id = ${squadId} AND agent_id = ${agentId}
      RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: 'removal_failed' 
      }, { status: 500 });
    }

    const res = NextResponse.json({}, { status: 204 });
    
    log('info', 'squad_member_removed', {
      route: `/api/admin/squads/${squadId}/members/${agentId}`,
      method: 'DELETE',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      squad_id: squadId,
      agent_id: agentId,
      agent_name: member.agent_name,
      role: member.role
    });

    return res;
  } catch (error) {
    log('error', 'squad_member_removal_failed', {
      route: `/api/admin/squads/${squadId}/members/${agentId}`,
      method: 'DELETE',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      squad_id: squadId,
      agent_id: agentId,
      error: error.message
    });

    return NextResponse.json({ 
      error: 'internal_error' 
    }, { status: 500 });
  }
});