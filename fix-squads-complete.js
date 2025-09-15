// Fix squads table structure completely
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixSquadsComplete() {
  console.log('🔧 Completing squads table structure...');

  try {
    // Add missing columns
    const missingColumns = [
      { name: 'mission', type: 'TEXT' },
      { name: 'domain', type: 'VARCHAR(50)' }
    ];

    for (const col of missingColumns) {
      try {
        await pool.query(`
          ALTER TABLE squads
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};
        `);
        console.log(`✅ Column ${col.name} added`);
      } catch (e) {
        console.log(`ℹ️  Column ${col.name} already exists`);
      }
    }

    // Update existing squads with default values
    await pool.query(`
      UPDATE squads
      SET mission = COALESCE(mission, 'Default squad mission'),
          domain = COALESCE(domain, 'Tech')
      WHERE mission IS NULL OR domain IS NULL;
    `);
    console.log('✅ Default values set for missing data');

    // Verify final structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'squads'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Final squads table structure:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Test the original failing query now
    console.log('\n🧪 Testing complete squads query...');
    const testQuery = await pool.query(`
      SELECT s.id, s.name, s.slug, s.mission, s.domain, s.status
      FROM squads s
      WHERE s.deleted_at IS NULL
      LIMIT 3;
    `);

    console.log('✅ Complete query successful:');
    testQuery.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.slug}): ${row.domain} - ${row.mission?.substring(0, 50)}...`);
    });

    console.log('\n🎉 Squads table structure completely fixed!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

fixSquadsComplete();