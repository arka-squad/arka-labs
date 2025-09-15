// Test simple sans dépendances externes
const { execSync } = require('child_process');

console.log('=== TESTING SQUAD SCHEMA COLUMNS ===\n');

// Test si les colonnes existent avec une requête simple
const dbUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NgHpnVad4xP9@ep-tiny-king-a292mq2e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const tests = [
  {
    name: "Test squads.slug column",
    query: "SELECT slug FROM squads LIMIT 1",
    pattern: "column.*slug.*does not exist"
  },
  {
    name: "Test project_squads.attached_at column",
    query: "SELECT attached_at FROM project_squads LIMIT 1",
    pattern: "column.*attached_at.*does not exist"
  },
  {
    name: "Test squad_members.specializations column",
    query: "SELECT specializations FROM squad_members LIMIT 1",
    pattern: "column.*specializations.*does not exist"
  }
];

for (const test of tests) {
  try {
    console.log(`Testing: ${test.name}`);
    const cmd = `echo "${test.query}" | psql "${dbUrl}"`;
    const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ PASS - Column exists`);
  } catch (error) {
    const stderr = error.stderr || error.message;
    if (stderr.includes('does not exist')) {
      console.log(`❌ FAIL - Column missing: ${stderr.split('\n')[0]}`);
    } else {
      console.log(`⚠️  OTHER ERROR: ${stderr.split('\n')[0]}`);
    }
  }
  console.log('');
}