const { Pool } = require('pg');

// Configuration Neon depuis les variables d'environnement
const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function initDatabase() {
  const pool = new Pool({ connectionString });
  
  console.log('🚀 Initialisation de la base de données Neon...\n');

  try {
    // 1. Créer la table users pour l'authentification
    console.log('📝 Création table users...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP
      )
    `);
    
    // Index pour performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    // 2. Créer la table clients
    console.log('📝 Création table clients...');
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
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);
      CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
      CREATE INDEX IF NOT EXISTS idx_clients_metadata ON clients USING GIN(metadata);
      CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at);
    `);

    // 3. Créer la table projects
    console.log('📝 Création table projects...');
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
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    `);

    // 4. Créer la table auth_audit_logs
    console.log('📝 Création table auth_audit_logs...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        trace_id VARCHAR(255),
        user_id INTEGER,
        user_email_hash VARCHAR(255),
        ip_hash VARCHAR(255),
        action VARCHAR(100),
        resource VARCHAR(255),
        method VARCHAR(20),
        status_code INTEGER,
        response_time_ms INTEGER,
        error_message TEXT,
        metadata JSONB
      )
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON auth_audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON auth_audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON auth_audit_logs(action);
    `);

    // 5. Créer la table revoked_tokens
    console.log('📝 Création table revoked_tokens...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        jti VARCHAR(255) PRIMARY KEY,
        user_id INTEGER,
        expires_at TIMESTAMP,
        revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reason VARCHAR(255)
      )
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_revoked_expires ON revoked_tokens(expires_at);
    `);

    // 6. Créer la table user_project_assignments
    console.log('📝 Création table user_project_assignments...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_project_assignments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        project_id INTEGER REFERENCES projects(id),
        role VARCHAR(50),
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Insérer les utilisateurs de demo
    console.log('👤 Création des utilisateurs de démo...');
    
    // Hash pour 'demo123' (bcrypt)
    const demoPasswordHash = '$2a$10$.5.ZhFr8IBsrKBjOL.6HDu6PSfNYQgK4WMBtj/2yzd6s9a8RMbFxW';
    
    const demoUsers = [
      { email: 'admin@arka.com', role: 'admin', full_name: 'Admin User' },
      { email: 'manager@arka.com', role: 'manager', full_name: 'Manager User' },
      { email: 'operator@arka.com', role: 'operator', full_name: 'Operator User' },
      { email: 'viewer@arka.com', role: 'viewer', full_name: 'Viewer User' }
    ];

    for (const user of demoUsers) {
      await pool.query(`
        INSERT INTO users (email, password_hash, role, full_name, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (email) DO UPDATE
        SET role = $3, full_name = $4
      `, [user.email, demoPasswordHash, user.role, user.full_name]);
    }
    
    console.log('✅ Utilisateurs de démo créés (mot de passe: demo123)');

    // 8. Insérer quelques clients de demo
    console.log('🏢 Création de clients de démo...');
    
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
      // Vérifier si le client existe déjà
      const existing = await pool.query(
        'SELECT id FROM clients WHERE nom = $1',
        [client.nom]
      );
      
      if (existing.rows.length === 0) {
        await pool.query(`
          INSERT INTO clients (nom, email, metadata)
          VALUES ($1, $2, $3)
        `, [client.nom, client.email, JSON.stringify(client.metadata)]);
      }
    }
    
    console.log('✅ Clients de démo créés');

    // 9. Vérifier l'état final
    console.log('\n📊 État de la base de données :');
    
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`  - ${userCount.rows[0].count} utilisateurs`);
    
    const clientCount = await pool.query('SELECT COUNT(*) FROM clients');
    console.log(`  - ${clientCount.rows[0].count} clients`);
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables créées :');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n✅ Base de données Neon initialisée avec succès !');
    console.log('\n🔐 Connexion :');
    console.log('  Email: admin@arka.com');
    console.log('  Mot de passe: demo123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter l'initialisation
console.log('🔗 Connexion à Neon...');
console.log(`   Host: ${connectionString.match(/(@[^/]+)/)?.[1]?.slice(1) || 'unknown'}\n`);

initDatabase().catch(console.error);