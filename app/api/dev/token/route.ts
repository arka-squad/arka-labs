import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '../../../../lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  if (isProd) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const role = (new URL(req.url).searchParams.get('role') || 'viewer') as any;
  if (!['viewer', 'editor', 'admin', 'owner'].includes(role)) return NextResponse.json({ error: 'invalid_role' }, { status: 400 });
  const token = signToken({ sub: `dev:${role}`, role });
  return NextResponse.json({ token, role });
}

