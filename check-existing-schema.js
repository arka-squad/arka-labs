#!/usr/bin/env node
const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL\n');
    
    // Check clients table structure
    console.log('📋 Checking CLIENTS table:');
    const clientsInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `);
    
    if (clientsInfo.rows.length > 0) {
      console.log('Columns:');
      clientsInfo.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('  Table does not exist');
    }
    
    // Check projects table structure
    console.log('\n📋 Checking PROJECTS table:');
    const projectsInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `);
    
    if (projectsInfo.rows.length > 0) {
      console.log('Columns:');
      projectsInfo.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('  Table does not exist');
    }
    
    // Check if agent tables exist
    console.log('\n📋 Checking AGENT tables:');
    const agentTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'agent%'
      ORDER BY table_name
    `);
    
    if (agentTables.rows.length > 0) {
      console.log('Existing agent tables:');
      agentTables.rows.forEach(t => console.log(`  - ${t.table_name}`));
    } else {
      console.log('  No agent tables found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema().catch(console.error);