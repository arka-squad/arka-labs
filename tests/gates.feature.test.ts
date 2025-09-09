import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

// Configure JWT for tests
process.env.JWT_SECRET = '12345678901234567890123456789012';
process.env.JWT_ISSUER = 'arka';
process.env.JWT_AUDIENCE = 'arka-squad';

const { signToken } = require('../lib/auth');

const tokens = {
  viewer: signToken({ sub: 'v', role: 'viewer' }),
  admin: signToken({ sub: 'a', role: 'admin' }),
  owner: signToken({ sub: 'o', role: 'owner' }),
};

// Avoid real DB inserts in withAuth
test.before(() => {
  const dbPath = require.resolve('../lib/db');
  const original = require(dbPath);
  require.cache[dbPath] = {
    ...(require.cache[dbPath] as any),
    exports: { ...original, sql: async () => ({ rows: [] }) },
  } as any;
});

const jsonReq = (url: string, method: string, body?: any, headers: Record<string, string> = {}) =>
  new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

test('GET /api/gates requires viewer+ and returns items', async () => {
  const { GET } = require('../app/api/gates/route');
  const res = await GET(new NextRequest('http://test/api/gates', { headers: { authorization: `Bearer ${tokens.viewer}` } }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.items) && body.items.length >= 1);
});

test('POST /api/gates/run creates a job and logs NDJSON; idempotency reuses job', async () => {
  const { POST } = require('../app/api/gates/run/route');
  const key = 'idem-test-1';
  // Run safe gate with admin
  let res = await POST(
    jsonReq('http://test/api/gates/run', 'POST', { gate_id: 'perf.api.ttft_p95', inputs: { window_minute: 1 } }, {
      authorization: `Bearer ${tokens.admin}`,
      'x-idempotency-key': key,
    }),
    { role: 'admin' }
  );
  assert.equal(res.status, 202);
  const body = await res.json();
  const jobId = body.job_id;
  assert.ok(jobId);
  // Second call with same key should reuse job_id
  res = await POST(
    jsonReq('http://test/api/gates/run', 'POST', { gate_id: 'perf.api.ttft_p95', inputs: { window_minute: 1 } }, {
      authorization: `Bearer ${tokens.admin}`,
      'x-idempotency-key': key,
    }),
    { role: 'admin' }
  );
  const body2 = await res.json();
  assert.equal(body2.job_id, jobId);

  // Poll job + logs
  const jobRoute = require('../app/api/gates/jobs/[id]/route');
  const logsRoute = require('../app/api/gates/jobs/[id]/logs/route');
  // allow time for simulated runner
  await wait(900);
  let jobRes = await jobRoute.GET(new NextRequest(`http://test/api/gates/jobs/${jobId}`, { headers: { authorization: `Bearer ${tokens.viewer}` } }), { params: { id: jobId } });
  assert.equal(jobRes.status, 200);
  const jobBody = await jobRes.json();
  assert.ok(['running', 'pass', 'fail', 'warn', 'error', 'canceled'].includes(jobBody.job.status));

  const logsRes = await logsRoute.GET(new NextRequest(`http://test/api/gates/jobs/${jobId}/logs`, { headers: { authorization: `Bearer ${tokens.viewer}` } }), { params: { id: jobId } });
  assert.equal(logsRes.status, 200);
  const text = await logsRes.text();
  assert.ok(text.includes('gate:start'));
});

test('POST /api/gates/run forbids owner-only gate for admin', async () => {
  const { POST } = require('../app/api/gates/run/route');
  const res = await POST(
    jsonReq('http://test/api/gates/run', 'POST', { gate_id: 'security.webhook.hmac', inputs: {} }, {
      authorization: `Bearer ${tokens.admin}`,
      'x-idempotency-key': 'idem-test-2',
    }),
    { role: 'admin' }
  );
  assert.equal(res.status, 403);
});

test('POST /api/recipes/run executes steps and completes', async () => {
  const { POST } = require('../app/api/recipes/run/route');
  const res = await POST(
    jsonReq('http://test/api/recipes/run', 'POST', { recipe_id: 'release.preflight', inputs: {} }, {
      authorization: `Bearer ${tokens.admin}`,
      'x-idempotency-key': 'idem-test-3',
    }),
    { role: 'admin' }
  );
  assert.equal(res.status, 202);
  const body = await res.json();
  const jobId = body.job_id;
  const jobRoute = require('../app/api/gates/jobs/[id]/route');
  await wait(1000);
  const jobRes = await jobRoute.GET(new NextRequest(`http://test/api/gates/jobs/${jobId}`, { headers: { authorization: `Bearer ${tokens.viewer}` } }), { params: { id: jobId } });
  assert.equal(jobRes.status, 200);
  const jobBody = await jobRes.json();
  assert.equal(jobBody.job.type, 'recipe');
});

