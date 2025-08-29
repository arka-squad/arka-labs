const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { TRACE_HEADER } = require('../lib/trace');
const postgres = require('@vercel/postgres');

global.__TRACE_BUFFER__ = [];

process.env.JWT_SECRET = 'test';

postgres.sql = async (strings, ...values) => {
  if (strings[0].includes('insert into metrics_raw')) {
    const [traceId] = values;
    global.__TRACE_BUFFER__.push(traceId);
    return { rows: [] };
  }
  return { rows: [{ ttft_ms: 0, rtt_ms: 0, err_pct: 0 }] };
};

const { signToken } = require('../lib/auth');
const { GET } = require('../app/api/metrics/route');

test('trace_id propagates UI→API→DB', async () => {
  const trace_id = 'trc_e2e_001';
  const token = signToken({ id: 'u1', email: 'a@b.c', role: 'viewer' });
  const req = new NextRequest('http://test/api/metrics', {
    headers: { [TRACE_HEADER]: trace_id, authorization: `Bearer ${token}` },
  });
  const res = await GET(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get(TRACE_HEADER), trace_id);
  assert.ok(global.__TRACE_BUFFER__.includes(trace_id));
});
