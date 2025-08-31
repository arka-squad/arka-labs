import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';

export const GET = async () => {
  const { rows } = await sql`
    select t.id,
           t.title,
           max(m.created_at) as last_msg_at,
           t.created_at
    from threads t
    left join messages m on m.thread_id = t.id
    group by t.id, t.title, t.created_at
    order by last_msg_at desc nulls last, t.created_at desc
  `;
  return NextResponse.json({ items: rows.map(({ created_at, ...rest }) => rest) });
};
