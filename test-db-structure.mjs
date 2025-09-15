import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkDatabaseStructure() {
  try {
    console.log('=== B29 MIGRATION DIAGNOSTIC ===\n');

    // 1. List all tables
    console.log('📋 Current Database Tables:');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    tables.forEach(t => console.log(`  ✓ ${t.table_name}`));
    console.log(`\nTotal tables: ${tables.length}\n`);

    // 2. Check key expected tables
    const expectedTables = ['clients', 'projects', 'squads', 'project_assignments'];
    console.log('🔍 Key Tables Status:');

    const tableExists = {};
    for (const table of expectedTables) {
      const exists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        )
      `;
      tableExists[table] = exists[0].exists;
      console.log(`  ${exists[0].exists ? '✅' : '❌'} ${table}`);
    }

    // 3. Check clients table structure
    if (tableExists.clients) {
      console.log('\n📊 CLIENTS Table Structure:');
      const clientColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'clients'
        ORDER BY ordinal_position
      `;

      clientColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });

      // Test query with old vs new columns
      console.log('\n🧪 Testing Column Compatibility:');

      try {
        await sql`SELECT name FROM clients LIMIT 1`;
        console.log('  ✅ Column "name" exists (English)');
      } catch (e) {
        console.log('  ❌ Column "name" missing');
      }

      try {
        await sql`SELECT nom FROM clients LIMIT 1`;
        console.log('  ⚠️  Column "nom" still exists (French - should be removed)');
      } catch (e) {
        console.log('  ✅ Column "nom" properly removed (French)');
      }

      // Count clients
      const clientCount = await sql`SELECT COUNT(*) as count FROM clients WHERE deleted_at IS NULL`;
      console.log(`\n📈 Active clients in database: ${clientCount[0].count}`);
    }

    // 4. Check projects table structure
    if (tableExists.projects) {
      console.log('\n📊 PROJECTS Table Structure:');
      const projectColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'projects'
        ORDER BY ordinal_position
      `;

      projectColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });

      const projectCount = await sql`SELECT COUNT(*) as count FROM projects WHERE deleted_at IS NULL`;
      console.log(`\n📈 Active projects in database: ${projectCount[0].count}`);
    }

    // 5. Test the problematic query
    if (tableExists.project_assignments) {
      console.log('\n⚠️  PROJECT_ASSIGNMENTS table still exists - this might cause issues');
      try {
        const paCount = await sql`SELECT COUNT(*) FROM project_assignments`;
        console.log(`  Records in project_assignments: ${paCount[0].count}`);
      } catch (e) {
        console.log(`  Error querying project_assignments: ${e.message}`);
      }
    }

    // 6. Test a typical API query that's failing
    console.log('\n🔬 Testing Typical API Queries:');

    try {
      const testQuery = await sql`
        SELECT
          p.id,
          p.name,
          p.status,
          c.name as client_name,
          c.sector as client_sector
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        WHERE p.deleted_at IS NULL
        LIMIT 3
      `;
      console.log(`  ✅ Basic projects query successful (${testQuery.length} results)`);
      if (testQuery.length > 0) {
        console.log(`  Sample: ${testQuery[0].name} for ${testQuery[0].client_name}`);
      }
    } catch (e) {
      console.log(`  ❌ Basic projects query failed: ${e.message}`);
    }

    // Try the problematic query with project_assignments
    if (tableExists.project_assignments) {
      try {
        const problemQuery = await sql`
          SELECT p.id, p.name
          FROM projects p
          LEFT JOIN project_assignments pa ON p.id = pa.project_id
          LIMIT 1
        `;
        console.log('  ✅ Project assignments join works');
      } catch (e) {
        console.log(`  ❌ Project assignments join failed: ${e.message}`);
      }
    }

    console.log('\n=== DIAGNOSTIC COMPLETE ===');

  } catch (error) {
    console.error('❌ Database diagnostic failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sql.end();
  }
}

checkDatabaseStructure();