#!/usr/bin/env node
const { Pool } = require('pg');

async function checkSchema() {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
  
  const pool = new Pool({ connectionString });
  
  try {
    console.log('🔍 Vérification du schéma de base de données...\n');
    
    // Lister toutes les tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Tables trouvées (${tables.rows.length}) :`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n🔍 Colonnes de la table projects :');
    const projectColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `);
    
    if (projectColumns.rows.length > 0) {
      projectColumns.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('   ❌ Table projects n\'existe pas !');
    }
    
    console.log('\n🔍 Colonnes de la table clients :');
    const clientColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `);
    
    if (clientColumns.rows.length > 0) {
      clientColumns.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('   ❌ Table clients n\'existe pas !');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  }
}

checkSchema();