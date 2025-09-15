import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

async function introspectDatabase() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const report = {
    timestamp: new Date().toISOString(),
    tables: {} as Record<string, ColumnInfo[]>
  };

  // Tables à inspecter
  const tables = ['clients', 'projects', 'squads'];

  for (const table of tables) {
    // Vérifier si la table existe
    const exists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = $1
      )
    `, [table]);

    if (exists.rows[0].exists) {
      const columns = await client.query<ColumnInfo>(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      report.tables[table] = columns.rows;
      console.log(`✅ Table ${table}: ${columns.rows.length} colonnes`);
    } else {
      console.log(`❌ Table ${table}: n'existe pas`);
      report.tables[table] = [];
    }
  }

  await client.end();

  // Sauvegarder le rapport
  const reportPath = path.join('logs', 'b29-introspection.json');
  await fs.mkdir('logs', { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log('✅ Introspection complète sauvegardée dans:', reportPath);
  return report;
}

introspectDatabase().catch(console.error);