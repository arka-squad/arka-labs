const fs = require('fs');
const path = require('path');

// Corrections basées sur la structure exacte :
// app/cockpit/admin/components/AdminProtection.tsx (fichier cible)

const corrections = [
  // Pages au niveau admin/ → '../components/AdminProtection'
  { file: 'app/cockpit/admin/agents/page.tsx', correctPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/projects/page.tsx', correctPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/page.tsx', correctPath: '../components/AdminProtection' },
  
  // Pages dans les sous-dossiers de niveau 1 → '../components/AdminProtection'
  { file: 'app/cockpit/admin/agents/new/page.tsx', correctPath: '../../components/AdminProtection' },
  { file: 'app/cockpit/admin/clients/new/page.tsx', correctPath: '../../components/AdminProtection' },
  { file: 'app/cockpit/admin/projects/new/page.tsx', correctPath: '../../components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/new/page.tsx', correctPath: '../../components/AdminProtection' },
  
  // Pages [id] dans les sous-dossiers → '../components/AdminProtection'
  { file: 'app/cockpit/admin/agents/[id]/page.tsx', correctPath: '../../components/AdminProtection' },
  { file: 'app/cockpit/admin/clients/[id]/page.tsx', correctPath: '../../components/AdminProtection' },
  { file: 'app/cockpit/admin/projects/[id]/page.tsx', correctPath: '../../components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/[id]/page.tsx', correctPath: '../../components/AdminProtection' },
  
  // Pages edit (niveau 2 de profondeur) → '../../../components/AdminProtection'
  { file: 'app/cockpit/admin/clients/[id]/edit/page.tsx', correctPath: '../../../components/AdminProtection' }
];

corrections.forEach(({ file, correctPath }) => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remplacer tout import AdminProtection existant
  const adminProtectionRegex = /import\s+AdminProtection\s+from\s+['"][^'"]*['"];?/g;
  
  if (adminProtectionRegex.test(content)) {
    content = content.replace(adminProtectionRegex, `import AdminProtection from '${correctPath}';`);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${file} → ${correctPath}`);
  } else {
    console.log(`⚠️  No AdminProtection import found in: ${file}`);
  }
});

console.log('✨ All AdminProtection imports corrected with proper relative paths!');