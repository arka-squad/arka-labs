import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../lib/rbac';
import { getGates } from '../../../lib/gates/catalog';
import { TRACE_HEADER, generateTraceId } from '../../../lib/trace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req: NextRequest) => {
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  const items = getGates();
  const res = NextResponse.json({ items });
  res.headers.set(TRACE_HEADER, traceId);
  return res;
});
