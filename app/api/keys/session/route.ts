import { NextResponse } from 'next/server';
import { getSessionVault } from '../../../../lib/sessionVault';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') || '';
  // TTL endpoint peut être consulté sans JWT en dev pour faciliter l'UI
  const devBypass = process.env.NEXT_PUBLIC_COCKPIT_PREFILL === '1';
  if (!devBypass) {
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const token = auth.slice(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }
  }
  const sessionId = request.headers.get('x-provider-session') || (globalThis.localStorage as any)?.getItem?.('session_token') || '';
  if (!sessionId) return NextResponse.json({ ttl_remaining: null }, { status: 200 });
  const vault = getSessionVault();
  const session = vault.getSession(sessionId);
  if (!session) return NextResponse.json({ ttl_remaining: null }, { status: 200 });
  const ageSec = Math.floor((Date.now() - session.createdAt) / 1000);
  const ttl_remaining = Math.max(0, vault.ttlSeconds - ageSec);
  return NextResponse.json({ ttl_remaining }, { status: 200 });
}

