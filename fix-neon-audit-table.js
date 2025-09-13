#!/usr/bin/env node
const { Pool } = require('pg');

async function createAuditTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    console.log('🔗 Connexion à Neon...');
    
    // Vérifier si la table existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'auth_audit_logs'
      );
    `);
    
    console.log(`📋 Table auth_audit_logs existe: ${tableCheck.rows[0].exists}`);
    
    if (!tableCheck.rows[0].exists) {
      // Créer la table auth_audit_logs
      console.log('📝 Création table auth_audit_logs...');
      await pool.query(`
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
      
      console.log('✅ Table auth_audit_logs créée');
      
      // Créer les index
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_timestamp ON auth_audit_logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_ip_hash ON auth_audit_logs(ip_hash);
        CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_route ON auth_audit_logs(route);
        CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_trace_id ON auth_audit_logs(trace_id);
      `);
      
      console.log('✅ Index créés');
    } else {
      console.log('ℹ️ Table auth_audit_logs existe déjà');
    }
    
    // Vérifier la structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'auth_audit_logs'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Structure de la table:');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\n✅ Table auth_audit_logs vérifiée et prête !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

console.log('🔧 Correction table auth_audit_logs pour Neon...\n');
createAuditTable().catch(console.error);