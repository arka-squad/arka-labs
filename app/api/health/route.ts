import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  const required = ['POSTGRES_URL', 'MODE', 'ALLOWLIST_REPOS'];
  const missing = required.filter((v) => !process.env[v]);

  let dbOk = false;
  try {
    await sql`select now()`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const status = dbOk && missing.length === 0 ? 'ok' : 'degraded';
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_SHA || '';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || '';

  return NextResponse.json({
    status,
    env: { missing },
    db: { ok: dbOk },
    app: { commit, branch },
  });
}
