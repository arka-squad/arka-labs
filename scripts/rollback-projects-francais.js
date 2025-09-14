/**
 * Rollback table projects vers français
 */

const { Client } = require('pg');

async function rollbackProjectsToFrench() {
  console.log('🔄 Rollback table projects vers français...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connexion BDD réussie');
    const rollbackMigrations = [
      {
        name: 'projects.name → nom',
        sql: `ALTER TABLE projects RENAME COLUMN name TO nom`,
        critical: true
      },
      {
        name: 'projects.status → statut',
        sql: `ALTER TABLE projects RENAME COLUMN status TO statut`,
        critical: true
      }
    ];

    console.log(`\n🚀 ${rollbackMigrations.length} colonnes projects à rollback...`);

    for (let i = 0; i < rollbackMigrations.length; i++) {
      const migration = rollbackMigrations[i];
      console.log(`\n[${i + 1}/${rollbackMigrations.length}] ${migration.name}...`);

      try {
        await client.query(migration.sql);
        console.log('✅ Succès');
      } catch (error) {
        if (migration.critical) {
          console.log('❌ ERREUR CRITIQUE:', error.message);
        } else {
          console.log('⚠️ Warning (ignoré):', error.message);
        }
      }
    }

    // Test validation finale
    console.log('\n🧪 Test validation rollback projects...');

    try {
      const projects = await client.query('SELECT nom, statut FROM projects LIMIT 1');
      console.log('✅ Test projects (nom, statut): OK');
      if (projects.rows.length > 0) {
        console.log('📝 Exemple:', projects.rows[0]);
      }
    } catch (error) {
      console.log('❌ Test projects échoué:', error.message);
    }

    console.log('\n🎉 ROLLBACK PROJECTS VERS FRANÇAIS TERMINÉ !');

  } catch (error) {
    console.error('❌ Erreur rollback projects:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

rollbackProjectsToFrench();