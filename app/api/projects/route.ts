import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { log } from '../../../lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (req: Request) => {
  const start = Date.now();
  const trace_id = req.headers.get('x-trace-id') || undefined;
  try {
    const rows = await sql`
      select 
        p.id, p.name, p.created_at, p.created_by,
        p.status, p.metadata,
        COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_count
      from projects p
      left join project_squads ps on p.id = ps.project_id
      group by p.id, p.name, p.created_at, p.created_by, p.status, p.metadata
      order by p.created_at desc, p.id asc
    `;
    const c = await sql`select count(*)::int as count from projects`;
    const items = rows.map(row => ({
      id: row.id,
      name: row.name,
      created_at: row.created_at,
      created_by: row.created_by,
      status: row.status || 'active',
      squads_count: parseInt(row.squads_count) || 0,
      metadata: row.metadata || {}
    }));
    const res = NextResponse.json({ items, count: c[0].count });
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
