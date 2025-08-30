// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(32, "Required AUTH_SECRET (>=32)"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

export function getEnv() {
  const parsed = envSchema.safeParse({
    AUTH_SECRET:
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET ?? // fallback si ancien naming
      process.env.JWT_SECRET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!parsed.success) {
    const missing = parsed.error.issues.map(i => i.path.join(".")).join(",");
    throw new Error(`ENV_MISSING:${missing}`);
  }
  return parsed.data;
}
