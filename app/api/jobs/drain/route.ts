import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const cron = req.headers.get('x-vercel-cron');
  if (!cron && process.env.MODE !== 'dev') {
    return NextResponse.json({ error: 'forbidden' }, { status: 401 });
  }

  const jobs = await sql`SELECT id, kind, payload FROM action_queue WHERE status='queued' ORDER BY scheduled_at, id LIMIT 10`;

  let done = 0;
  let failed = 0;

  for (const job of jobs.rows) {
    try {
      await sql`UPDATE action_queue SET status='running', attempts = attempts + 1 WHERE id=${job.id}`;
      // placeholder no-op processing
      await sql`UPDATE action_queue SET status='done' WHERE id=${job.id}`;
      done++;
    } catch {
      await sql`UPDATE action_queue SET status='failed' WHERE id=${job.id}`;
      failed++;
    }
  }

  return NextResponse.json({ picked: jobs.rowCount, done, failed });
}
