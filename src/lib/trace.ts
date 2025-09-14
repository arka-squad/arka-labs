export const TRACE_HEADER = 'x-trace-id';

export function generateTraceId(): string {
  // Use crypto.randomUUID when available in both browser and Node
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback to Math.random (not cryptographically strong)
  return Math.random().toString(36).slice(2);
}
