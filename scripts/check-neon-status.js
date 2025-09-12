const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function checkDatabase() {
  const pool = new Pool({ connectionString });
  
  console.log('🔍 Vérification de la base de données Neon...\n');

  try {
    // 1. Lister toutes les tables
    const tables = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables existantes :');
    if (tables.rows.length === 0) {
      console.log('  Aucune table trouvée');
    } else {
      for (const table of tables.rows) {
        // Compter les lignes
        try {
          const count = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
          console.log(`  - ${table.table_name} (${table.column_count} colonnes, ${count.rows[0].count} lignes)`);
        } catch (e) {
          console.log(`  - ${table.table_name} (${table.column_count} colonnes, erreur de comptage)`);
        }
      }
    }

    // 2. Vérifier la structure de la table clients si elle existe
    const clientsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      )
    `);

    if (clientsExists.rows[0].exists) {
      console.log('\n📊 Structure de la table clients :');
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'clients'
        ORDER BY ordinal_position
      `);
      
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    // 3. Vérifier la structure de la table users si elle existe
    const usersExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);

    if (usersExists.rows[0].exists) {
      console.log('\n👤 Utilisateurs dans la base :');
      const users = await pool.query(`
        SELECT email, role FROM users ORDER BY email
      `);
      
      if (users.rows.length === 0) {
        console.log('  Aucun utilisateur');
      } else {
        users.rows.forEach(user => {
          console.log(`  - ${user.email} (${user.role})`);
        });
      }
    }

    // 4. Test de connexion
    console.log('\n✅ Connexion à la base de données réussie !');
    console.log(`🔗 Host: ${connectionString.match(/(@[^/]+)/)?.[1]?.slice(1) || 'unknown'}`);

  } catch (error) {
    console.error('❌ Erreur :', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabase().catch(console.error);