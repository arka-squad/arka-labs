export interface PromptBlockInput {
  title: string;
  value: string;
  trigger?: string;
}

export const promptBlockSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    value: { type: 'string' },
    trigger: { type: 'string' },
  },
  required: ['title', 'value'],
  additionalProperties: false,
} as const;

export function validatePromptBlock(data: unknown): data is PromptBlockInput {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const obj = data as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.some((k) => !['title', 'value', 'trigger'].includes(k))) return false;
  if (typeof obj.title !== 'string') return false;
  if (typeof obj.value !== 'string') return false;
  if (obj.trigger !== undefined && typeof obj.trigger !== 'string') return false;
  return true;
}
