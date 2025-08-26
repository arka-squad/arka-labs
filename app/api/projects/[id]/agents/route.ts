import { NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/rbac';
import { log } from '../../../../../lib/logger';

export const POST = withAuth(['operator', 'owner'], async (req, _user, { params }: { params: { id: string } }) => {
  const start = Date.now();
  const route = '/api/projects/:id/agents';
  const body = await req.json().catch(() => null);
  const bad = () => {
    log('warn', 'invalid body', { route, status: 400, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  };
  if (!body || typeof body !== 'object' || Array.isArray(body)) return bad();
  const keys = Object.keys(body);
  if (!('agent_id' in body) || !('status' in body)) return bad();
  if (keys.some((k) => k !== 'agent_id' && k !== 'status')) return bad();
  if (typeof body.status !== 'string' || !['shadow', 'active'].includes(body.status)) return bad();
  if (typeof body.agent_id !== 'string') return bad();
  const projectId = params.id;
  const { rows: agents } = await sql`update agents set project_id=${projectId}, mode=${body.status} where id=${body.agent_id} returning project_id, id, mode`;
  const agent = agents[0];
  if (!agent) {
    log('info', 'agent not found', { route, status: 404, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  await sql`update projects set last_activity=now() where id=${projectId}`;
  log('info', 'agent added', { route, status: 200, duration_ms: Date.now() - start });
  return NextResponse.json({ project_id: agent.project_id, agent_id: agent.id, status: agent.mode });
});
