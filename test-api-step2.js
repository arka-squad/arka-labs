// Test simple de l'API Step 2 avec la nouvelle structure anglaise
const express = require('express');

async function testApiStep2() {
  try {
    // Import dynamique pour éviter les erreurs de TypeScript
    const { db, testConnection } = await import('./src/lib/db.ts');

    console.log('🧪 Test API B29 Step 2...');

    // Test connexion DB
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Test requête simple sur nouvelle structure anglaise
    const clients = await db('clients')
      .select('id', 'name', 'sector', 'size', 'status')
      .where('deleted_at', null)
      .limit(3);

    console.log('✅ Clients (structure anglaise):');
    clients.forEach(client => {
      console.log(`  - ${client.name} (${client.sector}, ${client.size}, ${client.status})`);
    });

    // Test jointure qui plantait avant
    const projectsWithClients = await db('projects as p')
      .select(
        'p.id',
        'p.name',           // ✅ Plus de confusion nom/name
        'p.status',         // ✅ Plus de confusion statut/status
        'c.name as client_name',
        'c.sector as client_sector'
      )
      .leftJoin('clients as c', 'p.client_id', 'c.id')
      .where('p.deleted_at', null)
      .limit(3);

    console.log('\n✅ Projects avec clients (jointure OK):');
    projectsWithClients.forEach(project => {
      console.log(`  - ${project.name} (Client: ${project.client_name} - ${project.client_sector})`);
    });

    console.log('\n🎉 API Step 2 - Structure anglaise fonctionnelle!');

    await db.destroy();

  } catch (error) {
    console.error('❌ Test API Step 2 failed:', error);
    process.exit(1);
  }
}

testApiStep2();