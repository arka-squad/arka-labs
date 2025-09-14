#!/usr/bin/env node
const { Client } = require('pg');

async function setupAuditTable() {
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

    // Create auth_audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_audit_logs (
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
    
    console.log('✅ Table auth_audit_logs created');

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_timestamp ON auth_audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_ip_hash ON auth_audit_logs(ip_hash);
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_route ON auth_audit_logs(route);
    `);
    
    console.log('✅ Indexes created');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

console.log('🔧 Setting up auth_audit_logs table...\n');
setupAuditTable().catch(console.error);