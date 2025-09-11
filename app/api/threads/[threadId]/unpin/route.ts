import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/rbac';
import { sql } from '../../../../../lib/db';
import { memThreads, memPins } from '../../../../../lib/mem-store';

export const POST = withAuth(['editor', 'admin', 'owner'], async (req: NextRequest, _user, { params }: { params: { threadId: string } }) => {
  await req.json().catch(() => null);
  if (!memThreads.has(params.threadId)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  if (!memPins.has(params.threadId)) {
    return NextResponse.json({ error: 'conflict' }, { status: 409 });
  }
  try {
    await sql`delete from thread_pins where thread_id = ${params.threadId}`;
  } catch {}
  memPins.delete(params.threadId);
  return NextResponse.json({ ok: true }, { status: 200 });
});
