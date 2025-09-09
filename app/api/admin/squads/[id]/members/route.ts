import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../../lib/rbac-admin';
import { sql } from '../../../../../../lib/db';
import { log } from '../../../../../../lib/logger';
import { validateSquadState } from '../../../../../../lib/squad-utils';
import { TRACE_HEADER } from '../../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas
const AddMemberSchema = z.object({
  agent_id: z.string().uuid(),
  role: z.enum(['lead', 'specialist', 'contributor']),
  specializations: z.array(z.string()).default([]),
  permissions: z.record(z.boolean()).default({})
});

// POST /api/admin/squads/[id]/members - Add member to squad
export const POST = withAdminAuth(['squads:add_members'], 'squad')(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const squadId = params.id;
  
  try {
    const body = await req.json();
    const { agent_id, role, specializations, permissions } = AddMemberSchema.parse(body);
    
    // Validate squad state (must be active)
    const squadValidation = await validateSquadState(squadId, ['active']);
    if (!squadValidation.valid) {
      return NextResponse.json({ 
        error: squadValidation.error 
      }, { status: squadValidation.error === 'Squad not found' ? 404 : 400 });
    }

    // Check if agent exists
    const { rows: agentRows } = await sql`
      SELECT id, name FROM agents WHERE id = ${agent_id}
    `;
    
    if (agentRows.length === 0) {
      return NextResponse.json({ 
        error: 'agent_not_found' 
      }, { status: 404 });
    }

    const agent = agentRows[0];

    // Check if agent is already a member
    const { rows: existingRows } = await sql`
      SELECT status FROM squad_members 
      WHERE squad_id = ${squadId} AND agent_id = ${agent_id}
    `;
    
    if (existingRows.length > 0) {
      const currentStatus = existingRows[0].status;
      if (currentStatus === 'active') {
        return NextResponse.json({ 
          error: 'agent_already_member' 
        }, { status: 409 });
      }
      
      // Reactivate if previously inactive
      const { rows } = await sql`
        UPDATE squad_members 
        SET status = 'active', role = ${role}, 
            specializations = ${specializations}, permissions = ${JSON.stringify(permissions)},
            created_at = NOW()
        WHERE squad_id = ${squadId} AND agent_id = ${agent_id}
        RETURNING id, squad_id, agent_id, role, specializations, permissions, status, created_at
      `;
      
      const membership = rows[0];
      
      const response = {
        squad_id: membership.squad_id,
        agent_id: membership.agent_id,
        agent_name: agent.name,
        role: membership.role,
        specializations: membership.specializations || [],
        permissions: membership.permissions || {},
        created_at: membership.created_at
      };

      const res = NextResponse.json(response, { status: 201 });
      
      log('info', 'squad_member_reactivated', {
        route: `/api/admin/squads/${squadId}/members`,
        method: 'POST',
        status: res.status,
        duration_ms: Date.now() - start,
        trace_id: traceId,
        user_id: user.sub,
        squad_id: squadId,
        agent_id,
        role
      });

      return res;
    }

    // Check squad member limits (max 20 per B23 spec)
    const { rows: countRows } = await sql`
      SELECT COUNT(*) as count FROM squad_members 
      WHERE squad_id = ${squadId} AND status = 'active'
    `;
    
    if (parseInt(countRows[0].count) >= 20) {
      return NextResponse.json({ 
        error: 'squad_members_limit_reached',
        message: 'Maximum 20 active members per squad'
      }, { status: 422 });
    }

    // Add new member
    const { rows } = await sql`
      INSERT INTO squad_members (squad_id, agent_id, role, specializations, permissions)
      VALUES (${squadId}, ${agent_id}, ${role}, ${specializations}, ${JSON.stringify(permissions)})
      RETURNING id, squad_id, agent_id, role, specializations, permissions, status, created_at
    `;

    const membership = rows[0];
    
    // TODO: Integration hook to notify agent
    // await executeHook('onMemberAdded', squadId, agent_id);

    const response = {
      squad_id: membership.squad_id,
      agent_id: membership.agent_id,
      agent_name: agent.name,
      role: membership.role,
      specializations: membership.specializations || [],
      permissions: membership.permissions || {},
      created_at: membership.created_at
    };

    const res = NextResponse.json(response, { status: 201 });
    
    log('info', 'squad_member_added', {
      route: `/api/admin/squads/${squadId}/members`,
      method: 'POST',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      squad_id: squadId,
      agent_id,
      agent_name: agent.name,
      role
    });

    return res;
  } catch (error) {
    log('error', 'squad_member_add_failed', {
      route: `/api/admin/squads/${squadId}/members`,
      method: 'POST',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      squad_id: squadId,
      error: error.message
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