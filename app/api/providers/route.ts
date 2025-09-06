import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PROVIDERS_SEED } from '../../../lib/providers/seed';
import { log } from '../../../lib/logger';

// Server Component Route (Next.js App Router)
export async function GET(request: Request) {
  // Allow public providers list in dev for UI integration
  if (process.env.NEXT_PUBLIC_COCKPIT_PREFILL !== '1') {
    const auth = request.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const token = auth.slice(7);
    try {
      verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }
  }

  const data = { providers: PROVIDERS_SEED, timestamp: Date.now() };
  log('info', 'providers_list', { route: '/api/providers', status: 200 });
  return NextResponse.json(data);
}
