export interface MessageInput {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  meta?: Record<string, unknown>;
}

export const messageSchema = {
  type: 'object',
  properties: {
    role: { type: 'string', enum: ['user', 'assistant'] },
    content: { type: 'string' },
    tokens: { type: 'integer', minimum: 0 },
    meta: { type: 'object' }
  },
  required: ['role', 'content'],
  additionalProperties: false
} as const;

export function validateMessage(data: unknown): data is MessageInput {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const obj = data as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.some((k) => !['role', 'content', 'tokens', 'meta'].includes(k))) return false;
  if (obj.role !== 'user' && obj.role !== 'assistant') return false;
  if (typeof obj.content !== 'string') return false;
  if (obj.tokens !== undefined) {
    if (typeof obj.tokens !== 'number' || !Number.isInteger(obj.tokens) || obj.tokens < 0) return false;
  }
  if (obj.meta !== undefined && (typeof obj.meta !== 'object' || obj.meta === null || Array.isArray(obj.meta))) return false;
  return true;
}
