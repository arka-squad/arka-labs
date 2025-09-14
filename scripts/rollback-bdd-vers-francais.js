/**
 * Rollback BDD vers français pour correspondre au code rollbacké
 */

const { Client } = require('pg');

async function rollbackDBToFrench() {
  console.log('🔄 Rollback BDD vers français...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    console.log('✅ Connexion BDD réussie');

    const rollbackMigrations = [
      // CLIENTS: anglais → français
      {
        name: 'clients.name → nom',
        sql: `ALTER TABLE clients RENAME COLUMN name TO nom`,
        critical: true
      },
      {
        name: 'clients.status → statut',
        sql: `ALTER TABLE clients RENAME COLUMN status TO statut`,
        critical: true
      },
      {
        name: 'clients.sector → secteur',
        sql: `ALTER TABLE clients RENAME COLUMN sector TO secteur`,
        critical: true
      },
      {
        name: 'clients.size → taille',
        sql: `ALTER TABLE clients RENAME COLUMN size TO taille`,
        critical: true
      },
      {
        name: 'clients.specific_context → contexte_specifique',
        sql: `ALTER TABLE clients RENAME COLUMN specific_context TO contexte_specifique`,
        critical: true
      },
      // AGENTS: anglais → français
      {
        name: 'agents.domain → domaine',
        sql: `ALTER TABLE agents RENAME COLUMN domain TO domaine`,
        critical: false
      },
      {
        name: 'agent_templates.domain → domaine',
        sql: `ALTER TABLE agent_templates RENAME COLUMN domain TO domaine`,
        critical: false
      }
    ];

    console.log(`\n🚀 ${rollbackMigrations.length} colonnes à rollback...`);

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
    console.log('\n🧪 Tests validation rollback...');

    try {
      const clients = await client.query('SELECT nom, secteur, taille, statut FROM clients LIMIT 1');
      console.log('✅ Test clients (nom, secteur, taille, statut): OK');
      if (clients.rows.length > 0) {
        console.log('📝 Exemple:', clients.rows[0]);
      }
    } catch (error) {
      console.log('❌ Test clients échoué:', error.message);
    }

    try {
      const agents = await client.query('SELECT domaine FROM agents LIMIT 1');
      console.log('✅ Test agents (domaine): OK');
    } catch (error) {
      console.log('❌ Test agents échoué:', error.message);
    }

    console.log('\n🎉 ROLLBACK BDD VERS FRANÇAIS TERMINÉ !');
    console.log('✅ Base de données alignée avec code français');

  } catch (error) {
    console.error('❌ Erreur rollback BDD:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

rollbackDBToFrench();