import { NextResponse } from 'next/server';
import { sql } from '../../../../../../lib/db';

export const GET = async (_req: Request, { params }: { params: { id: string } }) => {
  const rows = await sql`
    select role, content, created_at as ts
    from messages
    where thread_id=${params.id}::uuid
    order by created_at asc, id asc
  `;
  return NextResponse.json({ items: rows });
};
