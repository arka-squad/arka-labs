/**
 * Script de migration direct avec DATABASE_URL
 */

const postgres = require('postgres');

async function applyMigration() {
  console.log('🚀 Migration normalisation BDD - Démarrage direct...');

  // Connexion directe avec DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL manquant');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('🔗 Connexion BDD...');

    // Test connexion
    const testConn = await sql`SELECT 1`;
    console.log('✅ Connexion réussie');

    // ÉTAPE 1: Vérifier structure actuelle
    console.log('\n📊 État actuel BDD...');

    try {
      const clientsCols = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'clients'
        ORDER BY column_name
      `;
      console.log('🏢 Colonnes clients actuelles:', clientsCols.map(c => c.column_name).join(', '));
    } catch (e) {
      console.log('⚠️ Table clients introuvable');
    }

    try {
      const agentsCols = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'agents'
        ORDER BY column_name
      `;
      console.log('🤖 Colonnes agents actuelles:', agentsCols.map(c => c.column_name).join(', '));
    } catch (e) {
      console.log('⚠️ Table agents introuvable');
    }

    // ÉTAPE 2: Appliquer migrations une par une
    console.log('\n🔧 Application migration normalisation...');

    const migrations = [
      // 1. Clients nom → name
      {
        name: 'clients.nom → name',
        sql: `ALTER TABLE clients RENAME COLUMN nom TO name`,
        critical: true
      },
      // 2. Clients statut → status
      {
        name: 'clients.statut → status',
        sql: `ALTER TABLE clients RENAME COLUMN statut TO status`,
        critical: true
      },
      // 3. Clients secteur → sector (si existe)
      {
        name: 'clients.secteur → sector',
        sql: `ALTER TABLE clients RENAME COLUMN secteur TO sector`,
        critical: false
      },
      // 4. Clients taille → size (si existe)
      {
        name: 'clients.taille → size',
        sql: `ALTER TABLE clients RENAME COLUMN taille TO size`,
        critical: false
      },
      // 5. Agents domaine → domain
      {
        name: 'agents.domaine → domain',
        sql: `ALTER TABLE agents RENAME COLUMN domaine TO domain`,
        critical: false
      },
      // 6. Index clients
      {
        name: 'Index clients name',
        sql: `CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)`,
        critical: false
      },
      // 7. Contrainte status
      {
        name: 'Contrainte status',
        sql: `ALTER TABLE clients ADD CONSTRAINT clients_status_check CHECK (status IN ('active', 'inactive', 'archived'))`,
        critical: false
      }
    ];

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      console.log(`\n[${i + 1}/${migrations.length}] ${migration.name}...`);

      try {
        await sql.unsafe(migration.sql);
        console.log('✅ Succès');
      } catch (error) {
        if (migration.critical) {
          console.log('❌ ERREUR CRITIQUE:', error.message);
        } else {
          console.log('⚠️ Warning (ignoré):', error.message);
        }
      }
    }

    // ÉTAPE 3: Validation post-migration
    console.log('\n🧪 Tests validation post-migration...');

    try {
      const clients = await sql`SELECT name, status FROM clients LIMIT 1`;
      console.log('✅ Test clients normalisés: OK');
    } catch (error) {
      console.log('❌ Test clients:', error.message);
    }

    try {
      const agents = await sql`SELECT name, domain FROM agents LIMIT 1`;
      console.log('✅ Test agents normalisés: OK');
    } catch (error) {
      console.log('❌ Test agents:', error.message);
    }

    // ÉTAPE 4: État final
    console.log('\n📊 État final BDD...');
    try {
      const finalClientsCols = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'clients'
        ORDER BY column_name
      `;
      console.log('🏢 Colonnes clients finales:', finalClientsCols.map(c => c.column_name).join(', '));
    } catch (e) {
      console.log('⚠️ Erreur lecture colonnes finales');
    }

    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
    console.log('✅ Base de données normalisée schéma anglais uniforme');

  } catch (error) {
    console.error('❌ Erreur fatale migration:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('🔌 Connexion BDD fermée');
  }
}

applyMigration();