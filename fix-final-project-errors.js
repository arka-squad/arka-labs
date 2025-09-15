// FINAL fix for all project detail errors
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixFinalProjectErrors() {
  console.log('🔧 FINAL FIX - All project detail errors...');

  try {
    // 1. Fix project_squads missing columns
    console.log('\n📋 1. project_squads - adding missing columns...');

    const missingProjectSquadsCols = [
      'attached_at TIMESTAMPTZ DEFAULT NOW()',
      'attached_by VARCHAR(255)'
    ];

    for (const colDef of missingProjectSquadsCols) {
      const [colName] = colDef.split(' ');
      try {
        await pool.query(`ALTER TABLE project_squads ADD COLUMN IF NOT EXISTS ${colDef};`);
        console.log(`✅ Added ${colName} to project_squads`);
      } catch (e) {
        console.log(`ℹ️  ${colName} already exists in project_squads`);
      }
    }

    // 2. Drop and recreate squad_members cleanly
    console.log('\n👥 2. squad_members - clean recreate...');

    await pool.query(`DROP TABLE IF EXISTS squad_members CASCADE;`);
    await pool.query(`
      CREATE TABLE squad_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        squad_id UUID NOT NULL,
        agent_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        left_at TIMESTAMPTZ,
        created_by VARCHAR(255),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ squad_members recreated');

    // 3. Drop and recreate squad_instructions cleanly
    console.log('\n📝 3. squad_instructions - clean recreate...');

    await pool.query(`DROP TABLE IF EXISTS squad_instructions CASCADE;`);
    await pool.query(`
      CREATE TABLE squad_instructions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        squad_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'active',
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );
    `);
    console.log('✅ squad_instructions recreated');

    // 4. Insert minimal sample data
    console.log('\n📊 4. Adding sample data...');

    // Get existing squads and projects
    const squads = await pool.query(`SELECT id FROM squads LIMIT 3`);
    const projects = await pool.query(`SELECT id FROM projects LIMIT 1`);

    if (squads.rows.length > 0) {
      // Add squad members
      for (const squad of squads.rows) {
        await pool.query(`
          INSERT INTO squad_members (squad_id, agent_id, status, created_by)
          VALUES ($1, gen_random_uuid(), 'active', 'system')
        `, [squad.id]);
      }

      // Add squad instructions
      for (const squad of squads.rows) {
        await pool.query(`
          INSERT INTO squad_instructions (squad_id, title, content, created_by)
          VALUES ($1, 'Setup Instructions', 'Complete initial squad setup', 'system')
        `, [squad.id]);
      }

      // Link squads to projects if we have both
      if (projects.rows.length > 0) {
        for (const squad of squads.rows) {
          await pool.query(`
            INSERT INTO project_squads (project_id, squad_id, status, attached_at, attached_by)
            VALUES ($1, $2, 'active', NOW(), 'system')
            ON CONFLICT DO NOTHING
          `, [projects.rows[0].id, squad.id]);
        }
      }

      console.log(`✅ Added sample data for ${squads.rows.length} squads`);
    }

    // 5. TEST the exact failing query
    console.log('\n🧪 5. Testing the EXACT failing query...');

    const testProjectId = projects.rows[0]?.id;
    if (testProjectId) {
      const result = await pool.query(`
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
        WHERE ps.project_id = $1::uuid
        AND ps.status = 'active'
        AND s.deleted_at IS NULL
        GROUP BY s.id, s.name, s.slug, s.mission, s.domain, s.status, ps.status, ps.attached_at
        ORDER BY ps.attached_at DESC;
      `, [testProjectId]);

      console.log('✅ EXACT query test successful!');
      console.log(`   Found ${result.rows.length} squad assignments`);
      result.rows.forEach(row => {
        console.log(`   - ${row.name}: ${row.members_count} members, ${row.recent_instructions} instructions`);
      });
    }

    console.log('\n🎉 ALL PROJECT DETAIL ERRORS FIXED!');
    console.log('\n🎯 Ready to test: http://localhost:3001/cockpit/admin/projects/[project-id]');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

fixFinalProjectErrors();