import { NextRequest, NextResponse } from 'next/server';

import path from 'node:path';
import { z } from 'zod';
import { withAuth, hasScope } from '../../../../lib/rbac';
import { runGates } from '../../../../services/gates/runner';
import { log } from '../../../../lib/logger';
import { TRACE_HEADER, generateTraceId } from '../../../../lib/trace';

const Body = z.object({ gate_id: z.string(), inputs: z.any().optional() });


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export const POST = withAuth(['editor', 'admin', 'owner'], async (req: NextRequest, user) => {
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  const route = '/api/gates/run';
  const start = Date.now();
  const key = req.headers.get('x-idempotency-key');
  if (!key) {
    log('warn', 'idempotency_key_required', { route, status: 400, trace_id: traceId });
    const res = NextResponse.json({ error: 'idempotency-key-required' }, { status: 400 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    log('warn', 'invalid_body', { route, status: 400, trace_id: traceId });
    const res = NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    res.headers.set(TRACE_HEADER, traceId);
    res.headers.set('x-idempotency-key', key);
    return res;
  }
  const { gate_id, inputs } = parsed.data;
  try {
    const mod = await import(path.join(process.cwd(), 'gates', 'catalog', `${gate_id}.mjs`));
    const scope: 'safe' | 'owner-only' = mod.meta?.scope === 'owner-only' ? 'owner-only' : 'safe';
    // Guard: ensure user is present (TypeScript safety) even though withAuth enforces auth
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (!hasScope(user.role, scope)) {
      log('info', 'forbidden_scope', { route, status: 403, trace_id: traceId });
      const res = NextResponse.json({ error: 'forbidden' }, { status: 403 });
      res.headers.set(TRACE_HEADER, traceId);
      res.headers.set('x-idempotency-key', key);
      return res;
    }
    const calledAt = Date.now();
    const job = await runGates([{ gate_id, inputs }], { userId: user.sub, idempotencyKey: key });
    if (job.started_at < calledAt && job.idempotency_key !== key) {
      log('info', 'already_running', { route, status: 409, trace_id: traceId });
      const res = NextResponse.json({ error: 'already_running', job_id: job.id }, { status: 409 });
      res.headers.set(TRACE_HEADER, traceId);
      res.headers.set('x-idempotency-key', key);
      return res;
    }
    log('info', 'gate_run', { route, status: 202, trace_id: traceId });
    const res = NextResponse.json({
      job_id: job.id,
      gate_id,
      inputs,
      accepted_at: new Date().toISOString(),
      trace_id: traceId,
    }, { status: 202 });
    res.headers.set(TRACE_HEADER, traceId);
    res.headers.set('x-idempotency-key', key);
    return res;
  } catch (err: any) {
    if (err.message === 'concurrency-limit') {
      log('warn', 'rate_limited', { route, status: 429, trace_id: traceId });
      const res = NextResponse.json({ error: 'rate_limited' }, { status: 429 });
      res.headers.set(TRACE_HEADER, traceId);
      res.headers.set('x-idempotency-key', key);
      return res;
    }
    log('error', 'gate_run_error', { route, status: 500, trace_id: traceId });
    const res = NextResponse.json({ error: 'internal_error' }, { status: 500 });
    res.headers.set(TRACE_HEADER, traceId);
    res.headers.set('x-idempotency-key', key);
    return res;
  }
});
