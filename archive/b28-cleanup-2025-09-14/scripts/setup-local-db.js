const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupLocalDatabase() {
  console.log('🔄 Configuring local PostgreSQL database...');
  
  const pool = new Pool({ 
    connectionString: process.env.POSTGRES_URL || 'postgresql://postgres@localhost:5432/postgres?sslmode=disable'
  });

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL');

    // Read and execute schema migration
    const schemaPath = path.join(__dirname, 'sql/migrations/2025-09-09_b23_admin_console_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Executing schema migration...');
    await pool.query(schema);
    console.log('✅ Schema migration completed');

    // Read and execute demo data
    const seedPath = path.join(__dirname, 'sql/seeds/2025-09-09_b23_demo_data.sql');
    if (fs.existsSync(seedPath)) {
      const seeds = fs.readFileSync(seedPath, 'utf8');
      console.log('🔄 Loading demo data...');
      await pool.query(seeds);
      console.log('✅ Demo data loaded');
    }

    console.log('🎉 Local database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Database schema already exists');
    } else {
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

setupLocalDatabase();