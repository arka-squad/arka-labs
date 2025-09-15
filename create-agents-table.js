// Créer la table agents manquante
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function createAgentsTable() {
  console.log('🚀 Création table agents...');

  try {
    // Créer la table agents
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        role VARCHAR(100),
        domaine VARCHAR(100),
        version VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);
    console.log('✅ Table agents créée');

    // Insérer quelques agents de test
    await pool.query(`
      INSERT INTO agents (name, role, domaine, version, status) VALUES
      ('Agent Web Dev', 'developer', 'web', 'v1.0', 'active'),
      ('Agent Mobile', 'developer', 'mobile', 'v1.0', 'active'),
      ('Agent Data', 'analyst', 'data', 'v1.0', 'active'),
      ('Agent DevOps', 'devops', 'infrastructure', 'v1.0', 'active')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Agents de test ajoutés');

    // Vérifier
    const result = await pool.query('SELECT COUNT(*) FROM agents');
    console.log(`📊 ${result.rows[0].count} agents en base`);

    console.log('🎉 Table agents créée avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

createAgentsTable();