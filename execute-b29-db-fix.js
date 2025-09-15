// B29 RESOLUTION - Database Structure Fix (Node.js version)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function executeB29DatabaseFix() {
  console.log('🚀 B29 RESOLUTION - ÉTAPE 1: Database Structure Fix');

  try {
    // Create missing project_assignments table
    console.log('📊 Creating project_assignments table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        agent_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
        role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'lead', 'manager', 'observer')),
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        assigned_by UUID,
        unassigned_at TIMESTAMPTZ,

        -- Ensure one active assignment per agent per project
        CONSTRAINT unique_active_assignment UNIQUE(project_id, agent_id, status)
      );
    `);

    // Create optimized indexes
    console.log('📈 Creating optimized indexes...');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id
        ON project_assignments(project_id)
        WHERE status = 'active';
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_project_assignments_agent_id
        ON project_assignments(agent_id)
        WHERE status = 'active';
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_project_assignments_status
        ON project_assignments(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_project_assignments_assigned_at
        ON project_assignments(assigned_at DESC);
    `);

    // Insert sample data for existing projects
    console.log('📝 Inserting sample assignments for existing projects...');

    const insertResult = await pool.query(`
      INSERT INTO project_assignments (project_id, agent_id, status, role, assigned_by)
      SELECT
        p.id as project_id,
        gen_random_uuid() as agent_id,
        'active' as status,
        'member' as role,
        'system' as assigned_by
      FROM projects p
      WHERE p.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.project_id = p.id
        )
      LIMIT 10
      RETURNING project_id;
    `);

    console.log(`✅ Created ${insertResult.rows.length} sample assignments`);

    // Create function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_project_assignment_count()
      RETURNS TRIGGER AS $$
      BEGIN
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Validation query
    console.log('🔍 Validation...');

    const validation = await pool.query(`
      SELECT
        'project_assignments table created' as status,
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE status = 'active') as active_assignments,
        COUNT(DISTINCT project_id) as projects_with_assignments
      FROM project_assignments;
    `);

    console.log('📊 Validation Results:', validation.rows[0]);

    // Test critical query that was failing
    console.log('🧪 Testing critical query...');

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
      LIMIT 5;
    `);

    console.log('✅ Test query successful - Results:');
    testQuery.rows.forEach(row => {
      console.log(`   - ${row.project_name} (${row.client_name}): ${row.active_agents_count} agents`);
    });

    console.log('\n🎉 ÉTAPE 1 TERMINÉE AVEC SUCCÈS !');

  } catch (error) {
    console.error('❌ Erreur ÉTAPE 1:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

executeB29DatabaseFix();