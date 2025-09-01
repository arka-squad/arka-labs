import test from 'node:test';
import assert from 'node:assert/strict';
import { computeOverview, parsePagination } from '../lib/metrics-api';

test('computeOverview aggregates count and p95', () => {
  const data = computeOverview([
    { ttft_ms: 100, rtt_ms: 200, status: '200' },
    { ttft_ms: 200, rtt_ms: 300, status: '500' },
  ]);
  assert.equal(data.count_24h, 2);
  assert.equal(typeof data.p95.ttft_ms, 'number');
  assert.equal(typeof data.error_rate_percent, 'number');
});

test('parsePagination caps page_size at 100', () => {
  const params = new URL('http://test?page=1&page_size=1000').searchParams;
  const { page_size } = parsePagination(params);
  assert.equal(page_size, 100);
});

test('GET /api/metrics generates trace_id and logs', async () => {
  const dbPath = require.resolve('../lib/db');
  const originalExports = require(dbPath);
  const originalCache = require.cache[dbPath];
  require.cache[dbPath] = {
    ...(originalCache as any),
    exports: {
      ...originalExports,
      sql: async () => ({
        rows: [
          { ttft_ms: 100, rtt_ms: 200, status: '200' },
          { ttft_ms: 200, rtt_ms: 300, status: '500' },
        ],
      }),
    },
  } as any;

  const logs: any[] = [];
  const origLog = console.log;
  console.log = (msg: string) => logs.push(JSON.parse(msg));

  delete require.cache[require.resolve('../app/api/metrics/route')];
  const { GET } = require('../app/api/metrics/route');
  const res = await GET(new Request('http://test/api/metrics'));
  assert.equal(res.status, 200);
  const headerTrace = res.headers.get('x-trace-id');
  assert.ok(headerTrace);
  assert.equal(logs[0].trace_id, headerTrace);

  console.log = origLog;
  require.cache[dbPath] = originalCache;
});

test('GET /api/metrics returns 503 on db error', async () => {
  const dbPath = require.resolve('../lib/db');
  const originalExports = require(dbPath);
  const originalCache = require.cache[dbPath];
  require.cache[dbPath] = {
    ...(originalCache as any),
    exports: {
      ...originalExports,
      sql: async () => {
        throw new Error('db');
      },
    },
  } as any;
  delete require.cache[require.resolve('../app/api/metrics/route')];
  const { GET } = require('../app/api/metrics/route');
  const res = await GET(new Request('http://test/api/metrics'));
  assert.equal(res.status, 503);
  require.cache[dbPath] = originalCache;
});
