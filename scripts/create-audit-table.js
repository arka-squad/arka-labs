#!/usr/bin/env node
const { Pool } = require('pg');

async function createAuditTable() {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
  
  const pool = new Pool({ connectionString });
  
  try {
    console.log('🔗 Connexion à la base de données...');
    
    // Créer la table auth_audit_logs
    console.log('📝 Création de la table auth_audit_logs...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id VARCHAR(255),
        email_hash VARCHAR(64),
        route VARCHAR(255),
        method VARCHAR(10),
        status_code INTEGER,
        trace_id VARCHAR(255),
        user_agent TEXT,
        ip_address VARCHAR(45),
        session_id VARCHAR(255),
        request_body TEXT,
        response_body TEXT,
        error_details TEXT,
        execution_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Créer les index pour la performance
    console.log('📊 Création des index de performance...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_timestamp ON auth_audit_logs (timestamp)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs (user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_route ON auth_audit_logs (route)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_status_code ON auth_audit_logs (status_code)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_trace_id ON auth_audit_logs (trace_id)`);

    console.log('✅ Table auth_audit_logs créée avec succès !');
    
    // Vérifier que la table existe
    const result = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'auth_audit_logs'
      ORDER BY ordinal_position
    `);
    
    console.log(`✅ Vérification : ${result.rows.length} colonnes trouvées dans auth_audit_logs`);
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table :', error);
    process.exit(1);
  }
}

createAuditTable();