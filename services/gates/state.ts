export type JobStatus = 'queued' | 'running' | 'pass' | 'fail' | 'warn' | 'error' | 'canceled';

export type Job = {
  job_id: string;
  type: 'gate' | 'recipe';
  status: JobStatus;
  started_at?: string;
  finished_at?: string;
  progress: { total: number; done: number };
  trace_id: string;
};

export type GateRunResult = {
  gate_id: string;
  status: 'pass' | 'fail' | 'warn';
  metrics: Record<string, number | string>;
  evidence: any[];
  message?: string;
};

export type RecipeRunResult = {
  recipe_id: string;
  status: 'pass' | 'fail' | 'warn' | 'error';
  summary: { pass: number; fail: number; warn: number };
  steps: Array<{ id: string; status: JobStatus; gate_result?: GateRunResult }>;
};

export const jobs = new Map<string, Job>();
export const results = new Map<string, GateRunResult | RecipeRunResult>();
export const logs = new Map<string, string[]>();

type IdemEntry = { jobId: string; exp: number };
const IDEMP_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const idempotency = new Map<string, IdemEntry>();

export function appendLog(jobId: string, entry: Record<string, any>) {
  const arr = logs.get(jobId) || [];
  arr.push(JSON.stringify({ ts: new Date().toISOString(), ...entry }));
  logs.set(jobId, arr);
}

export function setIdempotency(key: string, jobId: string) {
  const exp = Date.now() + IDEMP_TTL_MS;
  idempotency.set(key, { jobId, exp });
}

export function getIdempotentJobId(key: string): string | null {
  const e = idempotency.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) {
    idempotency.delete(key);
    return null;
  }
  return e.jobId;
}

// lightweight sweep to prevent unbounded growth
export function sweepIdempotency() {
  const now = Date.now();
  for (const [k, v] of idempotency.entries()) {
    if (v.exp <= now) idempotency.delete(k);
  }
}

