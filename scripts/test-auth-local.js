const https = require('http');
const { log } = require('console');

async function testAuth() {
  console.log('🔍 Test d\'authentification locale\n');
  
  // 1. D'abord, essayons de nous connecter
  console.log('1️⃣ Tentative de login...');
  
  const loginData = JSON.stringify({
    email: 'admin@arka.com',
    password: 'demo123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  try {
    const loginResponse = await new Promise((resolve, reject) => {
      const req = https.request(loginOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('Status:', res.statusCode);
          console.log('Headers:', res.headers);
          
          // Récupérer les cookies
          const cookies = res.headers['set-cookie'];
          if (cookies) {
            console.log('\n✅ Cookies reçus:');
            cookies.forEach(cookie => {
              const [name] = cookie.split('=');
              console.log(`  - ${name}`);
            });
          }
          
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
            cookies: cookies || []
          });
        });
      });
      
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });

    if (loginResponse.status === 200) {
      console.log('\n✅ Login réussi!');
      console.log('User:', loginResponse.data.user);
      
      // 2. Maintenant essayons de créer un client
      console.log('\n2️⃣ Test de création de client...');
      
      const clientData = JSON.stringify({
        nom: 'Test Client ' + Date.now(),
        secteur: 'Technologie',
        taille: 'PME',
        contact_principal: {
          nom: 'Test Contact',
          email: 'test@example.com',
          telephone: '0123456789',
          poste: 'CEO'
        }
      });

      // Préparer les cookies pour la requête
      const cookieHeader = loginResponse.cookies.map(c => c.split(';')[0]).join('; ');
      
      const clientOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/clients',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': clientData.length,
          'Cookie': cookieHeader
        }
      };

      const clientResponse = await new Promise((resolve, reject) => {
        const req = https.request(clientOptions, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            console.log('Status:', res.statusCode);
            
            try {
              const parsed = JSON.parse(data);
              resolve({
                status: res.statusCode,
                data: parsed
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                data: data
              });
            }
          });
        });
        
        req.on('error', reject);
        req.write(clientData);
        req.end();
      });

      if (clientResponse.status === 200) {
        console.log('\n✅ Client créé avec succès!');
        console.log('ID:', clientResponse.data.id);
      } else {
        console.log('\n❌ Erreur lors de la création du client');
        console.log('Response:', clientResponse.data);
      }
      
    } else {
      console.log('\n❌ Login échoué');
      console.log('Response:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Vérifier d'abord si le serveur est disponible
const checkServer = () => {
  const req = https.get('http://localhost:3000/api/auth/login', (res) => {
    console.log('✅ Serveur disponible sur le port 3000');
    testAuth();
  });
  
  req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.log('❌ Le serveur n\'est pas disponible sur le port 3000');
      console.log('Essayez: npm run dev');
    } else {
      console.log('❌ Erreur:', err.message);
    }
  });
};

checkServer();