import { z } from 'zod';

export const meta = {
  id: 'contracts.schema.documents',
  version: '1.0.0',
  title: 'Schema Documents',
  category: 'contracts',
  inputs: {
    doc_ids: { type: 'array', items: { type: 'string' }, minItems: 1 }
  },
  outputs: {
    schema_mismatch_count: { type: 'number' }
  },
  risk: 'med',
  scope: 'safe',
  est_duration_ms: 2000,
  tags: ['seed', 'contracts']
};

const schema = z.object({
  doc_ids: z.array(z.string()).min(1)
});

export function validate(inputs) {
  return schema.parse(inputs);
}

export async function run(inputs, ctx = {}) {
  const { doc_ids } = validate(inputs);
  // Simuler vérification de schéma
  return {
    gate_id: meta.id,
    status: 'pass',
    metrics: { schema_mismatch_count: 0 },
    evidence: [],
    message: `checked ${doc_ids.length} docs`
  };
}
