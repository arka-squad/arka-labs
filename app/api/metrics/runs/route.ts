import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';

export const formatRuns = (
  rows: any[],
  page: number,
  limit: number,
  count: number,
) => ({ items: rows, page, limit, count });

export const GET = async (req: Request) => {
  const u = new URL(req.url);
  const page = Math.max(1, parseInt(u.searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;
  const { rows } = await sql`
    select ts,
           (payload_json->>'run_id') as run_id,
           (payload_json->>'trace_id') as trace_id,
           (payload_json->>'ttft_ms')::int as ttft_ms,
           (payload_json->>'rtt_ms')::int as rtt_ms,
           (payload_json->>'status') as status
    from agent_events
    where event='metrics_run'
    order by ts desc
    limit ${limit} offset ${offset}
  `;
  const { rows: c } = await sql`select count(*)::int as count from agent_events where event='metrics_run'`;
  return NextResponse.json(formatRuns(rows, page, limit, c[0].count));
};
