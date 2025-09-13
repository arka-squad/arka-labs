const fs = require('fs');
const path = require('path');

const corrections = {
  'app/cockpit/admin/agents/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/agents/new/page.tsx': '../../components/AdminProtection', 
  'app/cockpit/admin/agents/[id]/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/projects/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/projects/new/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/projects/[id]/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/squads/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/squads/new/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/squads/[id]/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/clients/new/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/clients/[id]/page.tsx': '../../components/AdminProtection',
  'app/cockpit/admin/clients/[id]/edit/page.tsx': '../../components/AdminProtection'
};

Object.entries(corrections).forEach(([filePath, correctPath]) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Fix AdminProtection import
  const wrongPatterns = [
    /import AdminProtection from '[^']*components\/AdminProtection';/,
    /import AdminProtection from "[^"]*components\/AdminProtection";/
  ];
  
  wrongPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, `import AdminProtection from '${correctPath}';`);
      console.log(`Fixed AdminProtection import in: ${filePath}`);
    }
  });
  
  // Fix AdminNavigation import in clients/[id]/edit/page.tsx
  if (filePath === 'app/cockpit/admin/clients/[id]/edit/page.tsx') {
    content = content.replace(
      /import AdminNavigation from '[^']*components\/AdminNavigation';/,
      `import AdminNavigation from '../../components/AdminNavigation';`
    );
    console.log(`Fixed AdminNavigation import in: ${filePath}`);
  }
  
  fs.writeFileSync(fullPath, content);
});

console.log('Import paths fixed!');