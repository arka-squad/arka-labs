import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { TRACE_HEADER, generateTraceId } from '../../../../lib/trace';
import { jobs, results, logs, idempotency, appendLog, Job } from '../../../../services/gates/state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(['admin', 'owner'], async (req: NextRequest) => {
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  const key = req.headers.get('x-idempotency-key');
  if (!key) {
    const res = NextResponse.json({ error: 'idempotency-key-required' }, { status: 400 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const body = await req.json().catch(() => ({}));
  const recipeId = body?.recipe_id as string | undefined;
  const inputs = body?.inputs || {};
  if (!recipeId || typeof recipeId !== 'string') {
    const res = NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const existing = idempotency.get(key);
  if (existing) {
    const res = NextResponse.json({ job_id: existing, recipe_id: recipeId, inputs }, { status: 202 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const jobId = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  idempotency.set(key, jobId);
  const job: Job = {
    job_id: jobId,
    type: 'recipe',
    status: 'running',
    started_at: new Date().toISOString(),
    progress: { total: 2, done: 0 },
    trace_id: traceId,
  };
  jobs.set(jobId, job);
  logs.set(jobId, []);
  appendLog(jobId, { t: 'open', job_id: jobId });
  appendLog(jobId, { t: 'stage', name: 'step-1', status: 'running' });

  setTimeout(() => {
    const j = jobs.get(jobId);
    if (!j) return;
    j.progress = { total: 2, done: 1 };
    logs.get(jobId)?.push(JSON.stringify({ ts: new Date().toISOString(), t: 'stage', name: 'step-1', status: 'pass' }));
    logs.get(jobId)?.push(JSON.stringify({ ts: new Date().toISOString(), t: 'stage', name: 'step-2', status: 'running' }));
    setTimeout(() => {
      const jj = jobs.get(jobId);
      if (!jj) return;
      jj.status = 'pass';
      jj.finished_at = new Date().toISOString();
      jj.progress = { total: 2, done: 2 };
      jobs.set(jobId, jj);
      results.set(jobId, {
        recipe_id: recipeId,
        status: 'pass',
        summary: { pass: 2, fail: 0, warn: 0 },
        steps: [
          { id: 'step-1', status: 'pass' },
          { id: 'step-2', status: 'pass' }
        ],
      });
      appendLog(jobId, { t: 'done', status: 'pass' });
    }, 600);
  }, 400);

  const res = NextResponse.json({ job_id: jobId, recipe_id: recipeId, inputs, accepted_at: new Date().toISOString(), trace_id: traceId }, { status: 202 });
  res.headers.set(TRACE_HEADER, traceId);
  return res;
});

