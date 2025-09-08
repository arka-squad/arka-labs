import { NextRequest, NextResponse } from 'next/server';
import { withAuth, hasScope } from '../../../../lib/rbac';
import { TRACE_HEADER, generateTraceId } from '../../../../lib/trace';
import { jobs, results, logs, appendLog, Job, getIdempotentJobId, setIdempotency, sweepIdempotency } from '../../../../services/gates/state';
import { getGates } from '../../../../lib/gates/catalog';
import { validateInputs } from '../../../../lib/gates/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(['admin', 'owner'], async (req: NextRequest, user: any) => {
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  const key = req.headers.get('x-idempotency-key');
  if (!key) {
    const res = NextResponse.json({ error: 'idempotency-key-required' }, { status: 400 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const body = await req.json().catch(() => ({}));
  const gateId = body?.gate_id as string | undefined;
  const inputs = body?.inputs || {};
  if (!gateId || typeof gateId !== 'string') {
    const res = NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  // Load gate meta and enforce scope
  const gate = getGates().find((g) => g.id === gateId);
  if (!gate) {
    const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  if (!hasScope(user!.role, (gate as any).scope || 'safe')) {
    const res = NextResponse.json({ error: 'forbidden' }, { status: 403 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  // Idempotency reuse
  const existing = getIdempotentJobId(key);
  if (existing) {
    const res = NextResponse.json({ job_id: existing, gate_id: gateId, inputs }, { status: 202 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  // input validation
  const v = validateInputs((gate as any).inputs, inputs);
  if (!v.ok) {
    const res = NextResponse.json({ error: 'shape_mismatch', details: v.errors }, { status: 422 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const jobId = `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  setIdempotency(key, jobId);
  const job: Job = {
    job_id: jobId,
    type: 'gate',
    status: 'running',
    started_at: new Date().toISOString(),
    progress: { total: 1, done: 0 },
    trace_id: traceId,
  };
  jobs.set(jobId, job);
  logs.set(jobId, []);
  appendLog(jobId, { t: 'gate:start', gate_id: gateId, inputs });

  // Simulate async gate evaluation
  setTimeout(() => {
    const j = jobs.get(jobId);
    if (!j) return;
    appendLog(jobId, { t: 'gate:metric', k: 'p95_ms', v: 123 });
    j.status = 'pass';
    j.finished_at = new Date().toISOString();
    j.progress = { total: 1, done: 1 };
    jobs.set(jobId, j);
    results.set(jobId, {
      gate_id: gateId,
      status: 'pass',
      metrics: { p95_ms: 123 },
      evidence: [],
    });
    appendLog(jobId, { t: 'gate:pass', summary: { p95_ms: 123 } });
    appendLog(jobId, { t: 'done', status: 'pass' });
  }, 800);

  const res = NextResponse.json({ job_id: jobId, gate_id: gateId, inputs, accepted_at: new Date().toISOString(), trace_id: traceId }, { status: 202 });
  res.headers.set(TRACE_HEADER, traceId);
  // periodic sweep (best-effort)
  sweepIdempotency();
  return res;
});
