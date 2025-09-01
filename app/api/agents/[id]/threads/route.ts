import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../../../lib/rbac';
import { sql } from '../../../../../lib/db';
import { memThreads } from '../../../../../lib/mem-store';
import { randomUUID } from 'crypto';

export const POST = withAuth(['editor', 'admin', 'owner'], async (req: NextRequest, _user, { params }: { params: { id: string } }) => {
  await req.json().catch(() => null);
  const threadId = randomUUID();
  try {
    await sql`insert into threads (id, title) values (${threadId}, null)`;
    memThreads.add(threadId);
    return NextResponse.json({ thread_id: threadId }, { status: 201 });
  } catch {
    memThreads.add(threadId);
    return NextResponse.json({ thread_id: threadId }, { status: 201 });
  }
});
