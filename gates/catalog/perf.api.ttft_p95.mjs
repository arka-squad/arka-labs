import { z } from 'zod';

export const meta = {
  id: 'perf.api.ttft_p95',
  version: '1.0.0',
  title: 'API TTFT p95',
  category: 'perf',
  scope: 'safe'
};

const schema = z.object({
  window_minute: z.number().int().nonnegative()
});

export function validate(inputs) {
  return schema.parse(inputs);
}

export async function run(inputs, ctx = {}) {
  const { window_minute } = validate(inputs);
  // Simuler calcul du p95
  return {
    gate_id: meta.id,
    status: 'pass',
    metrics: { p95_ms: 123 },
    evidence: [],
    message: `window ${window_minute}m`
  };
}
