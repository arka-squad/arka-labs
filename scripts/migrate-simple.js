/**
 * Migration simple avec pg natif
 */

const { Client } = require('pg');

async function runMigration() {
  console.log('🚀 Migration BDD Normalisation - Démarrage...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    console.log('✅ Connexion BDD réussie');

    // Test état actuel
    try {
      const result = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'clients'
        ORDER BY column_name
      `);
      console.log('🏢 Colonnes clients actuelles:', result.rows.map(r => r.column_name).join(', '));
    } catch (e) {
      console.log('⚠️ Erreur lecture colonnes:', e.message);
    }

    // Migration 1: clients nom → name
    console.log('\n🔧 [1/4] clients.nom → name...');
    try {
      await client.query('ALTER TABLE clients RENAME COLUMN nom TO name');
      console.log('✅ Succès');
    } catch (error) {
      console.log('⚠️', error.message);
    }

    // Migration 2: clients statut → status
    console.log('🔧 [2/4] clients.statut → status...');
    try {
      await client.query('ALTER TABLE clients RENAME COLUMN statut TO status');
      console.log('✅ Succès');
    } catch (error) {
      console.log('⚠️', error.message);
    }

    // Migration 3: agents domaine → domain
    console.log('🔧 [3/4] agents.domaine → domain...');
    try {
      await client.query('ALTER TABLE agents RENAME COLUMN domaine TO domain');
      console.log('✅ Succès');
    } catch (error) {
      console.log('⚠️', error.message);
    }

    // Migration 4: Index
    console.log('🔧 [4/4] Création index...');
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)');
      console.log('✅ Succès');
    } catch (error) {
      console.log('⚠️', error.message);
    }

    // Test validation
    console.log('\n🧪 Test validation...');
    try {
      const test = await client.query('SELECT name, status FROM clients LIMIT 1');
      console.log('✅ Test normalisation: OK -', test.rows.length, 'client(s)');
      if (test.rows.length > 0) {
        console.log('📝 Exemple:', test.rows[0]);
      }
    } catch (error) {
      console.log('❌ Test échoué:', error.message);
    }

    console.log('\n🎉 MIGRATION TERMINÉE !');
    console.log('✅ Base de données normalisée schéma anglais');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

runMigration();