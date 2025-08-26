import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { withAuth } from '../../../lib/rbac';
import { hit } from '../../../lib/rate-limit';
import { log } from '../../../lib/logger';

export const GET = withAuth(['viewer', 'operator', 'owner'], async (req) => {
  const start = Date.now();
  const route = '/api/health';
  const ip = req.headers.get('x-forwarded-for') || 'global';
  if (hit(`health:${ip}`, 300, 60_000)) {
    log('info', 'health ratelimit', { route, status: 200, duration_ms: Date.now() - start });
    return NextResponse.json({ status: 'ratelimited' });
  }
  let db: 'OK' | 'ERROR' = 'ERROR';
  try {
    await sql`select now()`;
    db = 'OK';
  } catch {
    db = 'ERROR';
  }
  const uptime = process.uptime();
  const version = process.env.VERCEL_GIT_COMMIT_SHA || 'dev';
  const pr_bot_status: 'UNKNOWN' | 'OK' | 'ERROR' = 'UNKNOWN';
  log('info', 'health', { route, status: 200, duration_ms: Date.now() - start });
  return NextResponse.json({ db, uptime, version, pr_bot_status });
});
