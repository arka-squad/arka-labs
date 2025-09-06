import { NextResponse } from 'next/server';
import { signToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  const prefill = process.env.NEXT_PUBLIC_COCKPIT_PREFILL === '1';
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  if (!prefill || isProd) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const body = await request.json().catch(() => ({} as any));
  const role = (body?.role as string) || 'owner';
  const sub = (body?.sub as string) || 'dev-user';
  const token = signToken({ sub, role: role as any });
  return NextResponse.json({ jwt: token, role }, { status: 200 });
}

