// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, "Required JWT_SECRET (>=32)"),
  JWT_ISSUER: z.string().min(1, "Required JWT_ISSUER"),
  JWT_AUDIENCE: z.string().min(1, "Required JWT_AUDIENCE"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    JWT_SECRET:
      process.env.JWT_SECRET ??
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(",");
    throw new Error(`ENV_MISSING:${missing}`);
  }
  cached = parsed.data;
  return cached;
}
