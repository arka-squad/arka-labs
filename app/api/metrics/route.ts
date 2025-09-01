import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { computeOverview } from '../../../lib/metrics-api';
import { log } from '../../../lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (req: NextRequest) => {
  const start = Date.now();
  const trace_id = req.headers.get('x-trace-id') ?? crypto.randomUUID();
  try {
    const { rows } = await sql`
      select (payload_json->>'ttft_ms')::int as ttft_ms,
             (payload_json->>'rtt_ms')::int as rtt_ms,
             (payload_json->>'status') as status
      from agent_events
      where event='metrics_run' and ts > now() - interval '24 hours'
      order by ts desc
    `;
    const body = computeOverview(rows);
    const res = NextResponse.json(body);
    res.headers.set('x-trace-id', trace_id);
    log('info', 'metrics_overview', {
      route: '/api/metrics',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  } catch {
    const res = NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
    res.headers.set('x-trace-id', trace_id);
    log('info', 'metrics_overview', {
      route: '/api/metrics',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  }
};
