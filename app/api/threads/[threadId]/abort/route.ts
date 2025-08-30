import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../../../lib/rbac';
import { sql } from '../../../../../lib/db';
import { memThreads, memAborts, abortedThreads } from '../../../../../lib/mem-store';

export const POST = withAuth(['operator', 'owner'], async (req: NextRequest, _user, { params }: { params: { threadId: string } }) => {
  const key = req.headers.get('x-idempotency-key');
  if (!key) {
    return NextResponse.json({ error: 'idempotency-key-required' }, { status: 400 });
  }
  if (!memThreads.has(params.threadId)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  if (abortedThreads.has(params.threadId) && !memAborts.has(key)) {
    return NextResponse.json({ error: 'conflict' }, { status: 409 });
  }
  if (memAborts.has(key)) {
    return NextResponse.json({ aborted: true }, { status: 202 });
  }
  try {
    await sql`insert into action_queue (kind, payload, status, dedupe_key) values ('thread_abort', ${JSON.stringify({ thread_id: params.threadId })}, 'queued', ${key})`;
  } catch {}
  memAborts.set(key, params.threadId);
  abortedThreads.add(params.threadId);
  return NextResponse.json({ aborted: true }, { status: 202 });
});
