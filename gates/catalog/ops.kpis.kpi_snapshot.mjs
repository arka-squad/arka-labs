import { z } from 'zod';

export const meta = {
  id: 'ops.kpis.kpi_snapshot',
  version: '1.0.0',
  title: 'KPI Snapshot',
  category: 'kpis',
  inputs: {},
  outputs: {
    ttft_p95: { type: 'number' },
    rtt_p95: { type: 'number' },
    error_rate_percent: { type: 'number' }
  },
  risk: 'low',
  scope: 'safe',
  est_duration_ms: 500,
  tags: ['seed', 'ops']
};

const schema = z.object({});

export function validate(inputs) {
  return schema.parse(inputs);
}

export async function run(inputs = {}, ctx = {}) {
  validate(inputs);
  return {
    gate_id: meta.id,
    status: 'pass',
    metrics: {
      ttft_p95: 100,
      rtt_p95: 200,
      error_rate_percent: 0.1
    },
    evidence: [],
    message: 'snapshot'
  };
}
