#!/usr/bin/env node

// Script temporaire pour créer un token admin pour les tests
function createAdminToken() {
  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ 
    role: 'admin',
    username: 'admin-test',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
  })).toString('base64url');
  
  const token = `${header}.${payload}.signature`;
  
  console.log('Token admin temporaire:');
  console.log(token);
  console.log('');
  console.log('Pour tester, ouvrez la console du navigateur et tapez:');
  console.log(`localStorage.setItem('arka_token', '${token}');`);
  console.log(`localStorage.setItem('arka_user', JSON.stringify({role: 'admin', username: 'admin-test'}));`);
  console.log('Puis actualisez la page.');
}

createAdminToken();