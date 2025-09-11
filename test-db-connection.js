const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({ 
    connectionString: 'postgresql://postgres:postgres@localhost:5433/postgres'
  });

  try {
    console.log('🔄 Testing database connection...');
    
    // Test simple query
    const result = await pool.query('SELECT COUNT(*) FROM clients');
    console.log('✅ Clients count:', result.rows[0].count);
    
    const result2 = await pool.query('SELECT COUNT(*) FROM projects');
    console.log('✅ Projects count:', result2.rows[0].count);
    
    console.log('🎉 Database connection works!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();