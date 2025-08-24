import { Pool } from 'pg';
import { sql } from '@vercel/postgres';

let pool: Pool | null = null;

export function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  }
  return pool;
}

export { sql };
