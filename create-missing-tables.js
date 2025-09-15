// Créer les tables manquantes directement
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function createMissingTables() {
  console.log('🚀 Création tables manquantes...');

  try {
    // 1. project_assignments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL,
        agent_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        assigned_by VARCHAR(255),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);
    console.log('✅ project_assignments créée');

    // 2. project_squads
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_squads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL,
        squad_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        attached_at TIMESTAMPTZ DEFAULT NOW(),
        attached_by VARCHAR(255),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);
    console.log('✅ project_squads créée');

    // 3. squad_members
    await pool.query(`
      CREATE TABLE IF NOT EXISTS squad_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        squad_id UUID NOT NULL,
        agent_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        role VARCHAR(100),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);
    console.log('✅ squad_members créée');

    // 4. agent_instances
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id UUID NOT NULL,
        name VARCHAR(200) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);
    console.log('✅ agent_instances créée');

    // 5. squad_instructions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS squad_instructions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        squad_id UUID NOT NULL,
        content TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by VARCHAR(255)
      );
    `);
    console.log('✅ squad_instructions créée');

    console.log('🎉 Toutes les tables manquantes ont été créées');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

createMissingTables();