const sql = require('./lib/db.ts');

async function checkTables() {
  try {
    console.log('=== CHECKING DATABASE STRUCTURE ===');

    // List all tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('\n📋 Current Tables:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Check if specific tables exist
    const specificTables = ['clients', 'projects', 'squads', 'project_assignments'];
    console.log('\n🔍 Checking specific tables:');

    for (const tableName of specificTables) {
      const exists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        )
      `;
      console.log(`  ${exists[0].exists ? '✅' : '❌'} ${tableName}`);
    }

    // Check clients table structure if it exists
    try {
      const clientsColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'clients'
        ORDER BY ordinal_position
      `;

      if (clientsColumns.length > 0) {
        console.log('\n📊 Clients table structure:');
        clientsColumns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type})`);
        });
      }
    } catch (e) {
      console.log('\n❌ Clients table not accessible');
    }

    // Test a simple query
    try {
      const clientsCount = await sql`SELECT COUNT(*) as count FROM clients WHERE deleted_at IS NULL`;
      console.log(`\n📈 Active clients: ${clientsCount[0].count}`);
    } catch (e) {
      console.log(`\n❌ Error querying clients: ${e.message}`);
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTables();