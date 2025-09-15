// Vérifier quelles tables existent
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Tables existantes:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Vérifier spécifiquement la table agents
    const agentsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'agents'
      );
    `);

    console.log(`\n🔍 Table 'agents' existe: ${agentsCheck.rows[0].exists}`);

    // Vérifier la table squads
    const squadsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'squads'
      );
    `);

    console.log(`🔍 Table 'squads' existe: ${squadsCheck.rows[0].exists}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();