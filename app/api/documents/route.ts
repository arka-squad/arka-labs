import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { parsePagination } from '../../../lib/metrics-api';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const { page, page_size } = parsePagination(searchParams);
  const offset = (page - 1) * page_size;
  const { rows } = await sql`
    select id, project_id, name, mime, size, storage_url, created_at
    from documents
    order by created_at desc, id asc
    limit ${page_size} offset ${offset}
  `;
  const { rows: c } = await sql`select count(*)::int as count from documents`;
  return NextResponse.json({ items: rows, page, page_size, count: c[0].count });
};
