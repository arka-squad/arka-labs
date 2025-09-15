import { Client } from 'pg';

async function validateNewStructure() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connexion base de données établie');

    // Vérifier les données insérées
    const clientsResult = await client.query('SELECT id, name, sector, size, status FROM clients ORDER BY name');
    console.log('\n📊 CLIENTS:');
    clientsResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.sector}, ${row.size}, ${row.status})`);
    });

    const projectsResult = await client.query('SELECT id, name, status, client_id FROM projects ORDER BY name');
    console.log('\n📊 PROJECTS:');
    projectsResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.status})`);
    });

    const squadsResult = await client.query('SELECT id, name, status, project_id FROM squads ORDER BY name');
    console.log('\n📊 SQUADS:');
    squadsResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.status})`);
    });

    // Tester une jointure complexe comme celle qui plantait avant
    const joinTest = await client.query(`
      SELECT
        p.id,
        p.name,
        p.status,
        c.name as client_name,
        c.sector as client_sector,
        COUNT(s.id) as squad_count
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN squads s ON s.project_id = p.id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, c.id
      ORDER BY p.name
    `);

    console.log('\n🔗 TEST JOINTURE PROJECTS-CLIENTS-SQUADS:');
    joinTest.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.client_name} - ${row.client_sector}) - ${row.squad_count} squads`);
    });

    console.log('\n✅ Structure anglaise B29 validée avec succès!');
    console.log(`📈 ${clientsResult.rows.length} clients, ${projectsResult.rows.length} projets, ${squadsResult.rows.length} squads`);

  } catch (error) {
    console.error('❌ Erreur validation:', error);
    throw error;
  } finally {
    await client.end();
  }
}

validateNewStructure().catch(console.error);