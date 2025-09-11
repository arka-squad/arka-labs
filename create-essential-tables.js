const { Pool } = require('pg');

async function createEssentialTables() {
  console.log('🔄 Creating essential tables...');
  
  const pool = new Pool({ 
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });

  try {
    // Test connection first
    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL 17');

    // Create essential tables for project system
    const commands = [
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nom VARCHAR(200) NOT NULL,
        email VARCHAR(320),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nom VARCHAR(200) NOT NULL,
        description TEXT,
        client_id INTEGER REFERENCES clients(id),
        budget DECIMAL(10,2),
        deadline DATE,
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
        tags JSONB DEFAULT '[]',
        requirements JSONB DEFAULT '[]',
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );`,
      
      `INSERT INTO clients (nom, email) 
       VALUES ('Client Test', 'test@example.com') 
       ON CONFLICT DO NOTHING;`,
       
      `INSERT INTO clients (nom, email) 
       VALUES ('Arka Labs', 'contact@arka-labs.com') 
       ON CONFLICT DO NOTHING;`
    ];

    for (const command of commands) {
      try {
        await pool.query(command);
        console.log('✅ Command executed successfully');
      } catch (cmdError) {
        if (cmdError.message.includes('already exists')) {
          console.log('ℹ️  Table already exists');
        } else {
          console.log('⚠️  Error:', cmdError.message);
        }
      }
    }

    // Test the tables
    const clientsResult = await pool.query('SELECT COUNT(*) FROM clients');
    const projectsResult = await pool.query('SELECT COUNT(*) FROM projects');
    
    console.log(`📊 Tables ready: ${clientsResult.rows[0].count} clients, ${projectsResult.rows[0].count} projects`);
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
  } finally {
    await pool.end();
  }
}

createEssentialTables();