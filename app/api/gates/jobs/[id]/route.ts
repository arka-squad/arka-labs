import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/rbac';
import { TRACE_HEADER, generateTraceId } from '../../../../../lib/trace';
import { jobs, results } from '../../../../../services/gates/state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req: NextRequest, _user: any, ctx: { params: { id: string } }) => {
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  const job = jobs.get(ctx.params.id);
  if (!job) {
    const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const res = NextResponse.json({ job, result: results.get(ctx.params.id) || null });
  res.headers.set(TRACE_HEADER, traceId);
  return res;
});
