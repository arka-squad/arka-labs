#!/usr/bin/env node
const { Pool } = require('pg');

async function fixDatabaseSchema() {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
  
  const pool = new Pool({ connectionString });
  
  try {
    console.log('🔧 Correction du schéma de base de données pour B26 API Lite...\n');
    
    // 1. Ajouter la colonne completed_at à projects
    console.log('📝 Ajout de la colonne completed_at à projects...');
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE
    `);
    console.log('✅ Colonne completed_at ajoutée');

    // 2. Créer la table revoked_tokens
    console.log('📝 Création de la table revoked_tokens...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        id SERIAL PRIMARY KEY,
        jti VARCHAR(255) UNIQUE NOT NULL,
        token_hash VARCHAR(64),
        revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        user_id VARCHAR(255),
        reason VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_revoked_tokens_jti ON revoked_tokens (jti)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user_id ON revoked_tokens (user_id)`);
    console.log('✅ Table revoked_tokens créée');

    // 3. Créer la table agent_instances  
    console.log('📝 Création de la table agent_instances...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_instances (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER,
        instance_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'inactive',
        config JSONB DEFAULT '{}',
        performance_metrics JSONB DEFAULT '{}',
        last_activity_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_agent_instances_agent_id ON agent_instances (agent_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_agent_instances_status ON agent_instances (status)`);
    console.log('✅ Table agent_instances créée');

    // 4. Créer d'autres tables qui pourraient manquer
    console.log('📝 Création de tables de liaison supplémentaires...');
    
    // Table project_agents (pour les assignments)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_agents (
        id SERIAL PRIMARY KEY,
        project_id INTEGER,
        agent_id INTEGER,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        role VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Table project_squads (pour les assignments d'équipes)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_squads (
        id SERIAL PRIMARY KEY,
        project_id INTEGER,
        squad_id INTEGER,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tables de liaison créées');

    console.log('\n🔍 Vérification finale...');
    
    // Vérifier que les colonnes existent maintenant
    const projectColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name IN ('completed_at', 'name', 'deadline')
    `);
    
    console.log('✅ Colonnes projects disponibles:');
    projectColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name}`);
    });

    // Vérifier que les tables existent
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('revoked_tokens', 'agent_instances', 'auth_audit_logs', 'project_agents')
      ORDER BY table_name
    `);
    
    console.log('\n✅ Tables B26 disponibles:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    await pool.end();
    console.log('\n🎉 Schéma de base de données corrigé pour B26 API Lite !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction du schéma :', error);
    process.exit(1);
  }
}

fixDatabaseSchema();