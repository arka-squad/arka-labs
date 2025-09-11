import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/rbac';
import { validateMessage, MessageInput } from './schema';
import { memThreads, memMessages, nextMessageId } from '../../../../../lib/mem-store';

export const POST = withAuth(['editor', 'admin', 'owner'], async (req: NextRequest, _user, { params }: { params: { threadId: string } }) => {
  const body = await req.json().catch(() => null);
  if (!validateMessage(body)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  if (!memThreads.has(params.threadId)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const msg = body as MessageInput;
  try {
    const rows = await sql`
      insert into messages (thread_id, role, content, tokens, meta)
      values (${params.threadId}, ${msg.role}, ${msg.content}, ${msg.tokens ?? null}, ${msg.meta ? JSON.stringify(msg.meta) : null})
      returning id
    `;
    return NextResponse.json({ message_id: rows[0].id }, { status: 201 });
  } catch {
    const id = nextMessageId();
    const list = memMessages.get(params.threadId) || [];
    list.push({ id });
    memMessages.set(params.threadId, list);
    return NextResponse.json({ message_id: id }, { status: 201 });
  }
});
