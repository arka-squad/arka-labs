const fs = require('fs');
const path = require('path');

// Corrections des imports selon la structure réelle
const corrections = [
  // Pages racine admin (même niveau que components/)
  { file: 'app/cockpit/admin/agents/page.tsx', protectionPath: './components/AdminProtection' },
  { file: 'app/cockpit/admin/clients/page.tsx', protectionPath: './components/AdminProtection' },
  { file: 'app/cockpit/admin/projects/page.tsx', protectionPath: './components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/page.tsx', protectionPath: './components/AdminProtection' },
  
  // Pages dans sous-dossiers (remontent d'un niveau)
  { file: 'app/cockpit/admin/agents/new/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/clients/new/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/projects/new/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/new/page.tsx', protectionPath: '../components/AdminProtection' },
  
  // Pages [id] (remontent d'un niveau)  
  { file: 'app/cockpit/admin/agents/[id]/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/clients/[id]/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/projects/[id]/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/[id]/page.tsx', protectionPath: '../components/AdminProtection' },
  
  // Pages edit (remontent de deux niveaux)
  { file: 'app/cockpit/admin/clients/[id]/edit/page.tsx', protectionPath: '../../components/AdminProtection' }
];

corrections.forEach(({ file, protectionPath }) => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remplacer n'importe quel import AdminProtection existant
  const adminProtectionRegex = /import\s+AdminProtection\s+from\s+['"][^'"]*['"];?/g;
  
  if (adminProtectionRegex.test(content)) {
    content = content.replace(adminProtectionRegex, `import AdminProtection from '${protectionPath}';`);
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed import in: ${file} -> ${protectionPath}`);
  } else {
    console.log(`No AdminProtection import found in: ${file}`);
  }
});

console.log('All AdminProtection imports fixed!');