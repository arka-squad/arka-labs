import { z } from 'zod';
import { createHmac } from 'crypto';

export const meta = {
  id: 'security.webhook.hmac',
  version: '1.0.0',
  title: 'Webhook HMAC',
  category: 'security',
  inputs: {
    payload: { type: 'string' },
    secret: { type: 'string' }
  },
  outputs: {
    status: { type: 'string' },
    hmac: { type: 'string' }
  },
  risk: 'high',
  scope: 'owner-only',
  est_duration_ms: 500,
  tags: ['seed', 'security']
};

const schema = z.object({
  payload: z.string(),
  secret: z.string()
});

export function validate(inputs) {
  return schema.parse(inputs);
}

export async function run(inputs, ctx = {}) {
  const { payload, secret } = validate(inputs);
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return {
    gate_id: meta.id,
    status: 'pass',
    metrics: { status: 'ok', hmac: sig },
    evidence: [],
    message: 'signature generated'
  };
}
