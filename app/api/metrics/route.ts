import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../lib/rbac';
import { sql } from '../../../lib/db';

export const GET = withAuth(['viewer', 'operator', 'owner'], async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project');
  const lot = searchParams.get('lot');
  const sprint = searchParams.get('sprint');
  // Basic aggregation using message meta fields if present
  const sqlAny: any = sql;
  const { rows } = await sqlAny`
    select
      coalesce(percentile_cont(0.95) within group (order by (meta->>'ttft_ms')::int),0) as ttft_ms,
      coalesce(percentile_cont(0.95) within group (order by (meta->>'rtt_ms')::int),0) as rtt_ms,
      coalesce(avg((meta->>'error')::float),0) as err_pct
    from messages
      ${project ? sqlAny`where project_id = ${project}` : sqlAny``}
  `;
  const kpis = {
    ttft_ms: Number(rows[0]?.ttft_ms) || 0,
    rtt_ms: Number(rows[0]?.rtt_ms) || 0,
    err_pct: Number(rows[0]?.err_pct) || 0,
  };
  return NextResponse.json({ kpis });
});
