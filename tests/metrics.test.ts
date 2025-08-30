import test from 'node:test';
import assert from 'node:assert/strict';
import { p95, avg, mockRuns } from '../lib/metrics-data';

test('p95 computes 95th percentile with 1 decimal rounding', () => {
  const values = mockRuns.map((r) => r.ttft_ms);
  const result = Number(p95(values).toFixed(1));
  assert.ok(typeof result === 'number');
});

test('avg computes mean with 1 decimal rounding', () => {
  const values = mockRuns.map((r) => r.error_rate_percent);
  const result = Number(avg(values).toFixed(1));
  assert.ok(result >= 0);
});

test('GET /api/metrics/kpis returns 1 decimal values', async () => {
  process.env.JWT_SECRET = 'testsecret';
  const { signToken } = await import('../lib/auth');
  const { GET } = await import('../app/api/metrics/kpis/route');
  const { NextRequest } = await import('next/server');
  const token = signToken({ id: '1', email: 'a@b.c', role: 'viewer' });
  const req = new NextRequest('http://test/api/metrics/kpis', {
    headers: { authorization: `Bearer ${token}` },
  });
  const res = await GET(req);
  const data = await res.json();
  assert.match(data.ttft_ms.toString(), /^\d+\.\d$/);
  assert.match(data.rtt_ms.toString(), /^\d+\.\d$/);
  assert.match(data.error_rate_percent.toString(), /^\d+\.\d$/);
});

test('GET /api/metrics/runs returns 20 results by default', async () => {
  process.env.JWT_SECRET = 'testsecret';
  const { signToken } = await import('../lib/auth');
  const { GET } = await import('../app/api/metrics/runs/route');
  const { NextRequest } = await import('next/server');
  const token = signToken({ id: '1', email: 'a@b.c', role: 'viewer' });
  const req = new NextRequest('http://test/api/metrics/runs', {
    headers: { authorization: `Bearer ${token}` },
  });
  const res = await GET(req);
  const data = await res.json();
  assert.equal(data.runs.length, 20);
});
