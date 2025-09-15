const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function checkSquadMembersStructure() {
  try {
    console.log('=== CHECKING squad_members table structure ===\n');

    // Check if table exists and get its columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'squad_members'
      ORDER BY ordinal_position
    `;

    console.log('Columns in squad_members table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    });

    // Check if there are any specializations-related columns
    const specializationColumns = columns.filter(col =>
      col.column_name.includes('special') ||
      col.column_name.includes('skill') ||
      col.column_name.includes('competence')
    );

    console.log('\nSpecialization-related columns:');
    if (specializationColumns.length === 0) {
      console.log('  ❌ No specialization columns found');
    } else {
      specializationColumns.forEach(col => {
        console.log(`  ✅ ${col.column_name}`);
      });
    }

    // Sample data to understand the structure
    const sampleData = await sql`
      SELECT * FROM squad_members LIMIT 2
    `;

    console.log('\nSample data:');
    console.log(JSON.stringify(sampleData, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkSquadMembersStructure();