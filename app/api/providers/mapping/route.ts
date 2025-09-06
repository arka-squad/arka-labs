import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { getMapping, setMapping, ProviderMapping } from '../../../../lib/providers/mappingStore';

function authSub(req: Request): string | null {
  const devBypass = process.env.NEXT_PUBLIC_COCKPIT_PREFILL === '1' && (process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production');
  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    const user = verifyToken(auth.slice(7));
    if (user?.sub) return user.sub;
  }
  if (devBypass) return 'dev-user';
  return null;
}

export async function GET(req: Request) {
  const sub = authSub(req);
  if (!sub) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ mapping: getMapping(sub) }, { status: 200 });
}

export async function POST(req: Request) {
  const sub = authSub(req);
  if (!sub) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(()=>null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const mapping = (body.mapping || {}) as ProviderMapping;
  setMapping(sub, mapping);
  return NextResponse.json({ ok: true }, { status: 200 });
}

