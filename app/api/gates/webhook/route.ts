export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, isReplay } from '../../../../lib/webhook';
import { log } from '../../../../lib/logger';
import { TRACE_HEADER, generateTraceId } from '../../../../lib/trace';

export const POST = async (req: NextRequest) => {
  const start = Date.now();
  const trace_id = req.headers.get(TRACE_HEADER) || generateTraceId();
  const route = '/api/gates/webhook';
  const signature = req.headers.get('x-signature');
  const eventId = req.headers.get('x-event-id');
  if (!signature || !eventId) {
    const res = NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    res.headers.set(TRACE_HEADER, trace_id);
    log('info', 'gates_webhook', { route, status: res.status, duration_ms: Date.now() - start, trace_id });
    return res;
  }
  const raw = await req.text();
  const secret = process.env.GATES_WEBHOOK_SECRET || '';
  if (!verifySignature(signature, raw, secret)) {
    const res = NextResponse.json({ error: 'bad_signature' }, { status: 401 });
    res.headers.set(TRACE_HEADER, trace_id);
    log('info', 'gates_webhook', { route, status: res.status, duration_ms: Date.now() - start, trace_id });
    return res;
  }
  if (isReplay(eventId, signature)) {
    const res = NextResponse.json({ ok: true, idempotent: true });
    res.headers.set(TRACE_HEADER, trace_id);
    log('info', 'gates_webhook', { route, status: res.status, duration_ms: Date.now() - start, trace_id });
    return res;
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set(TRACE_HEADER, trace_id);
  log('info', 'gates_webhook', { route, status: res.status, duration_ms: Date.now() - start, trace_id });
  return res;
};
