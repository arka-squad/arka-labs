import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/rbac';
import { sql } from '../../../lib/db';
import { memAgents, nextAgentId } from '../../../lib/mem-store';

export const GET = withAuth(['editor', 'admin', 'owner'], async () => {
  return NextResponse.json({ agents: memAgents });
});

export const POST = withAuth(['admin', 'owner'], async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  try {
    const rows = await sql`insert into agents (name, role) values (${body.name}, 'default') returning id, name, created_at`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch {
    const agent = { id: nextAgentId(), name: body.name, created_at: new Date().toISOString() };
    memAgents.push(agent);
    return NextResponse.json(agent, { status: 201 });
  }
});
