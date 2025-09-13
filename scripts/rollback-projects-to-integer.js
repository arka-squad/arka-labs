#!/usr/bin/env node
const { Pool } = require('pg');

async function rollbackProjectsToInteger() {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
  
  const pool = new Pool({ connectionString });
  
  try {
    console.log('🔄 Rollback projects vers INTEGER...\n');
    
    await pool.query('BEGIN');
    
    // 1. Créer une table temporaire avec INTEGER + mapping UUID
    console.log('📝 Création de la table temporaire projects_new...');
    await pool.query(`
      CREATE TABLE projects_new (
        id SERIAL PRIMARY KEY,
        old_uuid UUID,
        name TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        client_id UUID REFERENCES clients(id),
        description TEXT,
        budget NUMERIC,
        deadline DATE,
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'active',
        tags JSONB DEFAULT '[]',
        requirements JSONB DEFAULT '[]',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // 2. Copier les données avec des IDs séquentiels
    console.log('📄 Copie des données vers projects_new...');
    const result = await pool.query(`
      INSERT INTO projects_new (
        old_uuid, name, created_by, created_at, client_id, description, 
        budget, deadline, priority, status, tags, requirements, 
        updated_at, deleted_at, completed_at
      )
      SELECT 
        id, name, created_by, created_at, client_id, description,
        budget, deadline, priority, status, tags, requirements,
        updated_at, deleted_at, completed_at
      FROM projects
      ORDER BY created_at
      RETURNING id, name, old_uuid
    `);
    
    console.log(`✅ ${result.rows.length} projets copiés avec INTEGER ID:`);
    result.rows.forEach(row => {
      console.log(`   - ${row.name} : ${row.old_uuid} → ${row.id}`);
    });
    
    // 3. Supprimer l'ancienne table et renommer
    console.log('🗑️  Suppression de l\'ancienne table projects...');
    await pool.query('DROP TABLE projects CASCADE');
    
    console.log('🔄 Renommage projects_new → projects...');
    await pool.query('ALTER TABLE projects_new RENAME TO projects');
    await pool.query('ALTER TABLE projects DROP COLUMN old_uuid');
    
    // 4. Recréer les indexes
    console.log('📊 Recréation des indexes...');
    await pool.query(`
      CREATE INDEX idx_projects_client_id ON projects(client_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
      CREATE INDEX idx_projects_deadline ON projects(deadline) WHERE deadline IS NOT NULL AND status = 'active';
      CREATE INDEX idx_projects_created_by ON projects(created_by) WHERE deleted_at IS NULL;
    `);
    
    await pool.query('COMMIT');
    
    console.log('\n✅ Rollback terminé avec succès !');
    console.log('📊 Vérification finale...');
    
    const finalCheck = await pool.query('SELECT id, name FROM projects ORDER BY id');
    finalCheck.rows.forEach(row => {
      console.log(`   ✓ ${row.name} (${row.id})`);
    });
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Erreur lors du rollback :', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

rollbackProjectsToInteger();