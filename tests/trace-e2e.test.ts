import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { TRACE_HEADER } from '../lib/trace';
import postgres from '@vercel/postgres';
import { signToken } from '../lib/auth';
import { GET } from '../app/api/metrics/route';

// buffer to capture trace ids during simulated DB inserts
(globalThis as any).__TRACE_BUFFER__ = [];

process.env.JWT_SECRET = 'test';

// mock sql to avoid real DB access and capture trace_id
(postgres as any).sql = async (strings: any, ...values: any[]) => {
  if (strings[0].includes('insert into metrics_raw')) {
    const [traceId] = values;
    (globalThis as any).__TRACE_BUFFER__.push(traceId);
    return { rows: [] };
  }
  return { rows: [{ ttft_ms: 0, rtt_ms: 0, err_pct: 0 }] };
};

test('trace_id propagates UI→API→DB', async () => {
  const trace_id = 'trc_e2e_001';
  const token = signToken({ id: 'u1', email: 'a@b.c', role: 'viewer' });
  const req = new NextRequest('http://test/api/metrics', {
    headers: { [TRACE_HEADER]: trace_id, authorization: `Bearer ${token}` },
  });
  const res = await GET(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get(TRACE_HEADER), trace_id);
  assert.ok((globalThis as any).__TRACE_BUFFER__.includes(trace_id));
});
