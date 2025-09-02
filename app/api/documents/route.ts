import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { log } from '../../../lib/logger';

export const GET = async (req: Request) => {
  const start = Date.now();
  const trace_id = req.headers.get('x-trace-id') ?? crypto.randomUUID();
  const u = new URL(req.url);
  const page = Math.max(1, parseInt(u.searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(u.searchParams.get('page_size') ?? '20', 10)),
  );
  const offset = (page - 1) * pageSize;
  try {
    const { rows } = await sql`
      select id, project_id, name, mime, size, storage_url, created_at
      from documents
      order by created_at desc, id asc
      limit ${pageSize} offset ${offset}
    `;
    const { rows: c } = await sql`select count(*)::int as count from documents`;
    const res = NextResponse.json({
      items: rows,
      page,
      page_size: pageSize,
      count: c[0].count,
    });
    res.headers.set('x-trace-id', trace_id);
    log('info', 'documents_list', {
      route: '/api/documents',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  } catch {
    const res = NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
    res.headers.set('x-trace-id', trace_id);
    log('info', 'documents_list', {
      route: '/api/documents',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  }
};
