const { Pool } = require('pg');

async function initClientsTable() {
  // Use DATABASE_URL from environment or fallback to local config
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  let pool;
  if (!connectionString) {
    console.log('Using local database configuration (localhost:5433)');
    pool = new Pool({
      host: 'localhost',
      port: 5433,
      database: 'postgres',
      user: 'postgres',
      password: 'postgres'
    });
  } else {
    console.log('Using connection string from environment');
    pool = new Pool({ connectionString });
  }

  try {
    // Create clients table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        created_by VARCHAR(255) DEFAULT 'system'
      )
    `);
    console.log('✅ Table clients créée ou déjà existante');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);
      CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
      CREATE INDEX IF NOT EXISTS idx_clients_metadata ON clients USING GIN(metadata);
      CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at);
    `);
    console.log('✅ Index créés');

    // Check if projects table exists (for foreign key)
    const projectsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      )
    `);
    
    if (!projectsCheck.rows[0].exists) {
      console.log('⚠️ Table projects n\'existe pas, création...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          client_id INTEGER REFERENCES clients(id),
          status VARCHAR(50) DEFAULT 'active',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP,
          created_by VARCHAR(255) DEFAULT 'system'
        )
      `);
      console.log('✅ Table projects créée');
    }

    // Insert some demo clients if table is empty
    const countResult = await pool.query('SELECT COUNT(*) FROM clients');
    if (countResult.rows[0].count === '0') {
      console.log('📝 Insertion de clients de démonstration...');
      
      const demoClients = [
        {
          nom: 'Arka Labs Demo',
          email: 'demo@arka-labs.com',
          metadata: {
            secteur: 'Technologie',
            taille: 'Startup',
            statut: 'actif',
            contact_principal: {
              nom: 'John Doe',
              email: 'demo@arka-labs.com',
              telephone: '+33 1 23 45 67 89',
              poste: 'CEO'
            },
            site_web: 'https://arka-labs.com',
            effectifs: 10
          }
        },
        {
          nom: 'Enterprise Corp',
          email: 'contact@enterprise.com',
          metadata: {
            secteur: 'Finance',
            taille: 'Grande entreprise',
            statut: 'actif',
            contact_principal: {
              nom: 'Jane Smith',
              email: 'contact@enterprise.com',
              telephone: '+33 1 98 76 54 32',
              poste: 'CTO'
            },
            site_web: 'https://enterprise.com',
            effectifs: 5000
          }
        }
      ];

      for (const client of demoClients) {
        await pool.query(
          'INSERT INTO clients (nom, email, metadata) VALUES ($1, $2, $3)',
          [client.nom, client.email, JSON.stringify(client.metadata)]
        );
      }
      
      console.log('✅ Clients de démonstration insérés');
    }

    // Display final status
    const finalCount = await pool.query('SELECT COUNT(*) FROM clients');
    console.log(`\n📊 Status final: ${finalCount.rows[0].count} clients dans la base`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initClientsTable().catch(console.error);