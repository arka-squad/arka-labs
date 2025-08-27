import { NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/rbac';
import { validateMessage, MessageInput } from './schema';

export const POST = withAuth(['operator', 'owner'], async (req, _user, { params }: { params: { threadId: string } }) => {
  const body = await req.json().catch(() => null);
  if (!validateMessage(body)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const msg = body as MessageInput;
  const { rows } = await sql`
    insert into messages (thread_id, role, content, tokens, meta)
    values (${params.threadId}, ${msg.role}, ${msg.content}, ${msg.tokens ?? null}, ${msg.meta ?? null})
    returning id, thread_id, role, content, created_at, tokens, meta
  `;
  return NextResponse.json(rows[0], { status: 201 });
});
