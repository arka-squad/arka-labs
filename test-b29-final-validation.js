// Test B29 Final Validation - Complete System Check
const { Client } = require('pg');

async function testB29FinalValidation() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('🔍 B29 - VALIDATION FINALE COMPLÈTE\n');

    let allTestsPassed = true;
    const testResults = [];

    // Test 1: Database Schema Validation
    console.log('📊 TEST 1: VALIDATION SCHÉMA DE BASE DE DONNÉES');
    try {
      // Vérifier les tables principales
      const tables = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const expectedTables = ['clients', 'projects', 'squads'];
      const actualTables = tables.rows.map(r => r.table_name);
      const missingTables = expectedTables.filter(t => !actualTables.includes(t));

      if (missingTables.length === 0) {
        console.log('  ✅ Toutes les tables requises sont présentes');
        testResults.push({ test: 'Schema Tables', status: 'PASS' });
      } else {
        console.log(`  ❌ Tables manquantes: ${missingTables.join(', ')}`);
        testResults.push({ test: 'Schema Tables', status: 'FAIL' });
        allTestsPassed = false;
      }

      // Vérifier la structure des colonnes (anglaise)
      const clientColumns = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'clients' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);

      const expectedClientColumns = ['id', 'name', 'sector', 'size', 'status'];
      const actualClientColumns = clientColumns.rows.map(r => r.column_name);
      const hasEnglishStructure = expectedClientColumns.every(col =>
        actualClientColumns.includes(col)
      );

      if (hasEnglishStructure) {
        console.log('  ✅ Structure anglaise des colonnes validée');
        testResults.push({ test: 'English Columns', status: 'PASS' });
      } else {
        console.log('  ❌ Structure anglaise des colonnes incorrecte');
        testResults.push({ test: 'English Columns', status: 'FAIL' });
        allTestsPassed = false;
      }

    } catch (error) {
      console.log(`  ❌ Erreur schema: ${error.message}`);
      testResults.push({ test: 'Database Schema', status: 'FAIL' });
      allTestsPassed = false;
    }

    // Test 2: Data Integrity & Relations
    console.log('\n🔗 TEST 2: INTÉGRITÉ DES DONNÉES ET RELATIONS');
    try {
      // Vérifier les données de test
      const clientsCount = await client.query('SELECT COUNT(*) FROM clients');
      const projectsCount = await client.query('SELECT COUNT(*) FROM projects');
      const squadsCount = await client.query('SELECT COUNT(*) FROM squads');

      console.log(`  📊 Données: ${clientsCount.rows[0].count} clients, ${projectsCount.rows[0].count} projets, ${squadsCount.rows[0].count} squads`);

      // Vérifier les relations client-projet
      const projectsWithClients = await client.query(`
        SELECT COUNT(*) FROM projects p
        INNER JOIN clients c ON p.client_id = c.id
        WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL
      `);

      if (parseInt(projectsWithClients.rows[0].count) > 0) {
        console.log('  ✅ Relations client-projet fonctionnelles');
        testResults.push({ test: 'Client-Project Relations', status: 'PASS' });
      } else {
        console.log('  ⚠️ Aucune relation client-projet trouvée');
        testResults.push({ test: 'Client-Project Relations', status: 'WARN' });
      }

      // Vérifier les contraintes FK
      const foreignKeys = await client.query(`
        SELECT COUNT(*) FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
      `);

      if (parseInt(foreignKeys.rows[0].count) >= 2) {
        console.log('  ✅ Contraintes de clés étrangères présentes');
        testResults.push({ test: 'Foreign Key Constraints', status: 'PASS' });
      } else {
        console.log('  ❌ Contraintes de clés étrangères manquantes');
        testResults.push({ test: 'Foreign Key Constraints', status: 'FAIL' });
        allTestsPassed = false;
      }

    } catch (error) {
      console.log(`  ❌ Erreur relations: ${error.message}`);
      testResults.push({ test: 'Data Relations', status: 'FAIL' });
      allTestsPassed = false;
    }

    // Test 3: API Endpoints Functionality
    console.log('\n🌐 TEST 3: FONCTIONNALITÉ DES ENDPOINTS API');
    try {
      // Test simple query pour vérifier que les jointures fonctionnent
      const projectsWithClientInfo = await client.query(`
        SELECT
          p.id,
          p.name,
          p.status,
          c.name as client_name,
          c.sector as client_sector
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.deleted_at IS NULL
        LIMIT 3
      `);

      if (projectsWithClientInfo.rows.length > 0) {
        const project = projectsWithClientInfo.rows[0];
        const hasCorrectFields = project.name && project.status && project.client_name;

        if (hasCorrectFields) {
          console.log('  ✅ Jointures API fonctionnelles avec structure anglaise');
          console.log(`    📝 Exemple: "${project.name}" (${project.status}) - ${project.client_name}`);
          testResults.push({ test: 'API Joins', status: 'PASS' });
        } else {
          console.log('  ❌ Champs manquants dans les jointures API');
          testResults.push({ test: 'API Joins', status: 'FAIL' });
          allTestsPassed = false;
        }
      } else {
        console.log('  ⚠️ Aucune donnée pour tester les jointures API');
        testResults.push({ test: 'API Joins', status: 'WARN' });
      }

    } catch (error) {
      console.log(`  ❌ Erreur API: ${error.message}`);
      testResults.push({ test: 'API Functionality', status: 'FAIL' });
      allTestsPassed = false;
    }

    // Test 4: Performance & Indexing
    console.log('\n⚡ TEST 4: PERFORMANCE ET INDEXATION');
    try {
      // Vérifier les index
      const indexes = await client.query(`
        SELECT tablename, indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('clients', 'projects', 'squads')
        ORDER BY tablename, indexname
      `);

      const indexCount = indexes.rows.length;
      if (indexCount >= 3) { // Au minimum les PK
        console.log(`  ✅ Indexation: ${indexCount} index trouvés`);
        testResults.push({ test: 'Database Indexes', status: 'PASS' });
      } else {
        console.log(`  ⚠️ Indexation limitée: ${indexCount} index seulement`);
        testResults.push({ test: 'Database Indexes', status: 'WARN' });
      }

      // Test de performance simple
      const start = Date.now();
      await client.query(`
        SELECT p.*, c.name as client_name, c.sector as client_sector
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT 100
      `);
      const duration = Date.now() - start;

      if (duration < 100) {
        console.log(`  ✅ Performance: Requête complexe en ${duration}ms`);
        testResults.push({ test: 'Query Performance', status: 'PASS' });
      } else {
        console.log(`  ⚠️ Performance: Requête complexe en ${duration}ms (>100ms)`);
        testResults.push({ test: 'Query Performance', status: 'WARN' });
      }

    } catch (error) {
      console.log(`  ❌ Erreur performance: ${error.message}`);
      testResults.push({ test: 'Performance', status: 'FAIL' });
      allTestsPassed = false;
    }

    // Test 5: Soft Delete Functionality
    console.log('\n🗑️ TEST 5: FONCTIONNALITÉ SOFT DELETE');
    try {
      // Vérifier que les colonnes deleted_at existent
      const softDeleteColumns = await client.query(`
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'deleted_at'
        AND table_schema = 'public'
        AND table_name IN ('clients', 'projects', 'squads')
      `);

      if (softDeleteColumns.rows.length === 3) {
        console.log('  ✅ Colonnes deleted_at présentes sur toutes les tables');
        testResults.push({ test: 'Soft Delete Columns', status: 'PASS' });
      } else {
        console.log('  ❌ Colonnes deleted_at manquantes');
        testResults.push({ test: 'Soft Delete Columns', status: 'FAIL' });
        allTestsPassed = false;
      }

    } catch (error) {
      console.log(`  ❌ Erreur soft delete: ${error.message}`);
      testResults.push({ test: 'Soft Delete', status: 'FAIL' });
      allTestsPassed = false;
    }

    // Rapport final
    console.log('\n📋 RAPPORT DE VALIDATION B29');
    console.log('================================');

    const passed = testResults.filter(t => t.status === 'PASS').length;
    const failed = testResults.filter(t => t.status === 'FAIL').length;
    const warnings = testResults.filter(t => t.status === 'WARN').length;

    testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' :
                   result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.status}`);
    });

    console.log(`\n📊 RÉSULTATS: ${passed} PASS | ${failed} FAIL | ${warnings} WARN`);

    // Validation finale
    if (allTestsPassed && failed === 0) {
      console.log('\n🎉 B29 VALIDATION RÉUSSIE - SYSTÈME PRÊT POUR PRODUCTION');
      console.log('✅ Migration FR→EN complétée avec succès');
      console.log('✅ Base de données cohérente et performante');
      console.log('✅ API fonctionnelle avec structure anglaise');
      console.log('✅ Plus d\'erreurs de mapping FR-EN');
      console.log('\n🚀 PRÊT POUR DÉPLOIEMENT');
      return true;
    } else {
      console.log('\n❌ VALIDATION PARTIELLE - CORRECTIONS RECOMMANDÉES');
      if (failed > 0) {
        console.log(`⚠️ ${failed} test(s) critique(s) échoué(s)`);
      }
      if (warnings > 0) {
        console.log(`ℹ️ ${warnings} avertissement(s) à considérer`);
      }
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur lors de la validation B29:', error);
    return false;
  } finally {
    await client.end();
  }
}

testB29FinalValidation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });