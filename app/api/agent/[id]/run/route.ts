import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../../../lib/rbac';
import { sql } from '../../../../../lib/db';
import { memRuns, nextRunId } from '../../../../../lib/mem-store';

export const POST = withAuth(['operator', 'owner'], async (req: NextRequest, _user, { params }: { params: { id: string } }) => {
  const key = req.headers.get('x-idempotency-key');
  if (!key) {
    return NextResponse.json({ error: 'idempotency-key-required' }, { status: 400 });
  }
  try {
    const { rows } = await sql`
      insert into action_queue (kind, payload, status, dedupe_key)
      values ('agent_run', ${JSON.stringify({ agent_id: params.id })}, 'queued', ${key})
      on conflict (dedupe_key) do update set dedupe_key = ${key}
      returning id
    `;
    const jobId = rows[0].id;
    memRuns.set(key, String(jobId));
    return NextResponse.json({ job_id: jobId }, { status: 202 });
  } catch {
    if (memRuns.has(key)) {
      return NextResponse.json({ job_id: memRuns.get(key) }, { status: 202 });
    }
    const jobId = nextRunId();
    memRuns.set(key, jobId);
    return NextResponse.json({ job_id: jobId }, { status: 202 });
  }
});
