// Add missing slug column to squads table
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixSquadsSlug() {
  console.log('🔧 Adding slug column to squads table...');

  try {
    // Add slug column if it doesn't exist
    await pool.query(`
      ALTER TABLE squads
      ADD COLUMN IF NOT EXISTS slug VARCHAR(64);
    `);
    console.log('✅ Slug column added');

    // Update existing squads with slug values
    const existingSquads = await pool.query(`
      SELECT id, name FROM squads WHERE slug IS NULL;
    `);

    console.log(`📝 Updating ${existingSquads.rows.length} squads with slug values...`);

    for (const squad of existingSquads.rows) {
      const slug = squad.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      await pool.query(`
        UPDATE squads SET slug = $1 WHERE id = $2;
      `, [slug, squad.id]);
    }

    // Add unique constraint
    try {
      await pool.query(`
        ALTER TABLE squads ADD CONSTRAINT squads_slug_unique UNIQUE (slug);
      `);
      console.log('✅ Unique constraint added to slug');
    } catch (e) {
      console.log('ℹ️  Unique constraint already exists on slug');
    }

    // Verify structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'squads'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Updated squads table structure:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Test the failing query
    console.log('\n🧪 Testing squads slug query...');
    const testQuery = await pool.query(`
      SELECT s.id, s.name, s.slug, s.mission, s.domain, s.status
      FROM squads s
      WHERE s.deleted_at IS NULL
      LIMIT 3;
    `);

    console.log('✅ Query successful:');
    testQuery.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.slug}): ${row.domain || 'No domain'}`);
    });

    console.log('\n🎉 Squads slug fixed!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

fixSquadsSlug();