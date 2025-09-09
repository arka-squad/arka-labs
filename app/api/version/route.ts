import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  // Commit/Env fournis par Vercel si disponibles
  const commit_sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || '';
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || '';
  let version = '';
  try {
    const pkg = require('../../../package.json');
    version = pkg.version || '';
  } catch {}
  return NextResponse.json({ version, commit_sha, env }, { status: 200 });
}

