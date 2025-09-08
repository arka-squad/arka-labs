import { z } from 'zod';
import * as kpis from './ops.kpis.kpi_snapshot.mjs';
import * as ttft from './perf.api.ttft_p95.mjs';
import * as webhook from './security.webhook.hmac.mjs';

export const meta = {
  id: 'release.preflight',
  version: '1.0.0',
  title: 'Release Preflight',
  scope: 'owner-only'
};

const schema = z.object({
  window_minute: z.number().int().nonnegative(),
  payload: z.string(),
  secret: z.string()
});

export function validate(inputs) {
  return schema.parse(inputs);
}

export async function run(inputs, ctx = {}) {
  const { window_minute, payload, secret } = validate(inputs);
  const r1 = await kpis.run({}, ctx);
  const r2 = await ttft.run({ window_minute }, ctx);
  const r3 = await webhook.run({ payload, secret }, ctx);
  const all = [r1, r2, r3];
  const summary = {
    pass: all.filter(r => r.status === 'pass').length,
    fail: all.filter(r => r.status === 'fail').length,
    warn: all.filter(r => r.status === 'warn').length
  };
  const overall = summary.fail > 0 ? 'fail' : summary.warn > 0 ? 'warn' : 'pass';
  return {
    recipe_id: meta.id,
    status: overall,
    summary,
    steps: [
      { id: 'kpis', status: r1.status, gate_result: r1 },
      { id: 'ttft', status: r2.status, gate_result: r2 },
      { id: 'webhook', status: r3.status, gate_result: r3 }
    ]
  };
}
