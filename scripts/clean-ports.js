#!/usr/bin/env node
const { exec } = require('child_process');

function killPort(port) {
  return new Promise((resolve) => {
    // Trouver le processus qui utilise le port
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        console.log(`✅ Port ${port} libre`);
        resolve();
        return;
      }

      // Extraire le PID
      const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
      if (lines.length === 0) {
        console.log(`✅ Port ${port} libre`);
        resolve();
        return;
      }

      const pid = lines[0].trim().split(/\s+/).pop();
      if (!pid || pid === '0') {
        console.log(`✅ Port ${port} libre`);
        resolve();
        return;
      }

      console.log(`🔍 Port ${port} utilisé par PID ${pid}`);
      
      // Tuer le processus
      exec(`taskkill /PID ${pid} /F`, (killError) => {
        if (killError) {
          console.log(`❌ Erreur tuant PID ${pid}:`, killError.message);
        } else {
          console.log(`✅ Processus PID ${pid} tué (port ${port})`);
        }
        resolve();
      });
    });
  });
}

async function cleanPorts() {
  console.log('🧹 Nettoyage des ports Node.js...\n');
  
  const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008];
  
  for (const port of ports) {
    await killPort(port);
  }
  
  console.log('\n✅ Nettoyage terminé !');
  console.log('🚀 Vous pouvez maintenant démarrer npm run dev sur le port 3000');
}

cleanPorts().catch(console.error);