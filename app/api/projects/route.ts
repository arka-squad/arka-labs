import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { log } from '../../../lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (req: Request) => {
  const start = Date.now();
  const trace_id = req.headers.get('x-trace-id') || undefined;
  try {
    const { rows } = await sql`
      select id, name, created_at
      from projects
      order by created_at desc, id asc
    `;
    const { rows: c } = await sql`select count(*)::int as count from projects`;
    const res = NextResponse.json({ items: rows, count: c[0].count });
    log('info', 'projects', {
      route: '/api/projects',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  } catch {
    const res = NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
    log('info', 'projects', {
      route: '/api/projects',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  }
};
