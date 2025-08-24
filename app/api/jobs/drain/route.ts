import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  const isCron = req.headers.get('x-vercel-cron') === '1' || req.headers.has('x-vercel-cron');
  if (!isCron && process.env.MODE !== 'dev') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let picked = 0;
  let done = 0;
  let failed = 0;

  const toRun = await sql`
    with picked as (
      select id from action_queue
      where status = 'queued'
        and (scheduled_at is null or scheduled_at <= now())
      order by scheduled_at nulls first, id
      limit 10
      for update skip locked
    )
    update action_queue q
    set status = 'running', attempts = attempts + 1
    from picked
    where q.id = picked.id
    returning q.id, q.kind, q.payload
  `;

  picked = (toRun as any).rowCount ?? toRun.rows.length;

  for (const row of toRun.rows) {
    try {
      switch (row.kind) {
        case 'create_pr':
        case 'run_checks':
        default:
          break;
      }
      await sql`update action_queue set status='done' where id=${row.id}`;
      done++;
    } catch (e) {
      await sql`update action_queue set status='failed' where id=${row.id}`;
      failed++;
    }
  }

  return NextResponse.json({ picked, done, failed });
}

