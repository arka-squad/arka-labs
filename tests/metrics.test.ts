import test from 'node:test';
import assert from 'node:assert/strict';
import { p95, avg, mockRuns } from '../lib/metrics-data';
import { computeKpis, parsePagination, formatRuns } from '../lib/metrics-api';

// existing tests

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

// computeKpis tests

test('computeKpis returns zeros when no data', () => {
  const data = computeKpis([]);
  assert.deepEqual(data, {
    p95: { ttft_ms: 0, rtt_ms: 0 },
    error_rate_percent: 0,
  });
});

test('computeKpis aggregates metrics', () => {
  const data = computeKpis([
    { ttft_ms: 100, rtt_ms: 200, status: '200' },
    { ttft_ms: 200, rtt_ms: 300, status: '500' },
  ]);
  assert.equal(typeof data.p95.ttft_ms, 'number');
  assert.equal(typeof data.p95.rtt_ms, 'number');
  assert.equal(typeof data.error_rate_percent, 'number');
});

// parsePagination tests

test('parsePagination accepts limit alias', () => {
  const params = new URL('http://test?page=1&limit=20').searchParams;
  const { page, page_size } = parsePagination(params);
  assert.equal(page, 1);
  assert.equal(page_size, 20);
});

// formatRuns test

test('formatRuns returns pagination shape', () => {
  const rows = Array.from({ length: 2 }, (_, i) => ({
    ts: new Date().toISOString(),
    run_id: `run${i}`,
    trace_id: `trace${i}`,
    ttft_ms: 100,
    rtt_ms: 200,
    status: '200',
  }));
  const data = formatRuns(rows, 1, 2, 5);
  assert.equal(data.items.length, 2);
  assert.equal(data.count, 5);
  assert.equal(data.page, 1);
  assert.equal(data.page_size, 2);
});

// integration tests for DB error

test('GET /api/metrics/kpis returns 503 on db error', async () => {
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
  delete require.cache[require.resolve('../app/api/metrics/kpis/route')];
  const { GET } = require('../app/api/metrics/kpis/route');
  const res = await GET(new Request('http://test/api/metrics/kpis'));
  assert.equal(res.status, 503);
  require.cache[dbPath] = originalCache;
});

test('GET /api/metrics/runs returns 503 on db error', async () => {
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
  delete require.cache[require.resolve('../app/api/metrics/runs/route')];
  const { GET } = require('../app/api/metrics/runs/route');
  const res = await GET(new Request('http://test/api/metrics/runs'));
  assert.equal(res.status, 503);
  require.cache[dbPath] = originalCache;
});
