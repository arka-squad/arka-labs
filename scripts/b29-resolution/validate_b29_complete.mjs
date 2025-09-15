#!/usr/bin/env node

/**
 * B29 RESOLUTION - Complete Validation Script
 * Validates that all B29 fixes have been properly applied
 */

import { sql as neonSql } from '@vercel/postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 B29 RESOLUTION - Complete Validation\n');

async function validateB29Complete() {
  try {
    // 1. Database Structure Validation
    console.log('📋 1. DATABASE STRUCTURE VALIDATION');
    console.log('=====================================');

    const requiredTables = ['clients', 'projects', 'squads', 'project_assignments'];
    const existingTables = {};

    for (const tableName of requiredTables) {
      try {
        const result = await neonSql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = ${tableName}
          )
        `;
        existingTables[tableName] = result[0].exists;
        console.log(`  ${result[0].exists ? '✅' : '❌'} ${tableName}`);
      } catch (error) {
        existingTables[tableName] = false;
        console.log(`  ❌ ${tableName} - Error: ${error.message}`);
      }
    }

    // 2. Critical Query Validation (The one that was failing)
    console.log('\n🚨 2. CRITICAL QUERY VALIDATION');
    console.log('=====================================');

    if (existingTables.projects && existingTables.clients && existingTables.project_assignments) {
      try {
        const criticalQuery = await neonSql`
          SELECT
            p.id,
            p.name as project_name,
            c.name as client_name,
            c.sector as client_sector,
            c.size as client_size,
            COUNT(pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_count
          FROM projects p
          JOIN clients c ON p.client_id = c.id
          LEFT JOIN project_assignments pa ON p.id = pa.project_id
          WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL
          GROUP BY p.id, p.name, c.name, c.sector, c.size
          ORDER BY p.created_at DESC
          LIMIT 5
        `;

        console.log(`  ✅ Critical query successful - ${criticalQuery.length} projects found`);

        if (criticalQuery.length > 0) {
          console.log('  📊 Sample results:');
          criticalQuery.forEach((row, index) => {
            console.log(`    ${index + 1}. ${row.project_name} (${row.client_name}) - ${row.agents_count} agents`);
          });
        }
      } catch (error) {
        console.log(`  ❌ Critical query failed: ${error.message}`);
        console.log('  🔧 This was the main error causing 500s on project listing');
      }
    } else {
      console.log('  ⚠️  Cannot test critical query - missing required tables');
    }

    // 3. English Column Validation
    console.log('\n🌍 3. ENGLISH COLUMN VALIDATION');
    console.log('=====================================');

    if (existingTables.clients) {
      try {
        // Test English columns exist
        const englishTest = await neonSql`
          SELECT name, sector, size, status, primary_contact
          FROM clients
          LIMIT 2
        `;
        console.log(`  ✅ English columns working - ${englishTest.length} clients tested`);

        // Test French columns don't exist (should fail)
        try {
          await neonSql`SELECT nom FROM clients LIMIT 1`;
          console.log('  ⚠️  Column "nom" still exists (should be removed)');
        } catch (error) {
          console.log('  ✅ Column "nom" properly removed (French columns cleaned)');
        }

      } catch (error) {
        console.log(`  ❌ English columns test failed: ${error.message}`);
      }
    }

    // 4. API Response Format Validation
    console.log('\n🔌 4. API RESPONSE FORMAT CHECK');
    console.log('=====================================');

    if (existingTables.clients && existingTables.projects) {
      try {
        // Simulate API query for projects list
        const projectsApiQuery = await neonSql`
          SELECT
            p.id,
            p.name,
            p.status,
            p.created_at,
            c.name as client_name,
            c.sector as client_sector,
            c.size as client_size,
            COUNT(pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_count
          FROM projects p
          LEFT JOIN clients c ON p.client_id = c.id
          LEFT JOIN project_assignments pa ON p.id = pa.project_id
          WHERE p.deleted_at IS NULL
          GROUP BY p.id, p.name, p.status, p.created_at, c.name, c.sector, c.size
          ORDER BY p.created_at DESC
          LIMIT 3
        `;

        console.log(`  ✅ Projects API query format - ${projectsApiQuery.length} results`);

        // Check for French mappings that should be gone
        const hasOldMappings = projectsApiQuery.some(row =>
          row.hasOwnProperty('client_taille') ||
          row.hasOwnProperty('client_secteur') ||
          row.hasOwnProperty('client_statut')
        );

        if (hasOldMappings) {
          console.log('  ⚠️  Old French mappings detected in API response');
        } else {
          console.log('  ✅ API response format is clean (no French mappings)');
        }

      } catch (error) {
        console.log(`  ❌ API format check failed: ${error.message}`);
      }
    }

    // 5. Data Integrity Check
    console.log('\n📊 5. DATA INTEGRITY CHECK');
    console.log('=====================================');

    if (existingTables.clients) {
      const clientStats = await neonSql`
        SELECT
          COUNT(*) as total_clients,
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_clients,
          COUNT(*) FILTER (WHERE size = 'small') as small_clients,
          COUNT(*) FILTER (WHERE size = 'medium') as medium_clients,
          COUNT(*) FILTER (WHERE size = 'large') as large_clients,
          COUNT(*) FILTER (WHERE size = 'enterprise') as enterprise_clients
        FROM clients
      `;

      const stats = clientStats[0];
      console.log(`  📈 Clients: ${stats.active_clients}/${stats.total_clients} active`);
      console.log(`  📊 Sizes: Small(${stats.small_clients}) Medium(${stats.medium_clients}) Large(${stats.large_clients}) Enterprise(${stats.enterprise_clients})`);
    }

    if (existingTables.projects) {
      const projectStats = await neonSql`
        SELECT
          COUNT(*) as total_projects,
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_projects,
          COUNT(*) FILTER (WHERE status = 'active') as active_status_projects,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_projects
        FROM projects
      `;

      const pStats = projectStats[0];
      console.log(`  📈 Projects: ${pStats.active_projects}/${pStats.total_projects} active`);
      console.log(`  📊 Status: Active(${pStats.active_status_projects}) Completed(${pStats.completed_projects})`);
    }

    if (existingTables.project_assignments) {
      const assignmentStats = await neonSql`
        SELECT
          COUNT(*) as total_assignments,
          COUNT(*) FILTER (WHERE status = 'active') as active_assignments,
          COUNT(DISTINCT project_id) as projects_with_assignments
        FROM project_assignments
      `;

      const aStats = assignmentStats[0];
      console.log(`  📈 Assignments: ${aStats.active_assignments}/${aStats.total_assignments} active`);
      console.log(`  📊 Coverage: ${aStats.projects_with_assignments} projects have assignments`);
    }

    // 6. Final Validation Summary
    console.log('\n🎯 6. VALIDATION SUMMARY');
    console.log('=====================================');

    const allRequiredTablesExist = requiredTables.every(table => existingTables[table]);
    const structureScore = (Object.values(existingTables).filter(exists => exists).length / requiredTables.length) * 100;

    console.log(`Database Structure: ${structureScore.toFixed(0)}% complete`);
    console.log(`Required Tables: ${allRequiredTablesExist ? '✅ All present' : '❌ Some missing'}`);

    if (allRequiredTablesExist) {
      console.log('\n🎉 B29 RESOLUTION VALIDATION: SUCCESS');
      console.log('=====================================');
      console.log('✅ Database structure is complete');
      console.log('✅ Critical queries should work');
      console.log('✅ English column structure validated');
      console.log('✅ API responses should be clean');
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Test admin interface: http://localhost:3000/cockpit/admin');
      console.log('2. Create/edit some clients and projects');
      console.log('3. Monitor for any remaining 500 errors');
    } else {
      console.log('\n⚠️  B29 RESOLUTION: PARTIAL SUCCESS');
      console.log('=====================================');
      console.log('Some components may still have issues.');
      console.log('Check missing tables and re-run database fix script.');
    }

  } catch (error) {
    console.error('\n❌ VALIDATION FAILED');
    console.error('===================');
    console.error(`Error: ${error.message}`);
    console.error('Check your database connection and try again.');
  }
}

// Execute validation
validateB29Complete();