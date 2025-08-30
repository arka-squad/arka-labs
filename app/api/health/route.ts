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
    log('info', 'health ratelimit', {
      route,
      status: 200,
      duration_ms: Date.now() - start,
    });
    const commit = process.env.VERCEL_GIT_COMMIT_SHA;
    const branch = process.env.VERCEL_GIT_COMMIT_REF;
    const compat = {
      db: 'ERROR',
      uptime: process.uptime(),
      version: commit || 'dev',
      pr_bot_status: 'UNKNOWN' as 'UNKNOWN',
    };
    return NextResponse.json({
      ...compat,
      status: 'ratelimited',
      env: { missing: [] },
      app: { commit, branch },
    });
  }
  let dbOk = false;
  try {
    await sql`select now()`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const commit = process.env.VERCEL_GIT_COMMIT_SHA;
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  const missing: string[] = [];
  const status = dbOk && missing.length === 0 ? 'ok' : 'error';
  const compat = {
    db: dbOk ? 'OK' : 'ERROR',
    uptime: process.uptime(),
    version: commit || 'dev',
    pr_bot_status: 'UNKNOWN' as 'UNKNOWN' | 'OK' | 'ERROR',
  };
  log('info', 'health', {
    route,
    status: 200,
    duration_ms: Date.now() - start,
  });
  return NextResponse.json({
    ...compat,
    status,
    env: { missing },
    app: { commit, branch },
  });
});
