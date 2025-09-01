import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../../../lib/rbac';
import { sql } from '../../../../../lib/db';
import { memThreads, memMessages, memPins } from '../../../../../lib/mem-store';

export const POST = withAuth(['editor', 'admin', 'owner'], async (req: NextRequest, _user, { params }: { params: { threadId: string } }) => {
  const body = await req.json().catch(() => null);
  const msgId = body?.message_id;
  if (typeof msgId !== 'number') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  if (!memThreads.has(params.threadId)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const msgs = memMessages.get(params.threadId) || [];
  if (!msgs.find((m) => m.id === msgId)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  if (memPins.has(params.threadId)) {
    return NextResponse.json({ error: 'conflict' }, { status: 409 });
  }
  try {
    await sql`insert into thread_pins (thread_id, message_id) values (${params.threadId}, ${msgId})`;
  } catch {}
  memPins.set(params.threadId, msgId);
  return NextResponse.json({ ok: true }, { status: 200 });
});
