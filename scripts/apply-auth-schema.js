const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arka_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function applySchema() {
  try {
    console.log('📝 Application du schéma d\'authentification...');
    
    // Lire et exécuter le schéma
    const schemaPath = path.join(__dirname, '../arka-meta/docs/db/schema/b24-auth-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Diviser le schéma en instructions individuelles
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await pool.query(statement + ';');
        console.log('✅ Instruction exécutée:', statement.substring(0, 50) + '...');
      } catch (err) {
        console.log('⚠️  Avertissement:', err.message);
      }
    }
    
    console.log('\n📝 Application des seeds...');
    
    // Lire et exécuter les seeds
    const seedsPath = path.join(__dirname, '../arka-meta/docs/db/seeds/b24-auth-seeds.sql');
    const seeds = fs.readFileSync(seedsPath, 'utf8');
    
    const seedStatements = seeds
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of seedStatements) {
      try {
        await pool.query(statement + ';');
        console.log('✅ Seed exécuté:', statement.substring(0, 50) + '...');
      } catch (err) {
        console.log('⚠️  Avertissement:', err.message);
      }
    }
    
    // Vérifier les users créés
    const result = await pool.query('SELECT email, role, full_name FROM users ORDER BY role, email');
    console.log('\n👥 Users créés:');
    result.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.full_name}`);
    });
    
    console.log('\n✅ Schéma et seeds appliqués avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Exécuter
applySchema().catch(console.error);