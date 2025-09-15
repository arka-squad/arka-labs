import { Client } from 'pg';
import fs from 'fs/promises';

async function executeMigration() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connexion base de données établie');

    // Lire le fichier de migration
    const migrationSQL = await fs.readFile('db/migrations/b29_002_create_fresh_english.sql', 'utf-8');
    console.log('📄 Migration SQL chargée');

    console.log('🚀 Exécution de la migration FR → EN...');
    console.log('⚠️  Cette opération va modifier la structure de la base de données');

    // Exécuter la migration
    const result = await client.query(migrationSQL);
    console.log('✅ Migration exécutée avec succès!');

    // Afficher les notices si disponibles
    if (result.notices) {
      console.log('\n📋 Notices:');
      result.notices.forEach(notice => console.log('  ', notice));
    }

    // Vérifier les changements
    console.log('\n🔍 Vérification post-migration...');

    const clientsColumns = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `);

    const projectsColumns = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Colonnes clients:', clientsColumns.rows.map(r => r.column_name).join(', '));
    console.log('📊 Colonnes projects:', projectsColumns.rows.map(r => r.column_name).join(', '));

  } catch (error) {
    console.error('❌ Erreur migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

executeMigration().catch(console.error);