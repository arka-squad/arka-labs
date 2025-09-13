const fs = require('fs');
const path = require('path');

const corrections = [
  // Pages racine (/admin/*.tsx)
  { file: 'app/cockpit/admin/agents/page.tsx', protectionPath: './components/AdminProtection' },
  { file: 'app/cockpit/admin/clients/page.tsx', protectionPath: './components/AdminProtection' }, 
  { file: 'app/cockpit/admin/projects/page.tsx', protectionPath: './components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/page.tsx', protectionPath: './components/AdminProtection' },
  
  // Pages new (/admin/*/new/page.tsx)
  { file: 'app/cockpit/admin/agents/new/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/clients/new/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/projects/new/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/new/page.tsx', protectionPath: '../components/AdminProtection' },
  
  // Pages [id] (/admin/*/[id]/page.tsx) 
  { file: 'app/cockpit/admin/agents/[id]/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/clients/[id]/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/projects/[id]/page.tsx', protectionPath: '../components/AdminProtection' },
  { file: 'app/cockpit/admin/squads/[id]/page.tsx', protectionPath: '../components/AdminProtection' },
  
  // Pages edit (/admin/*/[id]/edit/page.tsx)
  { file: 'app/cockpit/admin/clients/[id]/edit/page.tsx', protectionPath: '../../components/AdminProtection', navPath: '../../components/AdminNavigation' }
];

corrections.forEach(({ file, protectionPath, navPath }) => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Fix AdminProtection import
  content = content.replace(
    /import AdminProtection from '[^']*';/,
    `import AdminProtection from '${protectionPath}';`
  );
  
  // Fix AdminNavigation import if specified
  if (navPath) {
    content = content.replace(
      /import AdminNavigation from '[^']*';/,
      `import AdminNavigation from '${navPath}';`
    );
  }
  
  fs.writeFileSync(fullPath, content);
  console.log(`Fixed imports in: ${file}`);
});

console.log('All import paths corrected!');