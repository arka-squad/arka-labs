// Create squads table from backup structure
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function createSquadsTable() {
  console.log('🔧 Creating squads table...');

  try {
    // Create squad_status enum first
    await pool.query(`
      CREATE TYPE squad_status AS ENUM ('active', 'inactive', 'archived', 'suspended');
    `);
    console.log('✅ squad_status enum created');
  } catch (e) {
    console.log('ℹ️  squad_status enum already exists');
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS squads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 3),
        slug VARCHAR(64) NOT NULL UNIQUE,
        mission TEXT CHECK (LENGTH(mission) <= 800),
        domain VARCHAR(50) NOT NULL CHECK (domain IN ('RH', 'Tech', 'Marketing', 'Finance', 'Ops')),
        status squad_status NOT NULL DEFAULT 'active',
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);

    console.log('✅ Table squads créée');

    // Insert sample data
    await pool.query(`
      INSERT INTO squads (name, slug, mission, domain, created_by)
      VALUES
        ('Dev Team Alpha', 'dev-team-alpha', 'Core development team', 'Tech', 'system'),
        ('Marketing Squad', 'marketing-squad', 'Digital marketing initiatives', 'Marketing', 'system'),
        ('HR Support', 'hr-support', 'Human resources management', 'RH', 'system')
      ON CONFLICT (slug) DO NOTHING;
    `);

    console.log('✅ Sample squads data inserted');

    // Verify structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'squads'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Squads table structure:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Test query that was failing
    console.log('\n🧪 Testing slug query...');
    const testQuery = await pool.query(`
      SELECT s.id, s.name, s.slug, s.mission, s.domain, s.status
      FROM squads s
      WHERE s.deleted_at IS NULL
      LIMIT 3;
    `);

    console.log('✅ Slug query successful:');
    testQuery.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.slug}): ${row.domain}`);
    });

    console.log('\n🎉 Squads table ready!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

createSquadsTable();