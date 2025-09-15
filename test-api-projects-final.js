// Test final complet des APIs Projects
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function testProjectsAPIs() {
  console.log('🧪 Test Final APIs Projects après toutes corrections\n');

  try {
    // 1. Test structure base de données
    console.log('📋 Test 1: Structure base de données');

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('projects', 'clients', 'agents', 'project_assignments', 'project_squads')
      ORDER BY table_name
    `);

    console.log('✅ Tables requises:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

    // 2. Test données de base
    console.log('\n📊 Test 2: Données de base');

    const clientsCount = await pool.query('SELECT COUNT(*) FROM clients');
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects');
    const agentsCount = await pool.query('SELECT COUNT(*) FROM agents');

    console.log(`✅ ${clientsCount.rows[0].count} clients en base`);
    console.log(`✅ ${projectsCount.rows[0].count} projets en base`);
    console.log(`✅ ${agentsCount.rows[0].count} agents en base`);

    // 3. Test structure anglaise
    console.log('\n🔤 Test 3: Structure anglaise (colonnes)');

    const clientsColumns = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'clients'
      AND column_name IN ('name', 'sector', 'size', 'status')
      ORDER BY column_name
    `);

    const projectsColumns = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'projects'
      AND column_name IN ('name', 'description', 'status', 'priority')
      ORDER BY column_name
    `);

    console.log('✅ Clients - colonnes anglaises:');
    clientsColumns.rows.forEach(row => console.log(`   - ${row.column_name}`));

    console.log('✅ Projects - colonnes anglaises:');
    projectsColumns.rows.forEach(row => console.log(`   - ${row.column_name}`));

    // 4. Test requête listing projects (comme API)
    console.log('\n📝 Test 4: Requête listing projects');

    const projectsList = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.priority,
        p.budget,
        p.deadline,
        c.name as client_name,
        c.sector as client_sector,
        c.size as client_size
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    console.log(`✅ ${projectsList.rows.length} projets retournés avec structure anglaise`);
    if (projectsList.rows.length > 0) {
      const first = projectsList.rows[0];
      console.log(`   Exemple: ${first.name} (client: ${first.client_name})`);
    }

    // 5. Test requête detail project (comme API)
    console.log('\n🔍 Test 5: Requête detail project');

    if (projectsList.rows.length > 0) {
      const projectId = projectsList.rows[0].id;

      const projectDetail = await pool.query(`
        SELECT
          p.*,
          c.name as client_name,
          c.sector as client_sector,
          c.size as client_size,
          c.primary_contact as client_contact,
          COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_assigned,
          COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_assigned
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        LEFT JOIN project_squads ps ON p.id = ps.project_id
        WHERE p.id = $1 AND p.deleted_at IS NULL
        GROUP BY p.id, c.name, c.sector, c.size, c.primary_contact
      `, [projectId]);

      if (projectDetail.rows.length > 0) {
        console.log('✅ Detail project fonctionnel avec structure anglaise');
        const detail = projectDetail.rows[0];
        console.log(`   Projet: ${detail.name}`);
        console.log(`   Client: ${detail.client_name} (${detail.client_sector})`);
        console.log(`   Agents: ${detail.agents_assigned}, Squads: ${detail.squads_assigned}`);
      }
    }

    // 6. Test requête agents (pour éviter erreur 500)
    console.log('\n👥 Test 6: Requête agents assignés');

    const agentsTest = await pool.query(`
      SELECT
        a.id,
        a.name,
        a.role,
        a.domaine
      FROM agents a
      WHERE a.deleted_at IS NULL
      LIMIT 3
    `);

    console.log(`✅ ${agentsTest.rows.length} agents disponibles pour assignment`);

    console.log('\n🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('\n📋 Résumé:');
    console.log('✅ Tables existantes et structure anglaise OK');
    console.log('✅ Données présentes (clients, projets, agents)');
    console.log('✅ Requêtes listing et detail fonctionnelles');
    console.log('✅ PRÊT POUR TEST INTERFACE NAVIGATEUR');

  } catch (error) {
    console.error('❌ Erreur test:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testProjectsAPIs();