#!/usr/bin/env node
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

// Test database connection
async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful on port 5433');
    
    // Check if users table exists
    const usersCheck = await client.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    
    if (usersCheck.rows[0].count === '0') {
      console.log('⚠️ Users table does not exist, creating...');
      
      // Create users table for B24 auth
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      
      // Insert demo users (password: demo123)
      // Using bcrypt hash for 'demo123'
      const demoPasswordHash = '$2a$10$X7mMxIhu.x8n5ktTp0WlFu5lKj0SMxd1P5T1H/Tz9jW4k7OyFlCFK';
      
      await client.query(`
        INSERT INTO users (email, password_hash, role) VALUES
        ('admin@arka.com', $1, 'admin'),
        ('manager@arka.com', $1, 'manager'),
        ('operator@arka.com', $1, 'operator'),
        ('viewer@arka.com', $1, 'viewer')
        ON CONFLICT (email) DO NOTHING
      `, [demoPasswordHash]);
      
      console.log('✅ Users table created with demo users');
    } else {
      console.log('✅ Users table exists');
      
      // List existing users
      const users = await client.query(`
        SELECT email, role FROM users ORDER BY role, email
      `);
      
      console.log('\nExisting users:');
      users.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
    }
    
    // Test JWT creation
    console.log('\n📝 Testing JWT token creation...');
    const secret = process.env.JWT_SECRET || 'arka-secret-key-2025-change-in-production';
    
    const testPayload = {
      sub: '1',
      email: 'admin@arka.com',
      role: 'admin',
      jti: 'test-jti-' + Date.now()
    };
    
    const token = jwt.sign(testPayload, secret, { expiresIn: '2h' });
    console.log('✅ JWT token created successfully');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, secret);
      console.log('✅ Token verification successful');
      console.log('Decoded payload:', decoded);
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Details:', error);
  } finally {
    await client.end();
  }
}

console.log('🔍 Testing Database & Auth Configuration\n');
console.log('Database config:');
console.log('  Host: localhost');
console.log('  Port: 5433');
console.log('  Database: postgres');
console.log('  User: postgres\n');

testConnection().catch(console.error);