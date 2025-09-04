// lib/env.ts — minimal runtime env checker (no external deps)

export type Env = {
  JWT_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  BLOB_READ_WRITE_TOKEN?: string;
  AUTH_SECRET?: string;
};

let cached: Env | null = null;

function requireString(name: string, value: string | undefined | null, minLen = 1): string {
  const v = (value ?? '').trim();
  if (v.length < minLen) {
    throw new Error(`ENV_MISSING:${name}`);
  }
  return v;
}

export function getEnv(): Env {
  if (cached) return cached;
  const JWT_SECRET = (process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET) || '';
  const env: Env = {
    JWT_SECRET: requireString('JWT_SECRET', JWT_SECRET, 32),
    JWT_ISSUER: requireString('JWT_ISSUER', process.env.JWT_ISSUER),
    JWT_AUDIENCE: requireString('JWT_AUDIENCE', process.env.JWT_AUDIENCE),
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || undefined,
    AUTH_SECRET: process.env.AUTH_SECRET || undefined,
  };
  cached = env;
  return env;
}

// App flags (exported as plain constants for convenience)
export const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
export const MEM_WRITE_ENABLED = process.env.MEM_WRITE_ENABLED === 'true';
export const CHAT_RATE_LIMIT = Number(process.env.CHAT_RATE_LIMIT ?? 60);
export const BYOK_EXCHANGE_TTL_SEC = Number(process.env.BYOK_EXCHANGE_TTL_SEC ?? 3600);
