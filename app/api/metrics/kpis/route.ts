import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';
import { computeKpis } from '../../../../lib/metrics-api';
import { log } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (req: Request) => {
  const start = Date.now();
  const trace_id = req.headers.get('x-trace-id') || undefined;
  try {
    const { rows } = await sql`
      select (payload_json->>'ttft_ms')::int as ttft_ms,
             (payload_json->>'rtt_ms')::int as rtt_ms,
             (payload_json->>'status') as status
      from agent_events
      where event='metrics_run'
      order by ts desc
      limit 1000
    `;
    const body = computeKpis(rows);
    const res = NextResponse.json(body);
    log('info', 'metrics_kpis', {
      route: '/api/metrics/kpis',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  } catch {
    const res = NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
    log('info', 'metrics_kpis', {
      route: '/api/metrics/kpis',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  }
};
