// Test final interface functionality
const https = require('http');

async function testInterface() {
  console.log('🧪 Testing interface endpoints after all fixes...');

  const tests = [
    {
      name: 'Projects Listing',
      url: '/api/admin/projects',
      expect: 'success'
    },
    {
      name: 'Project Detail',
      url: '/api/admin/projects/5f735f2a-0a02-46bb-8102-e5586a8824cb',
      expect: 'success'
    },
    {
      name: 'Clients Listing',
      url: '/api/admin/clients',
      expect: 'success'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n📋 Testing ${test.name}...`);

      const result = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'localhost',
          port: 3001,
          path: test.url,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer dev-token-admin',
            'Accept': 'application/json'
          }
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              data: data.substring(0, 200)
            });
          });
        });

        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Timeout')));
        req.end();
      });

      if (result.status === 200) {
        console.log(`   ✅ ${test.name}: HTTP ${result.status} - SUCCESS`);
      } else if (result.status === 401) {
        console.log(`   ⚠️  ${test.name}: HTTP ${result.status} - AUTH (normal)`);
      } else {
        console.log(`   ❌ ${test.name}: HTTP ${result.status} - ERROR`);
        console.log(`   Response: ${result.data}`);
      }

    } catch (error) {
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
  }

  console.log('\n🎯 INTERFACE TESTS COMPLETE');
  console.log('\n📱 Manual test URLs:');
  console.log('   - Projects: http://localhost:3001/cockpit/admin/projects');
  console.log('   - Clients:  http://localhost:3001/cockpit/admin/clients');
  console.log('   - Squads:   http://localhost:3001/cockpit/admin/squads');
}

testInterface();