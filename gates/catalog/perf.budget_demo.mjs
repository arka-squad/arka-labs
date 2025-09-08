import { z } from 'zod';
import * as lighthouse from './perf.lighthouse.basic.mjs';
import * as ttft from './perf.api.ttft_p95.mjs';

export const meta = {
  id: 'perf.budget_demo',
  version: '1.0.0',
  title: 'Perf Budget Demo',
  steps: [
    { id: 'lighthouse', gate_id: 'perf.lighthouse.basic' },
    { id: 'ttft', gate_id: 'perf.api.ttft_p95' }
  ],
  inputs: {
    url: { type: 'string', format: 'uri' },
    window_minute: { type: 'number', minimum: 0 }
  },
  outputs: {
    lcp_ms: { type: 'number' },
    tti_ms: { type: 'number' },
    cls: { type: 'number' },
    score_a11y: { type: 'number' },
    p95_ms: { type: 'number' }
  },
  scope: 'safe',
  tags: ['seed', 'perf']
};

const schema = z.object({
  url: z.string().url(),
  window_minute: z.number().int().nonnegative()
});

export function validate(inputs) {
  return schema.parse(inputs);
}

export async function run(inputs, ctx = {}) {
  const { url, window_minute } = validate(inputs);
  const r1 = await lighthouse.run({ url }, ctx);
  const r2 = await ttft.run({ window_minute }, ctx);
  const summary = {
    pass: [r1, r2].filter(r => r.status === 'pass').length,
    fail: [r1, r2].filter(r => r.status === 'fail').length,
    warn: [r1, r2].filter(r => r.status === 'warn').length
  };
  const overall = summary.fail > 0 ? 'fail' : summary.warn > 0 ? 'warn' : 'pass';
  return {
    recipe_id: meta.id,
    status: overall,
    summary,
    steps: [
      { id: 'lighthouse', status: r1.status, gate_result: r1 },
      { id: 'ttft', status: r2.status, gate_result: r2 }
    ]
  };
}
