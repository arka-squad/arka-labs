import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  }
  return pool;
}
