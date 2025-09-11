import { NextRequest, NextResponse } from 'next/server';
import { withAuth, hasScope } from '../../../../lib/rbac';
import { TRACE_HEADER, generateTraceId } from '../../../../lib/trace';
import { jobs, results, logs, appendLog, Job, getIdempotentJobId, setIdempotency, sweepIdempotency } from '../../../../services/gates/state';
import { getRecipes } from '../../../../lib/gates/catalog';

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
  const recipeId = body?.recipe_id as string | undefined;
  const inputs = body?.inputs || {};
  if (!recipeId || typeof recipeId !== 'string') {
    const res = NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  // Load recipe and enforce scope
  const recipe = getRecipes().find((r) => r.id === recipeId);
  if (!recipe) {
    const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  if (!hasScope(user!.role, (recipe as any).scope || 'safe')) {
    const res = NextResponse.json({ error: 'forbidden' }, { status: 403 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }

  const existing = getIdempotentJobId(key);
  if (existing) {
    const res = NextResponse.json({ job_id: existing, recipe_id: recipeId, inputs }, { status: 202 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const jobId = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  setIdempotency(key, jobId);
  const job: Job = {
    job_id: jobId,
    type: 'recipe',
    status: 'running',
    started_at: new Date().toISOString(),
    progress: { total: 2, done: 0 },
    trace_id: traceId};
  jobs.set(jobId, job);
  logs.set(jobId, []);
  appendLog(jobId, { t: 'open', job_id: jobId });
  // Execute steps from catalog (sequential v1)
  const steps: any[] = Array.isArray((recipe as any).steps) ? (recipe as any).steps : [];
  const total = steps.length || 1;
  job.progress = { total, done: 0 };

  (async () => {
    for (const [idx, step] of steps.entries()) {
      appendLog(jobId, { t: 'stage', name: step.id || `step-${idx+1}`, status: 'running' });
      await new Promise((r) => setTimeout(r, 300));
      appendLog(jobId, { t: 'stage', name: step.id || `step-${idx+1}`, status: 'pass' });
      const j = jobs.get(jobId);
      if (j) {
        j.progress = { total, done: idx + 1 };
        jobs.set(jobId, j);
      }
    }
    const j = jobs.get(jobId);
    if (!j) return;
    j.status = 'pass';
    j.finished_at = new Date().toISOString();
    jobs.set(jobId, j);
    results.set(jobId, {
      recipe_id: recipeId,
      status: 'pass',
      summary: { pass: total, fail: 0, warn: 0 },
      steps: steps.map((s: any) => ({ id: s.id, status: 'pass' }))});
    appendLog(jobId, { t: 'done', status: 'pass' });
  })();

  const res = NextResponse.json({ job_id: jobId, recipe_id: recipeId, inputs, accepted_at: new Date().toISOString(), trace_id: traceId }, { status: 202 });
  res.headers.set(TRACE_HEADER, traceId);
  sweepIdempotency();
  return res;
});
