import crypto from 'crypto';

export function verifyHmac(sig: string | null, payload: string, secret: string): boolean {
  if (!sig) return false;
  const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expected = `sha256=${h}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
