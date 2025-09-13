/**
 * ARKA API ROUTER - Script de test automatisé
 * 
 * Usage:
 * node scripts/test-api-router.js
 * node scripts/test-api-router.js --env=staging
 * node scripts/test-api-router.js --strategy=dynamic
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  strategy: process.argv.find(arg => arg.startsWith('--strategy='))?.split('=')[1] || 'query',
  env: process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'local',
  authToken: process.env.ARKA_AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFya2EtMjAyNS0wOSJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AYXJrYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJqdGkiOiJlNWJiYjJmYy02NTZiLTRhNDQtODM0NC1lNjFmZTE5NjFmZTYiLCJpYXQiOjE3NTc3NDkzNzMsImV4cCI6MTc1Nzc1NjU3M30.BPJW7GLsntdRr2zaodwysg6ZX3I4ysSk5fzUaesByes'
};

// Test client UUID (existe en base)
const TEST_CLIENT_ID = 'b35321bd-7ebd-4910-9dcc-f33e707d6417';

// Utilitaires
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(level, message) {
  const color = level === 'success' ? colors.green : 
                level === 'error' ? colors.red :
                level === 'warning' ? colors.yellow : colors.blue;
  console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.baseUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `arka_access_token=${CONFIG.authToken}`
      }
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Tests
async function testRouterDashboard() {
  log('info', 'Testing router dashboard...');
  
  try {
    const response = await makeRequest('GET', '/api/admin/router');
    
    if (response.status === 200 && response.data.success) {
      log('success', `Router dashboard OK - ${response.data.system.totalRoutes} routes`);
      log('info', `Current strategy: ${response.data.config.global.strategy}`);
      return true;
    } else {
      log('error', `Router dashboard failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    log('error', `Router dashboard error: ${error.message}`);
    return false;
  }
}

async function testStrategySwitch(strategy) {
  log('info', `Testing strategy switch to: ${strategy}`);
  
  try {
    const response = await makeRequest('POST', '/api/admin/router', {
      action: 'setGlobalStrategy',
      strategy
    });
    
    if (response.status === 200 && response.data.success) {
      log('success', `Strategy switched to: ${strategy}`);
      return true;
    } else {
      log('error', `Strategy switch failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    log('error', `Strategy switch error: ${error.message}`);
    return false;
  }
}

async function testClientsList() {
  log('info', 'Testing clients list...');
  
  try {
    const response = await makeRequest('GET', '/api/admin/clients');
    
    if (response.status === 200 && response.data.success) {
      log('success', `Clients list OK - ${response.data.items.length} clients`);
      log('info', `Strategy used: ${response.data._strategy || 'unknown'}`);
      return true;
    } else {
      log('error', `Clients list failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    log('error', `Clients list error: ${error.message}`);
    return false;
  }
}

async function testClientDetail(strategy) {
  log('info', `Testing client detail with ${strategy} strategy...`);
  
  try {
    let path;
    
    switch (strategy) {
      case 'query':
        path = `/api/admin/clients?id=${TEST_CLIENT_ID}`;
        break;
      case 'dynamic':
        path = `/api/admin/clients/${TEST_CLIENT_ID}`;
        break;
      default:
        path = `/api/admin/clients?id=${TEST_CLIENT_ID}`;
    }
    
    const response = await makeRequest('GET', path);
    
    if (response.status === 200 && response.data.id) {
      log('success', `Client detail OK - ${response.data.nom}`);
      log('info', `Strategy used: ${response.data._strategy || strategy}`);
      return true;
    } else {
      log('error', `Client detail failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log('error', `Client detail error: ${error.message}`);
    return false;
  }
}

async function testEmergencySwitch() {
  log('info', 'Testing emergency query switch...');
  
  try {
    const response = await makeRequest('PATCH', '/api/admin/router?action=emergency-query');
    
    if (response.status === 200 && response.data.success) {
      log('success', 'Emergency switch OK - All routes in query mode');
      return true;
    } else {
      log('error', `Emergency switch failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    log('error', `Emergency switch error: ${error.message}`);
    return false;
  }
}

// Test complet
async function runFullTest() {
  console.log('\\n🚀 ARKA API ROUTER - Test Suite');
  console.log('=====================================');
  console.log(`Environment: ${CONFIG.env}`);
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Strategy: ${CONFIG.strategy}`);
  console.log('');
  
  const results = {
    dashboard: false,
    strategySwitch: false,
    clientsList: false,
    clientDetail: false,
    emergencySwitch: false
  };
  
  // 1. Test dashboard
  results.dashboard = await testRouterDashboard();
  
  // 2. Test strategy switch
  if (results.dashboard) {
    results.strategySwitch = await testStrategySwitch(CONFIG.strategy);
  }
  
  // 3. Test clients list
  results.clientsList = await testClientsList();
  
  // 4. Test client detail
  results.clientDetail = await testClientDetail(CONFIG.strategy);
  
  // 5. Test emergency switch
  results.emergencySwitch = await testEmergencySwitch();
  
  // Results
  console.log('\\n📊 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(20)} ${status}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log('\\n🎯 Summary:');
  console.log(`${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    log('success', 'All tests passed! 🎉');
    process.exit(0);
  } else {
    log('error', 'Some tests failed! 😞');
    process.exit(1);
  }
}

// Gestion des arguments CLI
if (process.argv.includes('--help')) {
  console.log(`
🚀 ARKA API Router Test Suite

Usage:
  node scripts/test-api-router.js [options]

Options:
  --env=<env>         Environment (local, staging, prod)
  --strategy=<name>   Strategy to test (query, dynamic, hybrid)
  --help              Show this help

Examples:
  node scripts/test-api-router.js
  node scripts/test-api-router.js --env=staging --strategy=dynamic
  TEST_URL=https://arka-squad.app node scripts/test-api-router.js
  `);
  process.exit(0);
}

// Lancer les tests
runFullTest().catch(error => {
  log('error', `Test suite crashed: ${error.message}`);
  process.exit(1);
});