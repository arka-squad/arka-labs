export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { hit } from '../../../../lib/rate-limit';
import { log } from '../../../../lib/logger';
import { withAuth } from '../../../../lib/rbac';

const processed = new Set<string>();

function verify(sig: string | null, payload: string, secret: string) {
  if (!sig) return false;
  const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expected = `sha256=${h}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export const POST = withAuth(['github-webhook'], async (req: NextRequest) => {
  const start = Date.now();
  const route = '/api/webhook/github';
  const ip = req.headers.get('x-forwarded-for') || 'global';
  if (hit(`gh:${ip}`, 60, 60_000)) {
    log('info', 'ratelimit', { route, status: 202, duration_ms: Date.now() - start });
    return new NextResponse(null, { status: 202 });
  }
  const sig = req.headers.get('x-hub-signature-256');
  const deliveryId = req.headers.get('x-github-delivery');
  const event = req.headers.get('x-github-event');
  if (!sig || !deliveryId || !event) {
    log('warn', 'missing headers', { route, status: 400, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const raw = await req.text();
  const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
  if (!verify(sig, raw, secret)) {
    log('warn', 'invalid hmac', { delivery_id: deliveryId, route, status: 403, duration_ms: Date.now() - start });
    return new NextResponse('forbidden', { status: 403 });
  }
  if (processed.has(deliveryId)) {
    log('info', 'duplicate', { delivery_id: deliveryId, route, status: 200, duration_ms: Date.now() - start });
    return NextResponse.json({ status: 'duplicate' });
  }
  let payload: any = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    log('warn', 'bad payload', { delivery_id: deliveryId, route, status: 400, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const allow = (process.env.ALLOWLIST_REPOS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const repoFull: string | undefined = payload?.repository?.full_name;
  if (allow.length && (!repoFull || !allow.includes(repoFull))) {
    log('warn', 'repo not allowed', { delivery_id: deliveryId, route, status: 403, duration_ms: Date.now() - start });
    return new NextResponse('forbidden', { status: 403 });
  }
  processed.add(deliveryId);
  const runId = payload?.workflow_run?.id || null;
  const interesting = new Set(['push', 'pull_request', 'workflow_run', 'workflow_job', 'issues', 'issue_comment']);
  if (!interesting.has(event)) {
    log('info', 'noop', { delivery_id: deliveryId, route, status: 200, duration_ms: Date.now() - start });
    return NextResponse.json({ status: 'noop' });
  }
  log('info', 'accepted', { delivery_id: deliveryId, run_id: runId, route, status: 202, duration_ms: Date.now() - start });
  return new NextResponse(null, { status: 202 });
});
