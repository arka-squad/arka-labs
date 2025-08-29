import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { mockRuns } from '../../../../lib/metrics-data';
import { randomUUID } from 'crypto';

export const GET = withAuth(['viewer', 'operator', 'owner'], async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const lot = searchParams.get('lot');
  const sprint = searchParams.get('sprint');
  const page = Number(searchParams.get('page') || '1');
  let limit = Number(searchParams.get('limit') || '20');
  if (!Number.isFinite(limit) || limit <= 0) limit = 20;
  limit = Math.min(limit, 20);
  const traceId = req.headers.get('x-trace-id') ?? randomUUID();
  const filtered = mockRuns.filter(
    (r) => (!lot || r.lot === lot) && (!sprint || r.sprint === sprint)
  );
  const start = (page - 1) * limit;
  const runs = filtered.slice(start, start + limit);
  console.log(
    JSON.stringify({
      event: 'api.metrics.runs',
      trace_id: traceId,
      lot,
      sprint,
      page,
      limit,
      ts: new Date().toISOString(),
    })
  );
  return NextResponse.json({ runs, total: filtered.length }, { headers: { 'x-trace-id': traceId } });
});
