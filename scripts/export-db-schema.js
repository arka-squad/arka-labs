/**
 * Export complet du schéma BDD pour audit colonnes résiduelles
 */

const { Client } = require('pg');

async function exportSchema() {
  console.log('🔍 Export schéma BDD - Audit colonnes résiduelles...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    console.log('✅ Connexion BDD réussie');

    // Lister toutes les tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\n📊 TABLES DÉTECTÉES:', tablesResult.rows.length);

    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n🔧 TABLE: ${tableName}`);

      // Colonnes de chaque table
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log('  📝 Colonnes:');
      const frenchColumns = [];
      const englishColumns = [];

      for (const col of columnsResult.rows) {
        const colName = col.column_name;
        const colType = col.data_type;

        // Détecter colonnes françaises vs anglaises
        const frenchWords = ['nom', 'statut', 'secteur', 'taille', 'domaine', 'contexte', 'telephone'];
        const englishWords = ['name', 'status', 'sector', 'size', 'domain', 'context', 'phone'];

        const isFrench = frenchWords.some(word => colName.toLowerCase().includes(word));
        const isEnglish = englishWords.some(word => colName.toLowerCase().includes(word));

        if (isFrench) {
          frenchColumns.push(colName);
          console.log(`    🇫🇷 ${colName} (${colType}) <- FRANÇAIS`);
        } else if (isEnglish) {
          englishColumns.push(colName);
          console.log(`    🇺🇸 ${colName} (${colType}) <- ANGLAIS`);
        } else {
          console.log(`    ⚪ ${colName} (${colType}) <- NEUTRE`);
        }
      }

      if (frenchColumns.length > 0) {
        console.log(`  ⚠️ COLONNES FRANÇAISES RÉSIDUELLES: ${frenchColumns.join(', ')}`);
      }
    }

    // Analyse colonnes problématiques globales
    console.log('\n🚨 AUDIT FINAL - COLONNES À MIGRER');

    const problematicTables = await client.query(`
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

    if (problematicTables.rows.length > 0) {
      console.log('\n❌ COLONNES PROBLÉMATIQUES DÉTECTÉES:');
      for (const row of problematicTables.rows) {
        console.log(`  - ${row.table_name}.${row.column_name}`);
      }
    } else {
      console.log('\n✅ Aucune colonne française résiduelle détectée !');
    }

    console.log('\n🎉 EXPORT SCHÉMA TERMINÉ');

  } catch (error) {
    console.error('❌ Erreur export schéma:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

exportSchema();