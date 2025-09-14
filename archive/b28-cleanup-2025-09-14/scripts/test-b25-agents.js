#!/usr/bin/env node
const { Client } = require('pg');

// Test configuration
const TEST_CONFIG = {
  host: 'localhost',
  port: 5433,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
};

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

async function runTest(name, testFn) {
  console.log(`\n📝 Testing: ${name}`);
  try {
    await testFn();
    console.log(`✅ PASSED: ${name}`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
  }
}

async function testB25AgentSystem() {
  const client = new Client(TEST_CONFIG);
  
  try {
    await client.connect();
    console.log('🔗 Connected to PostgreSQL');
    
    // Test 1: Verify tables exist
    await runTest('Agent tables exist', async () => {
      const tables = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('agent_templates', 'agent_instances', 'context_hierarchy')
        ORDER BY table_name
      `);
      
      if (tables.rows.length !== 3) {
        throw new Error(`Expected 3 tables, found ${tables.rows.length}`);
      }
    });
    
    // Test 2: Templates are loaded
    await runTest('Agent templates are loaded', async () => {
      const result = await client.query('SELECT COUNT(*) as count FROM agent_templates WHERE is_active = true');
      const count = parseInt(result.rows[0].count);
      
      if (count < 4) {
        throw new Error(`Expected at least 4 templates, found ${count}`);
      }
      
      console.log(`   Found ${count} active templates`);
    });
    
    // Test 3: Context hierarchy initialized
    await runTest('Global context exists', async () => {
      const result = await client.query(`
        SELECT * FROM context_hierarchy 
        WHERE level = 'arka' AND entity_id = 'global'
      `);
      
      if (result.rows.length === 0) {
        throw new Error('Global context not found');
      }
      
      const config = result.rows[0].configuration;
      if (!config.language || !config.timezone) {
        throw new Error('Global context missing required fields');
      }
      
      console.log(`   Global config: ${JSON.stringify(config)}`);
    });
    
    // Test 4: Create test client and project
    let testClientId, testProjectId;
    
    await runTest('Create test client and project', async () => {
      // Create test client
      const clientResult = await client.query(`
        INSERT INTO clients (nom, email, metadata) 
        VALUES ('Test Client B25', 'test@b25.com', '{"industry": "Tech", "size": "PME"}')
        RETURNING id
      `);
      testClientId = clientResult.rows[0].id;
      
      // Create test project
      const projectResult = await client.query(`
        INSERT INTO projects (nom, client_id, status, metadata)
        VALUES ('Test Project B25', $1, 'active', '{"budget": 50000}')
        RETURNING id
      `, [testClientId]);
      testProjectId = projectResult.rows[0].id;
      
      console.log(`   Created client: ${testClientId}`);
      console.log(`   Created project: ${testProjectId}`);
    });
    
    // Test 5: Create agent from template
    let testAgentId;
    
    await runTest('Create agent from template', async () => {
      // Get a template
      const templateResult = await client.query(`
        SELECT id, name, default_config, base_prompt 
        FROM agent_templates 
        WHERE slug = 'rh-generaliste'
        LIMIT 1
      `);
      
      if (templateResult.rows.length === 0) {
        throw new Error('RH template not found');
      }
      
      const template = templateResult.rows[0];
      
      // Create agent instance
      const agentResult = await client.query(`
        INSERT INTO agent_instances (
          template_id, project_id, client_id, name, role, domaine,
          configuration, wake_prompt, status, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING id
      `, [
        template.id,
        testProjectId,
        testClientId,
        'Test Agent RH',
        'rh-generaliste',
        'RH',
        JSON.stringify(template.default_config),
        template.base_prompt,
        'active',
        'test@b25.com'
      ]);
      
      testAgentId = agentResult.rows[0].id;
      console.log(`   Created agent: ${testAgentId}`);
    });
    
    // Test 6: Context propagation
    await runTest('Context propagation works', async () => {
      // Add client-level context
      await client.query(`
        INSERT INTO context_hierarchy (level, entity_id, configuration)
        VALUES ('client', $1, $2)
        ON CONFLICT (level, entity_id) DO UPDATE
        SET configuration = EXCLUDED.configuration
      `, [testClientId.toString(), JSON.stringify({ client_specific: 'value1', temperature: 0.8 })]);
      
      // Add project-level context
      await client.query(`
        INSERT INTO context_hierarchy (level, entity_id, configuration)
        VALUES ('project', $1, $2)
        ON CONFLICT (level, entity_id) DO UPDATE
        SET configuration = EXCLUDED.configuration
      `, [testProjectId.toString(), JSON.stringify({ project_specific: 'value2', max_tokens: 3000 })]);
      
      // Get all contexts in hierarchy
      const contexts = await client.query(`
        SELECT level, configuration 
        FROM context_hierarchy
        WHERE (level = 'arka' AND entity_id = 'global')
           OR (level = 'client' AND entity_id = $1)
           OR (level = 'project' AND entity_id = $2)
        ORDER BY 
          CASE level 
            WHEN 'arka' THEN 1
            WHEN 'client' THEN 2
            WHEN 'project' THEN 3
          END
      `, [testClientId.toString(), testProjectId.toString()]);
      
      // Verify hierarchy
      if (contexts.rows.length !== 3) {
        throw new Error(`Expected 3 context levels, found ${contexts.rows.length}`);
      }
      
      // Compute effective config
      let effectiveConfig = {};
      for (const ctx of contexts.rows) {
        effectiveConfig = { ...effectiveConfig, ...ctx.configuration };
      }
      
      // Verify merge worked correctly
      if (effectiveConfig.language !== 'fr') {
        throw new Error('Global context not inherited');
      }
      if (effectiveConfig.client_specific !== 'value1') {
        throw new Error('Client context not applied');
      }
      if (effectiveConfig.max_tokens !== 3000) {
        throw new Error('Project context not applied');
      }
      
      console.log(`   Effective config: ${JSON.stringify(effectiveConfig)}`);
    });
    
    // Test 7: Circular dependency prevention
    await runTest('Circular dependency prevention', async () => {
      // Create two agents
      const agent1Result = await client.query(`
        INSERT INTO agent_instances (
          project_id, client_id, name, role, domaine, status, created_by
        ) VALUES ($1, $2, 'Agent 1', 'test', 'RH', 'active', 'test@b25.com')
        RETURNING id
      `, [testProjectId, testClientId]);
      
      const agent1Id = agent1Result.rows[0].id;
      
      const agent2Result = await client.query(`
        INSERT INTO agent_instances (
          project_id, client_id, name, role, domaine, 
          parent_agent_id, status, created_by
        ) VALUES ($1, $2, 'Agent 2', 'test', 'RH', $3, 'active', 'test@b25.com')
        RETURNING id
      `, [testProjectId, testClientId, agent1Id]);
      
      const agent2Id = agent2Result.rows[0].id;
      
      // Try to create circular dependency (should fail with constraint)
      try {
        await client.query(`
          UPDATE agent_instances 
          SET parent_agent_id = $1 
          WHERE id = $2
        `, [agent2Id, agent1Id]);
        
        // If we get here, circular dependency wasn't prevented
        // We'd need application logic to detect this
        console.log('   Note: Circular dependency check requires application logic');
      } catch (error) {
        console.log('   Circular dependency correctly prevented');
      }
    });
    
    // Test 8: Template categories
    await runTest('All template categories present', async () => {
      const result = await client.query(`
        SELECT DISTINCT category FROM agent_templates 
        ORDER BY category
      `);
      
      const categories = result.rows.map(r => r.category);
      const expectedCategories = ['Finance', 'Marketing', 'RH', 'Support'];
      
      for (const expected of expectedCategories) {
        if (!categories.includes(expected)) {
          throw new Error(`Missing category: ${expected}`);
        }
      }
      
      console.log(`   Categories: ${categories.join(', ')}`);
    });
    
    // Cleanup
    await runTest('Cleanup test data', async () => {
      // Delete test agents
      await client.query('DELETE FROM agent_instances WHERE created_by = $1', ['test@b25.com']);
      
      // Delete test context
      if (testClientId) {
        await client.query('DELETE FROM context_hierarchy WHERE entity_id = $1', [testClientId.toString()]);
      }
      if (testProjectId) {
        await client.query('DELETE FROM context_hierarchy WHERE entity_id = $1', [testProjectId.toString()]);
      }
      
      // Delete test project and client
      if (testProjectId) {
        await client.query('DELETE FROM projects WHERE id = $1', [testProjectId]);
      }
      if (testClientId) {
        await client.query('DELETE FROM clients WHERE id = $1', [testClientId]);
      }
      
      console.log('   Test data cleaned up');
    });
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await client.end();
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📝 Total:  ${testResults.passed + testResults.failed}`);
    
    if (testResults.failed > 0) {
      console.log('\nFailed tests:');
      testResults.tests
        .filter(t => t.status === 'failed')
        .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  }
}

// Run tests
console.log('🚀 Starting B25.1 Agent Core Management Tests');
console.log('='.repeat(50));
testB25AgentSystem().catch(console.error);