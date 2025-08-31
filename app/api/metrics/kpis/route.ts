import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';

export const computeKpis = (
  rows: { ttft_ms: number; rtt_ms: number; status: string }[] | any[],
) => {
  const asc = (a: number, b: number) => a - b;
  const p = (arr: number[], q: number) =>
    arr.length ? arr.sort(asc)[Math.min(arr.length - 1, Math.floor(q * (arr.length - 1)))] : 0;
  const ttft = rows.map((r) => r.ttft_ms);
  const rtt = rows.map((r) => r.rtt_ms);
  const err = rows.filter((r) => String(r.status)[0] !== '2').length;
  return {
    p95: { ttft_ms: Math.round(p(ttft, 0.95)), rtt_ms: Math.round(p(rtt, 0.95)) },
    error_rate_percent: rows.length ? +((err * 100 / rows.length).toFixed(1)) : 0,
  };
};

export const GET = async () => {
  const { rows } = await sql`
    select (payload_json->>'ttft_ms')::int as ttft_ms,
           (payload_json->>'rtt_ms')::int as rtt_ms,
           (payload_json->>'status') as status
    from agent_events
    where event='metrics_run'
    order by ts desc
    limit 1000
  `;
  return NextResponse.json(computeKpis(rows));
};
