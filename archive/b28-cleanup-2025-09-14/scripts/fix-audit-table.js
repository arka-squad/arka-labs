#!/usr/bin/env node
const { Client } = require('pg');

async function fixAuditTable() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Drop existing table if it exists
    await client.query(`DROP TABLE IF EXISTS auth_audit_logs CASCADE`);
    console.log('✅ Dropped existing auth_audit_logs table');

    // Create auth_audit_logs table with all required columns
    await client.query(`
      CREATE TABLE auth_audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id VARCHAR(255),
        email_hash VARCHAR(64),
        role VARCHAR(50),
        route VARCHAR(255),
        method VARCHAR(10),
        status_code INTEGER,
        trace_id VARCHAR(255),
        jti VARCHAR(255),
        ip_hash VARCHAR(64),
        user_agent_hash VARCHAR(64),
        error_code VARCHAR(100),
        duration_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    console.log('✅ Table auth_audit_logs created successfully');

    // Create indexes for performance
    await client.query(`CREATE INDEX idx_auth_audit_logs_user_id ON auth_audit_logs(user_id)`);
    await client.query(`CREATE INDEX idx_auth_audit_logs_timestamp ON auth_audit_logs(timestamp)`);
    await client.query(`CREATE INDEX idx_auth_audit_logs_ip_hash ON auth_audit_logs(ip_hash)`);
    await client.query(`CREATE INDEX idx_auth_audit_logs_route ON auth_audit_logs(route)`);
    
    console.log('✅ Indexes created successfully');
    
    // Verify table structure
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'auth_audit_logs'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

console.log('🔧 Fixing auth_audit_logs table...\n');
fixAuditTable().catch(console.error);