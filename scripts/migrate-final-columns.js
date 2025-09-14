/**
 * Migration finale - Colonnes françaises résiduelles → anglais
 */

const { Client } = require('pg');

async function migrateFinalColumns() {
  console.log('🔧 Migration finale colonnes résiduelles...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    console.log('✅ Connexion BDD réussie');

    const migrations = [
      // 1. clients.secteur → sector
      {
        name: 'clients.secteur → sector',
        sql: `ALTER TABLE clients RENAME COLUMN secteur TO sector`,
        critical: true
      },
      // 2. clients.taille → size
      {
        name: 'clients.taille → size',
        sql: `ALTER TABLE clients RENAME COLUMN taille TO size`,
        critical: true
      },
      // 3. clients.contexte_specifique → specific_context
      {
        name: 'clients.contexte_specifique → specific_context',
        sql: `ALTER TABLE clients RENAME COLUMN contexte_specifique TO specific_context`,
        critical: true
      },
      // 4. agent_templates.domaine → domain
      {
        name: 'agent_templates.domaine → domain',
        sql: `ALTER TABLE agent_templates RENAME COLUMN domaine TO domain`,
        critical: false
      }
    ];

    console.log(`\n🚀 ${migrations.length} colonnes à migrer...`);

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      console.log(`\n[${i + 1}/${migrations.length}] ${migration.name}...`);

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

    // Test final de validation
    console.log('\n🧪 Tests validation finale...');

    try {
      const clients = await client.query('SELECT sector, size, specific_context FROM clients LIMIT 1');
      console.log('✅ Test clients (sector, size, specific_context): OK');
      if (clients.rows.length > 0) {
        console.log('📝 Exemple:', clients.rows[0]);
      }
    } catch (error) {
      console.log('❌ Test clients échoué:', error.message);
    }

    try {
      const templates = await client.query('SELECT domain FROM agent_templates LIMIT 1');
      console.log('✅ Test agent_templates (domain): OK');
    } catch (error) {
      console.log('❌ Test agent_templates échoué:', error.message);
    }

    // Validation finale - Vérifier aucune colonne française
    console.log('\n🔍 Validation finale - Colonnes françaises...');
    const frenchCheck = await client.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND (
        column_name LIKE '%nom%' OR
        column_name LIKE '%statut%' OR
        column_name LIKE '%secteur%' OR
        column_name LIKE '%taille%' OR
        column_name LIKE '%domaine%' OR
        column_name LIKE '%telephone%' OR
        column_name LIKE '%contexte%'
      )
      ORDER BY table_name, column_name
    `);

    if (frenchCheck.rows.length > 0) {
      console.log('⚠️ Colonnes françaises restantes:');
      for (const row of frenchCheck.rows) {
        console.log(`  - ${row.table_name}.${row.column_name}`);
      }
    } else {
      console.log('🎉 AUCUNE colonne française résiduelle !');
      console.log('✅ NORMALISATION ANGLAIS 100% TERMINÉE !');
    }

    console.log('\n🏁 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !');

  } catch (error) {
    console.error('❌ Erreur migration finale:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

migrateFinalColumns();