// Test de l'API project detail après correction
const fetch = require('node-fetch');

async function testProjectDetail() {
  console.log('🧪 Test API Project Detail après correction table agents\n');

  try {
    // D'abord récupérer la liste des projets pour avoir un ID
    const listResponse = await fetch('http://localhost:3000/api/admin/projects', {
      headers: {
        'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJzdWIiOiIxIiwidXNlcklkIjoxLCJlbWFpbCI6Im93bmVyQGV4YW1wbGUuY29tIiwibmFtZSI6IlN5c3RlbSBPd25lciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyNjQwMDEwMCwibmJmIjoxNzI2NDAwMTAwLCJleHAiOjE3MjY0MTQ1MDAsImp0aSI6IjEifQ.Ur5YPxqfyLO2UpPsAP4iRqzOUEt1uLMmCNjJGf8SYvw'
      }
    });

    if (!listResponse.ok) {
      throw new Error(`Liste projects HTTP ${listResponse.status}`);
    }

    const projectsList = await listResponse.json();
    console.log(`✅ ${projectsList.items?.length || 0} projets trouvés`);

    if (projectsList.items && projectsList.items.length > 0) {
      const firstProject = projectsList.items[0];
      console.log(`📋 Test détail du projet: ${firstProject.name} (${firstProject.id})`);

      // Test API détail
      const detailResponse = await fetch(`http://localhost:3000/api/admin/projects/${firstProject.id}`, {
        headers: {
          'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJzdWIiOiIxIiwidXNlcklkIjoxLCJlbWFpbCI6Im93bmVyQGV4YW1wbGUuY29tIiwibmFtZSI6IlN5c3RlbSBPd25lciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyNjQwMDEwMCwibmJmIjoxNzI2NDAwMTAwLCJleHAiOjE3MjY0MTQ1MDAsImp0aSI6IjEifQ.Ur5YPxqfyLO2UpPsAP4iRqzOUEt1uLMmCNjJGf8SYvw'
        }
      });

      if (!detailResponse.ok) {
        const errorText = await detailResponse.text();
        throw new Error(`API detail HTTP ${detailResponse.status}: ${errorText}`);
      }

      const projectDetail = await detailResponse.json();
      console.log('✅ API Project Detail répond OK !');
      console.log(`   Nom: ${projectDetail.name}`);
      console.log(`   Client: ${projectDetail.client_name}`);
      console.log(`   Agents assignés: ${projectDetail.agents_assigned || 0}`);
      console.log(`   Squads assignés: ${projectDetail.squads_assigned || 0}`);

    } else {
      console.log('⚠️  Aucun projet trouvé pour tester le détail');
    }

    console.log('\n🎉 Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur test:', error.message);
  }
}

testProjectDetail();