import test from 'node:test';
import { runGates } from '../services/gates/runner';
import { strict as assert } from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

test('idempotency returns same job id', async () => {
  const steps = [{ gate_id: 'perf.api.ttft_p95', inputs: { window_minute: 1 } }];
  const job1 = await runGates(steps, { userId: 'u1', idempotencyKey: 'k1' });
  const job2 = await runGates(steps, { userId: 'u1', idempotencyKey: 'k1' });
  assert.equal(job1.id, job2.id);
});

test('concurrency limit 5 jobs per user with dedupe by gate_id', async () => {
  const ids = ['tmp1', 'tmp2', 'tmp3', 'tmp4', 'tmp5'].map((n) => `test.sleep.${n}`);
  for (const id of ids) {
    const file = path.join(process.cwd(), 'gates', 'catalog', `${id}.mjs`);
    await fs.writeFile(
      file,
      "export const meta={id:'" +
        id +
        "',version:'1.0.0',title:'tmp',category:'test',scope:'safe'};export function validate(i){return i;}export async function run(i){const ms=i.ms??0;await new Promise(r=>setTimeout(r,ms));return {gate_id:meta.id,status:'pass',metrics:{ms},evidence:[],message:'slept'}};"
    );
  }
  const step = (id: string) => [{ gate_id: id, inputs: { ms: 200 } }];
  const promises = ids.map((id) => runGates(step(id), { userId: 'u2' }));
  await assert.rejects(() => runGates(step('test.sleep'), { userId: 'u2' }), /concurrency-limit/);
  await Promise.all(promises);
  for (const id of ids) {
    await fs.unlink(path.join(process.cwd(), 'gates', 'catalog', `${id}.mjs`));
  }
});

test('dedupe by gate_id returns existing job', async () => {
  const step = [{ gate_id: 'test.sleep', inputs: { ms: 100 } }];
  const p1 = runGates(step, { userId: 'u3' });
  const p2 = runGates(step, { userId: 'u3' });
  const [j1, j2] = await Promise.all([p1, p2]);
  assert.equal(j1.id, j2.id);
});

test('retry unstable gate', async () => {
  const step = [{ gate_id: 'test.unstable', inputs: {}, retry: 1 }];
  const job = await runGates(step, { userId: 'u4' });
  assert.equal(job.status, 'pass');
});

test('timeout fails gate', async () => {
  const step = [{ gate_id: 'test.sleep', inputs: { ms: 200 }, timeout_ms: 50 }];
  const job = await runGates(step, { userId: 'u5' });
  assert.equal(job.status, 'fail');
});

test('persist logs and results', async () => {
  const step = [{ gate_id: 'perf.api.ttft_p95', inputs: { window_minute: 1 } }];
  const job = await runGates(step, { userId: 'u6' });
  const logPath = path.join(process.cwd(), 'logs', 'gates', `${job.id}.ndjson`);
  const resPath = path.join(process.cwd(), 'results', 'gates', `${job.id}.json`);
  assert.equal(await fileExists(logPath), true);
  assert.equal(await fileExists(resPath), true);
  const log = await fs.readFile(logPath, 'utf8');
  assert.ok(log.includes('gate:start'));
  const res = JSON.parse(await fs.readFile(resPath, 'utf8'));
  assert.equal(res.job_id, job.id);
});
