import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { mockRuns, p95, avg } from '../../../../lib/metrics-data';
import { randomUUID } from 'crypto';

export const GET = withAuth(['viewer', 'operator', 'owner'], async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const lot = searchParams.get('lot');
  const sprint = searchParams.get('sprint');
  const traceId = req.headers.get('x-trace-id') ?? randomUUID();
  const filtered = mockRuns.filter(
    (r) => (!lot || r.lot === lot) && (!sprint || r.sprint === sprint)
  );
  const ttft = p95(filtered.map((r) => r.ttft_ms));
  const rtt = p95(filtered.map((r) => r.rtt_ms));
  const err = avg(filtered.map((r) => r.error_rate_percent));
  console.log(
    JSON.stringify({
      event: 'api.metrics.kpis',
      trace_id: traceId,
      lot,
      sprint,
      ts: new Date().toISOString(),
    })
  );
  return NextResponse.json(
    {
      ttft_ms: Number(ttft.toFixed(1)),
      rtt_ms: Number(rtt.toFixed(1)),
      error_rate_percent: Number(err.toFixed(1)),
    },
    { headers: { 'x-trace-id': traceId } }
  );
});
