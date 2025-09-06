import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionVault } from '../../../lib/sessionVault';
import { verifyToken } from '../../../lib/auth';

const exchangeSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'openrouter', 'vercel_ai']),
  key: z.string().min(1),
});

export async function POST(request: Request) {

  const prefill = process.env.NEXT_PUBLIC_COCKPIT_PREFILL === '1';
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const auth = request.headers.get('authorization') || '';
  if (!(prefill && !isProd)) {
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const token = auth.slice(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

  }

  const body = await request.json().catch(() => null);
  const parsed = exchangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const { provider, key } = parsed.data;
  const vault = getSessionVault();
  const sessionToken = vault.createSession(provider, key);
  return NextResponse.json({ session_token: sessionToken, ttl_sec: vault.ttlSeconds }, { status: 201 });
}

export async function DELETE(request: Request) {

  const prefill = process.env.NEXT_PUBLIC_COCKPIT_PREFILL === '1';
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const auth = request.headers.get('authorization') || '';
  if (!(prefill && !isProd)) {
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const token = auth.slice(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
  const ok = getSessionVault().revokeSession(id);
  if (!ok) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}

