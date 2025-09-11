const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/postgres',
  max: 1
});

async function setupAuthTables() {
  console.log('Setting up B24 authentication tables...');
  
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMPTZ,
        failed_login_attempts INT DEFAULT 0,
        locked_until TIMESTAMPTZ,
        metadata JSONB DEFAULT '{}'::jsonb
      )
    `);
    console.log('✓ Users table created');

    // Create indexes on users
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    `);
    console.log('✓ Users indexes created');

    // Create revoked_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        id SERIAL PRIMARY KEY,
        jti VARCHAR(255) UNIQUE NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        revoked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMPTZ NOT NULL,
        reason VARCHAR(255)
      )
    `);
    console.log('✓ Revoked tokens table created');

    // Create index on revoked_tokens
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_revoked_tokens_jti ON revoked_tokens(jti);
      CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);
    `);
    console.log('✓ Revoked tokens indexes created');

    // Check if projects table exists first
    const projectsExist = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      )
    `);
    
    if (projectsExist.rows[0].exists) {
      // Create user_project_assignments table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_project_assignments (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          project_id INT REFERENCES projects(id) ON DELETE CASCADE,
          assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          assigned_by INT REFERENCES users(id),
          UNIQUE(user_id, project_id)
        )
      `);
      console.log('✓ User project assignments table created');
    } else {
      console.log('⚠ Skipping user_project_assignments table (projects table does not exist)');
    }

    // Create auth_audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        trace_id VARCHAR(255),
        user_id INT,
        user_email_hash VARCHAR(64),
        ip_hash VARCHAR(64),
        action VARCHAR(100),
        resource VARCHAR(255),
        method VARCHAR(10),
        status_code INT,
        response_time_ms INT,
        error_message TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      )
    `);
    console.log('✓ Auth audit logs table created');

    // Create indexes on auth_audit_logs
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_timestamp ON auth_audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_trace_id ON auth_audit_logs(trace_id);
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_action ON auth_audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_status_code ON auth_audit_logs(status_code);
    `);
    console.log('✓ Auth audit logs indexes created');

    // Insert demo users
    const demoPassword = await bcrypt.hash('demo123', 10);
    
    const users = [
      { email: 'admin@arka.com', role: 'admin', name: 'Admin User' },
      { email: 'manager@arka.com', role: 'manager', name: 'Manager User' },
      { email: 'operator@arka.com', role: 'operator', name: 'Operator User' },
      { email: 'viewer@arka.com', role: 'viewer', name: 'Viewer User' }
    ];

    for (const user of users) {
      await pool.query(`
        INSERT INTO users (email, password_hash, role, full_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) 
        DO UPDATE SET 
          password_hash = $2,
          role = $3,
          full_name = $4,
          updated_at = CURRENT_TIMESTAMP
      `, [user.email, demoPassword, user.role, user.name]);
      console.log(`✓ Created/updated demo user: ${user.email}`);
    }

    console.log('\n✅ B24 authentication tables setup complete!');
    console.log('\nDemo accounts created:');
    console.log('  admin@arka.com / demo123');
    console.log('  manager@arka.com / demo123');
    console.log('  operator@arka.com / demo123');
    console.log('  viewer@arka.com / demo123');

  } catch (error) {
    console.error('Error setting up auth tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupAuthTables();