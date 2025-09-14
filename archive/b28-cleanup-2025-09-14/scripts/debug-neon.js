const { Pool } = require('pg');

// Test direct de la base Neon avec la même config que production
const connectionString = 'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function testNeonDB() {
  const pool = new Pool({ connectionString });
  
  try {
    console.log('🔗 Connexion à Neon DB...');
    
    // Test 1: Structure table clients
    console.log('\n📋 Structure table clients:');
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      ORDER BY ordinal_position
    `);
    console.table(structure.rows);
    
    // Test 2: Nombre total de clients
    console.log('\n📊 Nombre total de clients:');
    const count = await pool.query('SELECT COUNT(*) as total FROM clients WHERE deleted_at IS NULL');
    console.log(`Total: ${count.rows[0].total}`);
    
    // Test 3: Liste des 5 premiers clients
    console.log('\n👥 Les 5 premiers clients:');
    const clients = await pool.query(`
      SELECT id, nom, secteur, created_at 
      FROM clients 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.table(clients.rows);
    
    // Test 4: Recherche du client spécifique
    console.log('\n🎯 Recherche client spécifique b35321bd-7ebd-4910-9dcc-f33e707d6417:');
    const specificClient = await pool.query(`
      SELECT id, nom, secteur, taille, contact_principal, created_at 
      FROM clients 
      WHERE id = $1
    `, ['b35321bd-7ebd-4910-9dcc-f33e707d6417']);
    
    if (specificClient.rows.length > 0) {
      console.log('✅ CLIENT TROUVÉ:', specificClient.rows[0]);
    } else {
      console.log('❌ CLIENT NON TROUVÉ');
    }
    
    // Test 5: Type de l'ID (UUID vs INTEGER)
    console.log('\n🔍 Type de l\ID:');
    const typeTest = await pool.query(`
      SELECT id, pg_typeof(id) as id_type 
      FROM clients 
      LIMIT 1
    `);
    console.log('Type ID:', typeTest.rows[0]?.id_type);
    
    await pool.end();
    console.log('\n✅ Tests terminés');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
  }
}

testNeonDB();