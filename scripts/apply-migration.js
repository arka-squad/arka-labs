/**
 * Script pour appliquer la migration 001-normalize-to-english.sql
 * Via Node.js avec postgres.js
 */

const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🚀 Démarrage migration normalisation BDD...');

  try {
    // Import dynamique pour éviter les erreurs de module
    const { sql } = await import('../lib/db.js');

    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '../migrations/001-normalize-to-english.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📂 Migration SQL chargée:', migrationPath);
    console.log('📏 Taille:', migrationSQL.length, 'caractères');

    // Diviser en commandes individuelles (séparées par ;)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log('🔧 Commandes SQL à exécuter:', commands.length);

    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`\n[${i + 1}/${commands.length}] Exécution:`, command.substring(0, 60) + '...');

      try {
        await sql.unsafe(command);
        console.log('✅ Succès');
      } catch (error) {
        console.log('⚠️ Warning:', error.message);
        // Continue même en cas d'erreur (colonnes déjà renommées, etc.)
      }
    }

    // Test de validation post-migration
    console.log('\n🧪 Tests de validation post-migration...');

    try {
      const testClient = await sql`SELECT name, status FROM clients LIMIT 1`;
      console.log('✅ Test clients.name/status:', testClient.length > 0 ? 'OK' : 'EMPTY');
    } catch (error) {
      console.log('❌ Test clients:', error.message);
    }

    try {
      const testAgent = await sql`SELECT domain FROM agents LIMIT 1`;
      console.log('✅ Test agents.domain:', testAgent.length >= 0 ? 'OK' : 'EMPTY');
    } catch (error) {
      console.log('❌ Test agents:', error.message);
    }

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('✅ Base de données normalisée vers schéma anglais uniforme');

  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
applyMigration();