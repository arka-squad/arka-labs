import crypto from 'crypto';

/**
 * Verify a GitHub webhook signature using a constant time comparison.
 */
export function verifySignature(secret: string, payload: string, signature: string) {
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expected = `sha256=${hmac}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/** Parse a CSV allowlist string into a Set of repo full names. */
export function parseAllowlist(csv: string | undefined) {
  return new Set(
    (csv || '')
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)
  );
}

/** Recursively sort object keys to create a canonical JSON string. */
function sortObject(value: any): any {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortObject(value[key]);
        return acc;
      }, {} as any);
  }
  return value;
}

export function canonicalJson(value: any) {
  return JSON.stringify(sortObject(value));
}

export function hashCanonical(value: any) {
  return crypto.createHash('sha256').update(canonicalJson(value)).digest('hex');
}
