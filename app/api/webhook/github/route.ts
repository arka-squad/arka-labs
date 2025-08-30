export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { hit } from '../../../../lib/rate-limit';
import { log } from '../../../../lib/logger';
import { withAuth } from '../../../../lib/rbac';
import { verifyHmac } from '../../../../lib/hmac';
import { sql } from '../../../../lib/db';

const memDelivered = new Set<string>();

async function isDuplicate(deliveryId: string): Promise<boolean> {
  try {
    const res = await sql`INSERT INTO webhook_deliveries (delivery_id, processed_at, status) VALUES (${deliveryId}, now(), 'processed') ON CONFLICT (delivery_id) DO UPDATE SET status = 'duplicate' RETURNING status`;
    return res.rows[0]?.status === 'duplicate';
  } catch {
    // fallback when db unavailable (tests)
    if (memDelivered.has(deliveryId)) return true;
    memDelivered.add(deliveryId);
    return false;
  }
}

export const POST = withAuth(['github-webhook'], async (req: NextRequest) => {
  const start = Date.now();
  const route = '/api/webhook/github';
  const ip = req.headers.get('x-forwarded-for') || 'global';
  const trace = req.headers.get('x-trace-id') || undefined;
  if (hit(`gh:${ip}`, 60, 60_000)) {
    log('info', 'ratelimit', { route, trace_id: trace, status: 202, duration_ms: Date.now() - start });
    return new NextResponse(null, { status: 202 });
  }
  const sig = req.headers.get('x-hub-signature-256');
  if (!sig) {
    log('warn', 'missing hmac', { route, trace_id: trace, status: 403, duration_ms: Date.now() - start });
    return new NextResponse('forbidden', { status: 403 });
  }
  const deliveryId = req.headers.get('x-github-delivery');
  const event = req.headers.get('x-github-event');
  if (!deliveryId || !event) {
    log('warn', 'missing headers', { route, trace_id: trace, status: 400, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const raw = await req.text();
  const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
  if (!verifyHmac(sig, raw, secret)) {
    log('warn', 'invalid hmac', { delivery_id: deliveryId, trace_id: trace, route, status: 403, duration_ms: Date.now() - start });
    return new NextResponse('forbidden', { status: 403 });
  }
  if (await isDuplicate(deliveryId)) {
    log('info', 'duplicate', { delivery_id: deliveryId, trace_id: trace, route, status: 202, duration_ms: Date.now() - start });
    return NextResponse.json({ status: 'duplicate' }, { status: 202 });
  }
  let payload: any = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    log('warn', 'bad payload', { delivery_id: deliveryId, trace_id: trace, route, status: 400, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const allow = (process.env.ALLOWLIST_REPOS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const repoFull: string | undefined = payload?.repository?.full_name;
  if (allow.length && (!repoFull || !allow.includes(repoFull))) {
    log('warn', 'repo not allowed', { delivery_id: deliveryId, trace_id: trace, route, status: 403, duration_ms: Date.now() - start });
    return new NextResponse('forbidden', { status: 403 });
  }
  const runId = payload?.workflow_run?.id || null;
  const asyncEvents = new Set(['workflow_run', 'workflow_job']);
  if (asyncEvents.has(event)) {
    try {
      await sql`INSERT INTO action_queue (kind, payload, status) VALUES (${`github:${event}`}, ${payload}, 'queued')`;
    } catch {}
    log('info', 'accepted', { delivery_id: deliveryId, trace_id: trace, run_id: runId, route, status: 202, duration_ms: Date.now() - start });
    return new NextResponse(null, { status: 202 });
  }
  log('info', 'handled', { delivery_id: deliveryId, trace_id: trace, route, status: 200, duration_ms: Date.now() - start });
  return NextResponse.json({ status: 'ok' });
});
