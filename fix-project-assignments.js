// Fix existing project_assignments table
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixProjectAssignments() {
  console.log('🔧 Correction table project_assignments...');

  try {
    // Add missing columns if they don't exist
    try {
      await pool.query(`ALTER TABLE project_assignments ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member';`);
      console.log('✅ Colonne role ajoutée');
    } catch (e) {
      console.log('ℹ️  Colonne role existe déjà');
    }

    try {
      await pool.query(`ALTER TABLE project_assignments ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(255);`);
      console.log('✅ Colonne assigned_by ajoutée');
    } catch (e) {
      console.log('ℹ️  Colonne assigned_by existe déjà');
    }

    // Check current table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'project_assignments'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Structure actuelle project_assignments:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Test the critical query
    console.log('\n🧪 Test requête critique...');

    const testQuery = await pool.query(`
      SELECT
        p.name as project_name,
        c.name as client_name,
        COUNT(pa.agent_id) FILTER (WHERE pa.status = 'active') as active_agents_count
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_assignments pa ON p.id = pa.project_id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, p.name, c.name
      ORDER BY p.created_at DESC
      LIMIT 3;
    `);

    console.log('✅ Requête critique réussie:');
    testQuery.rows.forEach(row => {
      console.log(`   - ${row.project_name} (${row.client_name}): ${row.active_agents_count} agents`);
    });

    console.log('\n🎉 Table project_assignments corrigée !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

fixProjectAssignments();