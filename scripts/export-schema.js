const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function exportSchema() {
  try {
    console.log('=== EXPORT SCHEMA DATABASE ARKA ===');

    // Get all tables
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    let schema = '-- ARKA LABS DATABASE SCHEMA\n';
    schema += '-- Generated: ' + new Date().toISOString() + '\n\n';

    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log('Exporting table:', tableName);

      // Get table structure
      const columns = await pool.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      schema += '-- Table: ' + tableName + '\n';
      schema += 'CREATE TABLE ' + tableName + ' (\n';

      const columnDefs = columns.rows.map(col => {
        let def = '  ' + col.column_name + ' ' + col.data_type;
        if (col.character_maximum_length) {
          def += '(' + col.character_maximum_length + ')';
        }
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        if (col.column_default) {
          def += ' DEFAULT ' + col.column_default;
        }
        return def;
      });

      schema += columnDefs.join(',\n');
      schema += '\n);\n\n';

      // Get constraints
      const constraints = await pool.query(`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = $1
      `, [tableName]);

      if (constraints.rows.length > 0) {
        schema += '-- Constraints for ' + tableName + '\n';
        for (const constraint of constraints.rows) {
          if (constraint.constraint_type === 'PRIMARY KEY') {
            schema += 'ALTER TABLE ' + tableName + ' ADD CONSTRAINT ' + constraint.constraint_name + ' PRIMARY KEY (' + constraint.column_name + ');\n';
          } else if (constraint.constraint_type === 'FOREIGN KEY') {
            schema += 'ALTER TABLE ' + tableName + ' ADD CONSTRAINT ' + constraint.constraint_name + ' FOREIGN KEY (' + constraint.column_name + ') REFERENCES ' + constraint.foreign_table_name + '(' + constraint.foreign_column_name + ');\n';
          }
        }
        schema += '\n';
      }

      // Get indexes
      const indexes = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1
        AND indexname NOT LIKE '%_pkey'
      `, [tableName]);

      if (indexes.rows.length > 0) {
        schema += '-- Indexes for ' + tableName + '\n';
        for (const index of indexes.rows) {
          schema += index.indexdef + ';\n';
        }
        schema += '\n';
      }
    }

    // Get views
    const views = await pool.query(`
      SELECT table_name, view_definition
      FROM information_schema.views
      WHERE table_schema = 'public'
    `);

    if (views.rows.length > 0) {
      schema += '-- VIEWS\n\n';
      for (const view of views.rows) {
        schema += '-- View: ' + view.table_name + '\n';
        schema += 'CREATE VIEW ' + view.table_name + ' AS ' + view.view_definition + ';\n\n';
      }
    }

    // Write to file
    fs.writeFileSync('db/schema_export.sql', schema);
    console.log('✅ Schema exported to db/schema_export.sql');

    // Also show summary
    console.log('\n=== SUMMARY ===');
    console.log('Tables:', tables.rows.length);
    console.log('Views:', views.rows.length);

    console.log('\nTables list:');
    tables.rows.forEach(t => console.log('- ' + t.table_name));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

exportSchema();