import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { verifySignature, isReplay } from '../../../../lib/webhook';
import { log } from '../../../../lib/logger';

export const POST = async (req: NextRequest) => {
  const start = Date.now();
  const trace_id = req.headers.get('x-trace-id') || undefined;
  const route = '/api/webhook/github';
  const signature = req.headers.get('x-hub-signature-256');
  const eventId = req.headers.get('x-github-delivery');
  if (!signature || !eventId) {
    const res = NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    log('info', 'webhook_github', { route, status: res.status, duration_ms: Date.now() - start, trace_id });
    return res;
  }
  const raw = await req.text();
  const secret = process.env.WEBHOOK_SECRET || '';
  if (!verifySignature(signature, raw, secret)) {
    const res = NextResponse.json({ error: 'bad_signature' }, { status: 401 });
    log('info', 'webhook_github', { route, status: res.status, duration_ms: Date.now() - start, trace_id });
    return res;
  }
  if (isReplay(eventId, signature)) {
    const res = NextResponse.json({ ok: true, idempotent: true });
    log('info', 'webhook_github', { route, status: res.status, duration_ms: Date.now() - start, trace_id });
    return res;
  }
  const res = NextResponse.json({ ok: true });
  log('info', 'webhook_github', { route, status: res.status, duration_ms: Date.now() - start, trace_id });
  return res;
};
