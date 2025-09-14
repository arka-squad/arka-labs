const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Connect to postgres database to create arka_db
const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
  max: 1
});

async function createDatabase() {
  console.log('Creating arka_db database...');
  
  try {
    // Check if database exists
    const checkResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'arka_db'"
    );
    
    if (checkResult.rows.length === 0) {
      // Create database
      await pool.query('CREATE DATABASE arka_db');
      console.log('✓ Database arka_db created successfully');
    } else {
      console.log('✓ Database arka_db already exists');
    }
    
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createDatabase();