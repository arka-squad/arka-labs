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
  gate_id: string;
  status: 'running' | 'pass' | 'fail' | 'error';
  started_at: number;
  idempotency_key?: string;
  results?: any[];
  error?: string;
}

const jobs = new Map<string, Job>();
const userJobs = new Map<string, Set<string>>();
const idempotencyKeys = new Map<string, string>();

async function appendLog(jobId: string, evt: any) {
  const dir = path.join(process.cwd(), 'logs', 'gates');
  await fs.mkdir(dir, { recursive: true });
  const line = JSON.stringify({ ts: Date.now(), ...evt }) + '\n';
  await fs.appendFile(path.join(dir, `${jobId}.ndjson`), line);
}

async function writeResult(jobId: string, result: any) {
  const dir = path.join(process.cwd(), 'results', 'gates');
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
  await appendLog(jobId, { event: 'gate:start', gate_id: step.gate_id });
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
      await appendLog(jobId, { event: 'gate:pass', gate_id: step.gate_id });
      return res;
    } catch (err: any) {
      if (attempt === attempts) {
        await appendLog(jobId, {
          event: 'gate:fail',
          gate_id: step.gate_id,
          error: err.message
        });
        throw err;
      }
      await appendLog(jobId, {
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
  opts: { userId: string; idempotencyKey?: string }
) {
  const gateId = steps[0]?.gate_id;
  if (!gateId) throw new Error('gate_id-required');
  const key = opts.idempotencyKey
    ? `${opts.userId}:${opts.idempotencyKey}`
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
    gate_id: gateId,
    status: 'running',
    started_at: now,
    idempotency_key: opts.idempotencyKey,
  };
  jobs.set(jobId, job);
  active.add(jobId);
  userJobs.set(opts.userId, active);
  if (key) idempotencyKeys.set(key, jobId);
  await appendLog(jobId, { event: 'start', gate_id: gateId });
  try {
    const res = await runSteps(steps, jobId);
    job.status = 'pass';
    job.results = res;
    await appendLog(jobId, { event: 'done', status: 'pass' });
    await writeResult(jobId, { job_id: jobId, status: 'pass', results: res });
    return job;
  } catch (err: any) {
    job.status = 'fail';
    job.error = err.message;
    await appendLog(jobId, { event: 'done', status: 'fail', error: err.message });
    await writeResult(jobId, { job_id: jobId, status: 'fail', error: err.message });
    return job;
  } finally {
    const set = userJobs.get(opts.userId);
    if (set) set.delete(jobId);
  }
}

export function getJob(jobId: string) {
  return jobs.get(jobId);
}
