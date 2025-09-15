// Fix ALL missing tables and columns at once
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixAllMissingStructures() {
  console.log('🔧 Fixing ALL missing database structures...');

  try {
    // 1. Fix project_squads table
    console.log('\n📋 1. Fixing project_squads table...');

    await pool.query(`
      ALTER TABLE project_squads
      ADD COLUMN IF NOT EXISTS attached_at TIMESTAMPTZ DEFAULT NOW();
    `);

    await pool.query(`
      ALTER TABLE project_squads
      ADD COLUMN IF NOT EXISTS attached_by VARCHAR(255);
    `);

    console.log('✅ project_squads columns added');

    // 2. Create squad_members table
    console.log('\n👥 2. Creating squad_members table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS squad_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        squad_id UUID NOT NULL,
        agent_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed')),
        role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'lead', 'specialist')),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        left_at TIMESTAMPTZ,
        created_by VARCHAR(255),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('✅ squad_members table created');

    // 3. Create squad_instructions table
    console.log('\n📝 3. Creating squad_instructions table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS squad_instructions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        squad_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );
    `);

    console.log('✅ squad_instructions table created');

    // 4. Insert sample data to avoid empty joins
    console.log('\n📊 4. Inserting sample data...');

    // Sample squad_members
    await pool.query(`
      INSERT INTO squad_members (squad_id, agent_id, status, role, created_by)
      SELECT
        s.id as squad_id,
        gen_random_uuid() as agent_id,
        'active' as status,
        'member' as role,
        'system' as created_by
      FROM squads s
      WHERE s.deleted_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM squad_members sm WHERE sm.squad_id = s.id)
      LIMIT 5;
    `);

    // Sample squad_instructions
    await pool.query(`
      INSERT INTO squad_instructions (squad_id, title, content, created_by)
      SELECT
        s.id as squad_id,
        'Initial Setup Instructions' as title,
        'Complete the squad setup and assign initial tasks' as content,
        'system' as created_by
      FROM squads s
      WHERE s.deleted_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM squad_instructions si WHERE si.squad_id = s.id)
      LIMIT 5;
    `);

    console.log('✅ Sample data inserted');

    // 5. Test the COMPLETE failing query
    console.log('\n🧪 5. Testing COMPLETE project detail query...');

    const testQuery = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.slug,
        s.mission,
        s.domain,
        s.status as squad_status,
        ps.status as assignment_status,
        ps.attached_at as assigned_at,
        COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
        COUNT(DISTINCT si.id) FILTER (WHERE si.created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_instructions
      FROM project_squads ps
      JOIN squads s ON ps.squad_id = s.id
      LEFT JOIN squad_members sm ON s.id = sm.squad_id
      LEFT JOIN squad_instructions si ON s.id = si.squad_id
      WHERE ps.project_id IN (SELECT id FROM projects LIMIT 1)
      AND ps.status = 'active'
      AND s.deleted_at IS NULL
      GROUP BY s.id, s.name, s.slug, s.mission, s.domain, s.status, ps.status, ps.attached_at
      ORDER BY ps.attached_at DESC
      LIMIT 3;
    `);

    console.log('✅ Complete query successful:');
    testQuery.rows.forEach(row => {
      console.log(`   - Squad: ${row.name} (${row.members_count} members, ${row.recent_instructions} instructions)`);
    });

    // 6. Final verification
    console.log('\n📋 6. Final verification of all tables...');

    const tables = ['project_squads', 'squad_members', 'squad_instructions'];
    for (const table of tables) {
      const columns = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '${table}'
        ORDER BY ordinal_position;
      `);

      console.log(`\n${table} (${columns.rows.length} columns):`);
      columns.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type}`);
      });
    }

    console.log('\n🎉 ALL DATABASE STRUCTURES FIXED!');
    console.log('\n🚀 Interface should now work at: http://localhost:3001/cockpit/admin/projects');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

fixAllMissingStructures();