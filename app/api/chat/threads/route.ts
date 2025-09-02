import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';
import { log } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (req: Request) => {
  const start = Date.now();
  const trace_id = req.headers.get('x-trace-id') || undefined;
  try {
    const { rows } = await sql`
      select t.id,
             t.title,
             coalesce(max(m.created_at), t.created_at) as last_msg_at
      from threads t
      left join messages m on m.thread_id = t.id
      group by t.id, t.title
      order by last_msg_at desc, t.id asc
    `;
    const items = rows.map((r: any) => r);
    const res = NextResponse.json({ items });
    log('info', 'chat_threads', {
      route: '/api/chat/threads',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  } catch {
    const res = NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
    log('info', 'chat_threads', {
      route: '/api/chat/threads',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id,
    });
    return res;
  }
};
