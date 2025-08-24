import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { gatherMetrics } from '@/lib/metrics';

export async function GET() {
  const db = getDb();
  let dbOk = false;
  try {
    await db.query('select 1');
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const required = [
    'POSTGRES_URL',
    'OPENAI_API_KEY',
    'GITHUB_APP_ID',
    'GITHUB_PRIVATE_KEY',
    'GITHUB_WEBHOOK_SECRET',
    'ALLOWLIST_REPOS',
    'MODE',
    'MEMORY_PR',
  ];
  const missing = required.filter((k) => !process.env[k]);
  return NextResponse.json({ ok: dbOk && missing.length === 0, db: dbOk, missing, metrics: gatherMetrics() });
}
