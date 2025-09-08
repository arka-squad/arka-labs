import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const traceId = req.headers.get('x-trace-id') ?? crypto.randomUUID();
  const res = NextResponse.json({ status: 'ok' }, { status: 200 });
  res.headers.set('x-trace-id', traceId);
  return res;
}

