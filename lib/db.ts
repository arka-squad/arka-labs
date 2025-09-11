import { Pool } from 'pg';

let pool: any = null;

export function getDb() {
  if (!pool) {
    // Use DATABASE_URL from .env.local or fallback to POSTGRES_URL for Vercel
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      console.warn('No database connection string found, using default localhost:5433');
      pool = new Pool({
        host: 'localhost',
        port: 5433,
        database: 'postgres',
        user: 'postgres',
        password: 'postgres'
      });
    } else {
      pool = new Pool({ connectionString });
    }
  }
  return pool;
}

// Local PostgreSQL compatible sql function that mimics @vercel/postgres interface
interface SqlFunction {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
  raw: (rawString: string) => { toString: () => string; valueOf: () => string };
}

const sqlFunction = (strings: TemplateStringsArray, ...values: any[]) => {
  let query = strings[0];
  for (let i = 0; i < values.length; i++) {
    query += `$${i + 1}` + strings[i + 1];
  }
  
  // Return a promise that resolves to rows array (like @vercel/postgres)
  return (async () => {
    const db = getDb();
    const result = await db.query(query, values);
    // Return just the rows array with additional properties
    const rows = result.rows;
    rows.rowCount = result.rowCount;
    rows.command = result.command;
    rows.fields = result.fields;
    return rows;
  })();
};

// Add raw method to sql function (for dynamic WHERE clauses)
sqlFunction.raw = (rawString: string) => {
  return {
    toString: () => rawString,
    valueOf: () => rawString
  };
};

export const sql = sqlFunction as SqlFunction;
