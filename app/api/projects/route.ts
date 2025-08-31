import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export const GET = async () => {
  const { rows } = await sql`
    select id, name, created_at
    from projects
    order by created_at desc, id asc
  `;
  const { rows: c } = await sql`select count(*)::int as count from projects`;
  return NextResponse.json({ items: rows, count: c[0].count });
};
