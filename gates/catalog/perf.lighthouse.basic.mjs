import { z } from 'zod';

export const meta = {
  id: 'perf.lighthouse.basic',
  version: '1.0.0',
  title: 'Lighthouse Basic',
  category: 'perf',
  scope: 'safe'
};

const schema = z.object({
  url: z.string().url()
});

export function validate(inputs) {
  return schema.parse(inputs);
}

export async function run(inputs, ctx = {}) {
  const { url } = validate(inputs);
  // Simuler une exécution Lighthouse
  return {
    gate_id: meta.id,
    status: 'pass',
    metrics: {
      lcp_ms: 2500,
      tti_ms: 1900,
      cls: 0.05,
      score_a11y: 0.9
    },
    evidence: [],
    message: `analysed ${url}`
  };
}
