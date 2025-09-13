#!/usr/bin/env node
// Script de test complet pour les 42 routes B26 API Lite

const BASE_URL = 'http://localhost:3006';

// Toutes les 42 routes définies
const routes = [
  // Clients (4 routes)
  { method: 'GET', path: '/api/admin/clients', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/clients', body: {}, expected: [401, 400] },
  { method: 'PUT', path: '/api/admin/clients/12345', body: {}, expected: [401, 400] },
  { method: 'DELETE', path: '/api/admin/clients/12345', expected: [401, 400] },

  // Projets (4 routes)
  { method: 'GET', path: '/api/admin/projects', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/projects', body: {}, expected: [401, 400] },
  { method: 'PUT', path: '/api/admin/projects/12345', body: {}, expected: [401, 400] },
  { method: 'DELETE', path: '/api/admin/projects/12345', expected: [401, 400] },

  // Agents (4 routes)
  { method: 'GET', path: '/api/admin/agents', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/agents', body: {}, expected: [401, 400] },
  { method: 'PUT', path: '/api/admin/agents/12345', body: {}, expected: [401, 400] },
  { method: 'DELETE', path: '/api/admin/agents/12345', expected: [401, 400] },

  // Squads (4 routes)
  { method: 'GET', path: '/api/admin/squads', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/squads', body: {}, expected: [401, 400] },
  { method: 'PUT', path: '/api/admin/squads/12345', body: {}, expected: [401, 400] },
  { method: 'DELETE', path: '/api/admin/squads/12345', expected: [401, 400] },

  // Squad Members & Instructions (4 routes)
  { method: 'POST', path: '/api/admin/squads/12345/members', body: {}, expected: [401, 400] },
  { method: 'DELETE', path: '/api/admin/squads/12345/members/67890', expected: [401, 400] },
  { method: 'GET', path: '/api/admin/squads/12345/instructions', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/squads/12345/instructions', body: {}, expected: [401, 400] },

  // Templates Agents (3 routes)
  { method: 'GET', path: '/api/admin/agents/templates', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/agents/from-template', body: {}, expected: [401, 400] },
  { method: 'POST', path: '/api/admin/agents/12345/duplicate', body: {}, expected: [401, 400] },

  // Documents (4 routes)
  { method: 'GET', path: '/api/admin/documents', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/documents', body: {}, expected: [401, 400] },
  { method: 'GET', path: '/api/admin/documents/12345', expected: [401, 400] },
  { method: 'DELETE', path: '/api/admin/documents/12345', expected: [401, 400] },

  // Threads/Chat (4 routes)
  { method: 'GET', path: '/api/admin/threads', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/threads', body: {}, expected: [401, 400] },
  { method: 'GET', path: '/api/admin/threads/12345/messages', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/threads/12345/messages', body: {}, expected: [401, 400] },

  // Backoffice Admin (4 routes)
  { method: 'GET', path: '/api/admin/backoffice/stats', expected: [401, 400] },
  { method: 'GET', path: '/api/admin/backoffice/users', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/backoffice/settings', body: {}, expected: [401, 400] },
  { method: 'GET', path: '/api/admin/backoffice/logs', expected: [401, 400] },

  // Analytics & Exports & Maintenance (4 routes)
  { method: 'GET', path: '/api/admin/analytics/performance', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/integrations/webhooks', body: {}, expected: [401, 400] },
  { method: 'GET', path: '/api/admin/exports/data?type=clients', expected: [401, 400] },
  { method: 'POST', path: '/api/admin/maintenance/cleanup', body: { operation: 'cache' }, expected: [401, 400] },

  // Système (3 routes)
  { method: 'GET', path: '/api/health', expected: [200] },
  { method: 'GET', path: '/api/system/stats', expected: [200, 401] },
  { method: 'POST', path: '/api/system/cache/clear', body: {}, expected: [401, 400] }
];

async function testRoute(route) {
  const url = `${BASE_URL}${route.path}`;
  
  const options = {
    method: route.method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (route.body && (route.method === 'POST' || route.method === 'PUT')) {
    options.body = JSON.stringify(route.body);
  }

  try {
    const response = await fetch(url, options);
    const status = response.status;
    
    // Vérifier si le status est dans les codes attendus
    const isExpected = route.expected.includes(status);
    
    if (status >= 500) {
      return { 
        route: `${route.method} ${route.path}`, 
        status, 
        result: '❌ ERROR 500', 
        expected: route.expected.join('|'),
        success: false 
      };
    } else if (isExpected) {
      return { 
        route: `${route.method} ${route.path}`, 
        status, 
        result: '✅ OK', 
        expected: route.expected.join('|'),
        success: true 
      };
    } else {
      return { 
        route: `${route.method} ${route.path}`, 
        status, 
        result: '⚠️ UNEXPECTED', 
        expected: route.expected.join('|'),
        success: false 
      };
    }
  } catch (error) {
    return { 
      route: `${route.method} ${route.path}`, 
      status: 'ERR', 
      result: `❌ FETCH ERROR: ${error.message}`, 
      expected: route.expected.join('|'),
      success: false 
    };
  }
}

async function runTests() {
  console.log('🧪 Testing all 42 B26 API Lite routes...\n');
  
  const results = [];
  let success = 0;
  let total = routes.length;

  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);
    
    if (result.success) {
      success++;
    }
    
    const statusColor = result.result.includes('✅') ? '\\x1b[32m' : result.result.includes('❌') ? '\\x1b[31m' : '\\x1b[33m';
    console.log(`${statusColor}${result.result}\\x1b[0m ${result.route} (${result.status}) expected: ${result.expected}`);
  }

  console.log(`\n📊 Results Summary:`);
  console.log(`✅ Success: ${success}/${total} (${Math.round(success/total*100)}%)`);
  console.log(`❌ Failed: ${total - success}/${total}`);
  
  const errors = results.filter(r => !r.success);
  if (errors.length > 0) {
    console.log(`\n🚨 Failed Routes:`);
    errors.forEach(error => {
      console.log(`   ${error.route} → ${error.result} (${error.status})`);
    });
  }

  const error500s = results.filter(r => r.status >= 500);
  if (error500s.length === 0) {
    console.log(`\n🎉 ZERO 500 ERRORS - DEPLOYMENT READY!`);
  } else {
    console.log(`\n💥 Critical 500 errors: ${error500s.length}`);
    error500s.forEach(error => {
      console.log(`   ${error.route} → ${error.status}`);
    });
  }

  return {
    total,
    success,
    errors: total - success,
    error500s: error500s.length,
    ready: error500s.length === 0
  };
}

runTests().catch(console.error);