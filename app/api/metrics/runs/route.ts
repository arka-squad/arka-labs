import { NextResponse, NextRequest } from 'next/server';
import { sql } from '../../../../lib/db';
import { parsePagination, formatRuns } from '../../../../lib/metrics-api';
import { log } from '../../../../lib/logger';
import { withAuth } from '../../../../lib/rbac';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withAuth(['admin', 'owner'], async (req: NextRequest) => {
  const start = Date.now();
  const trace_id = req.headers.get('x-trace-id') ?? crypto.randomUUID();
  const { searchParams } = new URL(req.url);
  const { page, page_size } = parsePagination(searchParams);
  const offset = (page - 1) * page_size;
  try {
    const { rows } = await sql`
      select ts,
             (payload_json->>'run_id') as run_id,
             (payload_json->>'trace_id') as trace_id,
             (payload_json->>'ttft_ms')::int as ttft_ms,
             (payload_json->>'rtt_ms')::int as rtt_ms,
             (payload_json->>'status') as status
      from agent_events
      where event='metrics_run'
      order by ts desc, id asc
      limit ${page_size} offset ${offset}
    `;
    const { rows: c } =
      await sql`select count(*)::int as count from agent_events where event='metrics_run'`;
    const body = formatRuns(rows, page, page_size, c[0].count);
    const res = NextResponse.json(body);
    res.headers.set('x-trace-id', trace_id);
    log('info', 'metrics_runs', {
      route: '/api/metrics/runs',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  } catch {
    const res = NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
    res.headers.set('x-trace-id', trace_id);
    log('info', 'metrics_runs', {
      route: '/api/metrics/runs',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  }
});
