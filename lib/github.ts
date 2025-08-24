import crypto from 'crypto';

export function verifySignature(secret: string, payload: string, signature: string) {
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expected = `sha256=${hmac}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
