import { z } from 'zod';
import * as contracts from './contracts.schema.documents.mjs';

export const meta = {
  id: 'contracts.basic',
  version: '1.0.0',
  title: 'Contracts Basic',
  scope: 'safe'
};

const schema = z.object({
  doc_ids: z.array(z.string()).min(1)
});

export function validate(inputs) {
  return schema.parse(inputs);
}

export async function run(inputs, ctx = {}) {
  const { doc_ids } = validate(inputs);
  const r = await contracts.run({ doc_ids }, ctx);
  const summary = {
    pass: r.status === 'pass' ? 1 : 0,
    fail: r.status === 'fail' ? 1 : 0,
    warn: r.status === 'warn' ? 1 : 0
  };
  return {
    recipe_id: meta.id,
    status: r.status,
    summary,
    steps: [{ id: 'contracts', status: r.status, gate_result: r }]
  };
}
