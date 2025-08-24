import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  const required = ['POSTGRES_URL', 'MODE', 'ALLOWLIST_REPOS'];
  const missing = required.filter((k) => !process.env[k]);

  let dbOk = false;
  let now: string | null = null;
  try {
    const result = await sql`select now()`;
    dbOk = true;
    const value = result.rows[0]?.now;
    now = value instanceof Date ? value.toISOString() : String(value);
  } catch {
    dbOk = false;
  }

  const status = dbOk && missing.length === 0 ? 'ok' : 'degraded';

  return NextResponse.json({
    status,
    env: { missing, mode: process.env.MODE },
    db: { ok: dbOk, now },
    app: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
  });
}
