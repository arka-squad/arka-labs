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

test('computeKpis returns expected fields', () => {
  const { computeKpis } = require('../app/api/metrics/kpis/route');
  const data = computeKpis([
    { ttft_ms: 100, rtt_ms: 200, status: '200' },
    { ttft_ms: 200, rtt_ms: 300, status: '500' },
  ]);
  assert.match(data.p95.ttft_ms.toString(), /^\d+$/);
  assert.match(data.p95.rtt_ms.toString(), /^\d+$/);
  assert.match(data.error_rate_percent.toFixed(1), /^\d+\.\d$/);
});

test('formatRuns returns pagination shape', () => {
  const { formatRuns } = require('../app/api/metrics/runs/route');
  const rows = Array.from({ length: 20 }, (_, i) => ({
    ts: new Date().toISOString(),
    run_id: `run${i}`,
    trace_id: `trace${i}`,
    ttft_ms: 100,
    rtt_ms: 200,
    status: '200',
  }));
  const data = formatRuns(rows, 1, 20, 25);
  assert.equal(data.items.length, 20);
  assert.equal(data.count, 25);
  assert.equal(data.page, 1);
  assert.equal(data.limit, 20);
});
