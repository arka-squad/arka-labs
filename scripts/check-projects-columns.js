#!/usr/bin/env node
const { Pool } = require('pg');

async function checkProjectColumns() {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
  
  const pool = new Pool({ connectionString });
  
  try {
    console.log('🔍 Colonnes de la table projects :\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n📊 Exemple de données dans projects :');
    const data = await pool.query(`SELECT * FROM projects LIMIT 1`);
    if (data.rows.length > 0) {
      console.log(data.rows[0]);
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  }
}

checkProjectColumns();