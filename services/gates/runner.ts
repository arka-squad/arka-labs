import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export interface GateStep {
  gate_id: string;
  inputs: any;
  retry?: number;
  timeout_ms?: number;
  parallel?: boolean;
}

interface Job {
  id: string;
  userId: string;
  type: 'gate' | 'recipe';
  gate_id?: string;
  recipe_id?: string;
  status: 'running' | 'pass' | 'fail' | 'error';
  started_at: number; // epoch ms
  idempotency_key?: string;
  results?: any[];
  result?: any;
  error?: string;
  trace_id: string;
  finished_at?: string;
}

const jobs = new Map<string, Job>();
const userJobs = new Map<string, Set<string>>();
const idempotencyKeys = new Map<string, string>();

async function appendLog(jobId: string, type: 'gate' | 'recipe', evt: any) {
  const dir = path.join(
    process.cwd(),
    'logs',
    type === 'gate' ? 'gates' : 'recipes'
  );
  await fs.mkdir(dir, { recursive: true });
  const line = JSON.stringify({ ts: Date.now(), ...evt }) + '\n';
  await fs.appendFile(path.join(dir, `${jobId}.ndjson`), line);
}

async function writeResult(jobId: string, type: 'gate' | 'recipe', result: any) {
  const dir = path.join(
    process.cwd(),
    'results',
    type === 'gate' ? 'gates' : 'recipes'
  );
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, `${jobId}.json`),
    JSON.stringify(result, null, 2)
  );
}

async function runInSandbox(fn: Function, inputs: any, ctx: any) {
  const sandbox: any = { inputs, ctx, run: fn, console, setTimeout, clearTimeout };
  vm.createContext(sandbox);
  const script = new vm.Script('run(inputs, ctx)');
  const result = script.runInContext(sandbox);
  return await result;
}

async function executeStep(step: GateStep, jobId: string) {
  await appendLog(jobId, 'gate', { event: 'gate:start', gate_id: step.gate_id });
  const attempts = (step.retry ?? 0) + 1;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const modulePath = path.join(process.cwd(), 'gates', 'catalog', `${step.gate_id}.mjs`);
      const mod = await import(modulePath);
      const runPromise = runInSandbox(mod.run, step.inputs, {});
      const res = step.timeout_ms
        ? await Promise.race([
            runPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), step.timeout_ms)
            )
          ])
        : await runPromise;
      await appendLog(jobId, 'gate', { event: 'gate:pass', gate_id: step.gate_id });
      return res;
    } catch (err: any) {
      if (attempt === attempts) {
        await appendLog(jobId, 'gate', {
          event: 'gate:fail',
          gate_id: step.gate_id,
          error: err.message
        });
        throw err;
      }
      await appendLog(jobId, 'gate', {
        event: 'gate:retry',
        gate_id: step.gate_id,
        attempt
      });
    }
  }
}

async function runSteps(steps: GateStep[], jobId: string) {
  const results: any[] = [];
  let i = 0;
  while (i < steps.length) {
    if (steps[i].parallel) {
      const group: GateStep[] = [];
      while (i < steps.length && steps[i].parallel) {
        group.push(steps[i]);
        i++;
      }
      const groupRes = await Promise.all(group.map((s) => executeStep(s, jobId)));
      results.push(...groupRes);
    } else {
      results.push(await executeStep(steps[i], jobId));
      i++;
    }
  }
  return results;
}

export async function runGates(
  steps: GateStep[],
  opts: { userId: string; idempotencyKey?: string; traceId?: string }
) {
  const gateId = steps[0]?.gate_id;
  if (!gateId) throw new Error('gate_id-required');
  const key = opts.idempotencyKey
    ? `gate:${opts.userId}:${opts.idempotencyKey}`
    : undefined;
  if (key && idempotencyKeys.has(key)) {
    return jobs.get(idempotencyKeys.get(key)!)!;
  }
  const active = userJobs.get(opts.userId) ?? new Set();
  for (const jid of active) {
    const j = jobs.get(jid);
    if (j && j.status === 'running' && j.gate_id === gateId) {
      return j;
    }
  }
  if (active.size >= 5) {
    throw new Error('concurrency-limit');
  }
  const jobId = randomUUID();
  const now = Date.now();
  const job: Job = {
    id: jobId,
    userId: opts.userId,
    type: 'gate',
    gate_id: gateId,
    status: 'running',
    started_at: now,
    idempotency_key: opts.idempotencyKey,
    trace_id: opts.traceId || randomUUID(),
  };
  jobs.set(jobId, job);
  active.add(jobId);
  userJobs.set(opts.userId, active);
  if (key) idempotencyKeys.set(key, jobId);
  await appendLog(jobId, 'gate', { event: 'start', gate_id: gateId, trace_id: job.trace_id });
  try {
    const res = await runSteps(steps, jobId);
    job.status = 'pass';
    job.results = res;
    job.finished_at = new Date().toISOString();
    await appendLog(jobId, 'gate', { event: 'done', status: 'pass' });
    await writeResult(jobId, 'gate', { job_id: jobId, status: 'pass', results: res });
    return job;
  } catch (err: any) {
    job.status = 'fail';
    job.error = err.message;
    job.finished_at = new Date().toISOString();
    await appendLog(jobId, 'gate', { event: 'done', status: 'fail', error: err.message });
    await writeResult(jobId, 'gate', { job_id: jobId, status: 'fail', error: err.message });
    return job;
  } finally {
    const set = userJobs.get(opts.userId);
    if (set) set.delete(jobId);
  }
}

export async function runRecipe(
  recipeId: string,
  inputs: any,
  opts: { userId: string; idempotencyKey?: string; traceId?: string }
) {
  const key = opts.idempotencyKey
    ? `recipe:${opts.userId}:${opts.idempotencyKey}`
    : undefined;
  if (key && idempotencyKeys.has(key)) {
    return jobs.get(idempotencyKeys.get(key)!)!;
  }
  const active = userJobs.get(opts.userId) ?? new Set();
  if (active.size >= 5) {
    throw new Error('concurrency-limit');
  }
  const jobId = randomUUID();
  const job: Job = {
    id: jobId,
    userId: opts.userId,
    type: 'recipe',
    recipe_id: recipeId,
    status: 'running',
    trace_id: opts.traceId || randomUUID(),
    started_at: Date.now(),
  };
  jobs.set(jobId, job);
  active.add(jobId);
  userJobs.set(opts.userId, active);
  if (key) idempotencyKeys.set(key, jobId);
  await appendLog(jobId, 'recipe', { event: 'start', recipe_id: recipeId, trace_id: job.trace_id });
  try {
    const modulePath = path.join(process.cwd(), 'gates', 'catalog', `${recipeId}.mjs`);
    const mod = await import(modulePath);
    const res = await mod.run(inputs, {});
    job.status = res.status || 'pass';
    job.result = res;
    job.finished_at = new Date().toISOString();
    await appendLog(jobId, 'recipe', { event: 'done', status: job.status });
    await writeResult(jobId, 'recipe', { job_id: jobId, status: job.status, result: res });
    return job;
  } catch (err: any) {
    job.status = 'fail';
    job.error = err.message;
    job.finished_at = new Date().toISOString();
    await appendLog(jobId, 'recipe', { event: 'done', status: 'fail', error: err.message });
    await writeResult(jobId, 'recipe', { job_id: jobId, status: 'fail', error: err.message });
    return job;
  } finally {
    const set = userJobs.get(opts.userId);
    if (set) set.delete(jobId);
  }
}

export function getJob(jobId: string) {
  return jobs.get(jobId);
}
