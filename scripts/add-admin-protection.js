const fs = require('fs');
const path = require('path');

const adminPages = [
  'app/cockpit/admin/agents/page.tsx',
  'app/cockpit/admin/agents/new/page.tsx',
  'app/cockpit/admin/agents/[id]/page.tsx',
  'app/cockpit/admin/projects/page.tsx', 
  'app/cockpit/admin/projects/new/page.tsx',
  'app/cockpit/admin/projects/[id]/page.tsx',
  'app/cockpit/admin/squads/page.tsx',
  'app/cockpit/admin/squads/new/page.tsx',
  'app/cockpit/admin/squads/[id]/page.tsx',
  'app/cockpit/admin/clients/new/page.tsx',
  'app/cockpit/admin/clients/[id]/page.tsx',
  'app/cockpit/admin/clients/[id]/edit/page.tsx'
];

function getImportPath(filePath) {
  const depth = filePath.split('/').length - 3; // minus app/cockpit/admin
  return '../'.repeat(depth) + 'components/AdminProtection';
}

function addProtectionToFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Skip if already has AdminProtection
  if (content.includes('AdminProtection')) {
    console.log(`Already protected: ${filePath}`);
    return;
  }
  
  const importPath = getImportPath(filePath);
  
  // Add import after other imports
  const importRegex = /(import .* from ['"][^'"]*['"];?\n)+/;
  const match = content.match(importRegex);
  
  if (match) {
    const lastImportIndex = match.index + match[0].length;
    const beforeImports = content.substring(0, lastImportIndex);
    const afterImports = content.substring(lastImportIndex);
    
    content = beforeImports + 
              `import AdminProtection from '${importPath}';\n` +
              afterImports;
  }
  
  // Find the main return statement and wrap it
  const returnRegex = /(\s*return\s*\(\s*\n)/;
  const returnMatch = content.match(returnRegex);
  
  if (returnMatch) {
    content = content.replace(returnRegex, 
      returnMatch[1] + '    <AdminProtection allowedRoles={[\'admin\', \'manager\']}>\n      '
    );
    
    // Find the corresponding closing parenthesis and add AdminProtection close
    const lines = content.split('\n');
    let returnLineIndex = -1;
    let openParens = 0;
    let closingIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('return (')) {
        returnLineIndex = i;
        openParens = 1;
        continue;
      }
      if (returnLineIndex > -1) {
        openParens += (lines[i].match(/\(/g) || []).length;
        openParens -= (lines[i].match(/\)/g) || []).length;
        if (openParens === 0) {
          closingIndex = i;
          break;
        }
      }
    }
    
    if (closingIndex > -1) {
      lines[closingIndex] = lines[closingIndex].replace(/(\s*)\);/, '$1</AdminProtection>\n$1);');
      content = lines.join('\n');
    }
  }
  
  fs.writeFileSync(fullPath, content);
  console.log(`Protected: ${filePath}`);
}

// Apply protection to all admin pages
adminPages.forEach(addProtectionToFile);
console.log('Admin protection applied to all pages!');