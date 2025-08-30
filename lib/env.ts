import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(32),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
