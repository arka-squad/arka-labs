const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    const migrationPath = path.join(__dirname, '../sql/migrations/2025-09-09_b23_v25_backend_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Running B23 v2.5 backend schema migration...');
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully');

    // Test table creation
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('clients', 'agents', 'projects', 'project_assignments', 'squads')
      ORDER BY table_name
    `);

    console.log('📋 Created tables:', result.rows.map(r => r.table_name));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();