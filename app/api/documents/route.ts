import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export const GET = async (req: Request) => {
  const u = new URL(req.url);
  const page = Math.max(1, parseInt(u.searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(u.searchParams.get('page_size') ?? '20', 10)));
  const offset = (page - 1) * pageSize;
  const { rows } = await sql`
    select id, project_id, name, mime, size, storage_url, created_at
    from documents
    order by created_at desc, id asc
    limit ${pageSize} offset ${offset}
  `;
  const { rows: c } = await sql`select count(*)::int as count from documents`;
  return NextResponse.json({ items: rows, page, page_size: pageSize, count: c[0].count });
};
