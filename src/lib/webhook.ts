import { createHmac, timingSafeEqual } from 'crypto';

const deliveries = new Map<string, number>();
const DAY_MS = 24 * 60 * 60 * 1000;

export function verifySignature(signatureHeader: string, body: string, secret: string): boolean {
  const signature = signatureHeader.replace(/^sha256=/, '');
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function isReplay(eventId: string, signature: string, ttlMs = DAY_MS): boolean {
  const key = `${eventId}:${signature}`;
  const now = Date.now();
  for (const [k, ts] of deliveries) {
    if (now - ts > ttlMs) deliveries.delete(k);
  }
  if (deliveries.has(key)) return true;
  deliveries.set(key, now);
  return false;
}
