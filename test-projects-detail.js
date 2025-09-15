// Test des APIs Projects avec structure anglaise
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function test() {
  console.log('🧪 Test API Projects avec structure anglaise\n');

  try {
    // Test 1: Liste des projets
    console.log('📋 Test 1: Liste des projets');
    const listResponse = await fetch(`${API_BASE}/api/admin/projects`);
    if (!listResponse.ok) {
      throw new Error(`HTTP ${listResponse.status}`);
    }
    const projects = await listResponse.json();
    console.log(`✅ ${projects.items?.length || 0} projets trouvés`);

    if (projects.items && projects.items.length > 0) {
      const firstProject = projects.items[0];
      console.log(`   Premier projet: ${firstProject.name} (ID: ${firstProject.id})`);

      // Test 2: Détail d'un projet
      console.log('\n🔍 Test 2: Détail du premier projet');
      const detailResponse = await fetch(`${API_BASE}/api/admin/projects/${firstProject.id}`);
      if (!detailResponse.ok) {
        throw new Error(`HTTP ${detailResponse.status}`);
      }
      const projectDetail = await detailResponse.json();
      console.log('✅ Détail projet récupéré');
      console.log(`   Nom: ${projectDetail.name}`);
      console.log(`   Client: ${projectDetail.client_name}`);
      console.log(`   Secteur: ${projectDetail.client_sector}`);
      console.log(`   Taille client: ${projectDetail.client_size}`);
    }

    // Test 3: Liste des clients pour dropdown
    console.log('\n👥 Test 3: Liste des clients pour dropdown');
    const clientsResponse = await fetch(`${API_BASE}/api/admin/clients`);
    if (!clientsResponse.ok) {
      throw new Error(`HTTP ${clientsResponse.status}`);
    }
    const clients = await clientsResponse.json();
    console.log(`✅ ${clients.items?.length || 0} clients trouvés pour dropdown`);
    if (clients.items && clients.items.length > 0) {
      const firstClient = clients.items[0];
      console.log(`   Premier client: ${firstClient.name} (ID: ${firstClient.id})`);
    }

    console.log('\n🎉 Tous les tests réussis !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

test();