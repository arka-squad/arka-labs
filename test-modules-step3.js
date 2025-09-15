// Test complet des 3 modules métier B29 Step 3
const { Client } = require('pg');

async function testModulesStep3() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('🧪 Test B29 Step 3 - Modules métier avec structure anglaise...\n');

    // Test 1: Requête clients avec structure anglaise
    console.log('📊 TEST 1: CLIENTS (structure anglaise)');
    const clientsResult = await client.query(`
      SELECT id, name, sector, size, status, created_at
      FROM clients
      WHERE deleted_at IS NULL
      ORDER BY name
      LIMIT 3
    `);

    clientsResult.rows.forEach(client => {
      console.log(`  ✅ ${client.name} - ${client.sector} (${client.size}, ${client.status})`);
    });

    // Test 2: Requête projects avec relations
    console.log('\n📋 TEST 2: PROJECTS avec clients (jointure anglaise)');
    const projectsResult = await client.query(`
      SELECT
        p.id,
        p.name,                    -- ✅ Plus de confusion nom/name
        p.status,                  -- ✅ Plus de confusion statut/status
        p.budget,
        c.name as client_name,     -- ✅ Cohérent
        c.sector as client_sector  -- ✅ Plus d'erreur secteur/sector
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.name
      LIMIT 3
    `);

    projectsResult.rows.forEach(project => {
      console.log(`  ✅ ${project.name} (${project.status}) - Client: ${project.client_name} (${project.client_sector})`);
    });

    // Test 3: Requête squads avec relations complètes
    console.log('\n👥 TEST 3: SQUADS avec projects et clients (jointure triple)');
    const squadsResult = await client.query(`
      SELECT
        s.id,
        s.name,                     -- ✅ Squads déjà en anglais
        s.status,                   -- ✅ Cohérent
        p.name as project_name,     -- ✅ Plus d'erreur
        c.name as client_name       -- ✅ Plus d'erreur
      FROM squads s
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE s.deleted_at IS NULL
      ORDER BY s.name
    `);

    squadsResult.rows.forEach(squad => {
      console.log(`  ✅ ${squad.name} (${squad.status}) - Projet: ${squad.project_name} - Client: ${squad.client_name}`);
    });

    // Test 4: Requête complexe de statistiques (celle qui plantait avant)
    console.log('\n📈 TEST 4: STATISTIQUES COMPLEXES (anciennement problématique)');
    const statsResult = await client.query(`
      SELECT
        c.name as client_name,
        c.sector,
        c.size,
        c.status as client_status,
        COUNT(DISTINCT p.id) as projects_count,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_projects,
        COUNT(DISTINCT s.id) as squads_count,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_squads
      FROM clients c
      LEFT JOIN projects p ON p.client_id = c.id AND p.deleted_at IS NULL
      LEFT JOIN squads s ON s.client_id = c.id AND s.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY c.id, c.name, c.sector, c.size, c.status
      ORDER BY projects_count DESC
    `);

    statsResult.rows.forEach(stat => {
      console.log(`  ✅ ${stat.client_name} (${stat.sector}) - ${stat.projects_count} projets, ${stat.squads_count} squads`);
    });

    console.log('\n🎉 TOUS LES TESTS STEP 3 RÉUSSIS!');
    console.log('👉 Structure anglaise 100% fonctionnelle');
    console.log('👉 Plus d\'erreurs FR-EN sur les jointures');
    console.log('👉 Modules clients, projects, squads opérationnels');

  } catch (error) {
    console.error('❌ Test Step 3 failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testModulesStep3();