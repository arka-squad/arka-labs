import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';

process.env.JWT_SECRET = 'a'.repeat(32);
process.env.JWT_ISSUER = 'arka';
process.env.JWT_AUDIENCE = 'arka-squad';

const jwt = require('jsonwebtoken');
function signToken(payload: any) {
  const secret = 'a'.repeat(32);
  return jwt.sign(payload, secret, {
    issuer: 'arka',
    audience: 'arka-squad',
  });
}
import { GET as listGates } from '../app/api/gates/route';
import { GET as listRecipes } from '../app/api/recipes/route';
import { POST as runGate } from '../app/api/gates/run/route';
import { POST as runRecipe } from '../app/api/recipes/run/route';
import { GET as jobStatus } from '../app/api/gates/jobs/[id]/route';
import { GET as jobLogs } from '../app/api/gates/jobs/[id]/logs/route';

const token = signToken({ sub: 'u1', role: 'owner' });

function request(method: string, url: string, body?: any, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    method,
    headers: { authorization: `Bearer ${token}`, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('list gates and recipes', async () => {
  let res = await listGates(request('GET', 'http://test/api/gates'));
  assert.equal(res.status, 200);
  const g = await res.json();
  assert.ok(Array.isArray(g.items));
  res = await listRecipes(request('GET', 'http://test/api/recipes'));
  assert.equal(res.status, 200);
  const r = await res.json();
  assert.ok(Array.isArray(r.items));
});

test('run gate and recipe and fetch job', async () => {
  const key = randomUUID();
  let res = await runGate(
    request(
      'POST',
      'http://test/api/gates/run',
      { gate_id: 'perf.api.ttft_p95', inputs: { window_minute: 1 } },
      { 'x-idempotency-key': key }
    )
  );
  assert.equal(res.status, 202);
  const body = await res.json();
  const jobId = body.job_id as string;
  res = await jobStatus(request('GET', `http://test/api/gates/jobs/${jobId}`), { params: { id: jobId } });
  assert.equal(res.status, 200);
  const info = await res.json();
  assert.equal(info.job.job_id, jobId);
  res = await jobLogs(request('GET', `http://test/api/gates/jobs/${jobId}/logs`), { params: { id: jobId } });
  assert.equal(res.status, 200);
  const txt = await res.text();
  assert.ok(txt.includes('gate:start'));

  const key2 = randomUUID();
  res = await runRecipe(
    request(
      'POST',
      'http://test/api/recipes/run',
      { recipe_id: 'release.preflight', inputs: { window_minute: 1, payload: 'p', secret: 's' } },
      { 'x-idempotency-key': key2 }
    )
  );
  assert.equal(res.status, 202);
});
