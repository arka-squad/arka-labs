const fs = require('fs');
const path = require('path');

const adminDir = path.join(process.cwd(), 'app', 'cockpit', 'admin');

// Mapping of correct relative paths based on file location
const pathMappings = {
  // Level 1 files (directly in subdirectories like /agents/, /projects/)
  'agents/page.tsx': '../components/AdminProtection',
  'clients/page.tsx': '../components/AdminProtection',
  'projects/page.tsx': '../components/AdminProtection', 
  'squads/page.tsx': '../components/AdminProtection',
  
  // Level 2 files (in subdirectories like /agents/new/, /projects/[id]/)
  'agents/new/page.tsx': '../../components/AdminProtection',
  'agents/[id]/page.tsx': '../../components/AdminProtection',
  'clients/new/page.tsx': '../../components/AdminProtection',
  'clients/[id]/page.tsx': '../../components/AdminProtection',
  'projects/new/page.tsx': '../../components/AdminProtection',
  'projects/[id]/page.tsx': '../../components/AdminProtection',
  'squads/new/page.tsx': '../../components/AdminProtection',
  'squads/[id]/page.tsx': '../../components/AdminProtection',
  
  // Level 3 files (in deep subdirectories like /clients/[id]/edit/)
  'clients/[id]/edit/page.tsx': '../../../components/AdminProtection',
  'squads/[id]/members/page.tsx': '../../../components/AdminProtection'
};

function fixImportsInFile(filePath, correctImportPath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains AdminProtection import
    if (content.includes('import AdminProtection from')) {
      console.log(`Fixing imports in: ${filePath}`);
      
      // Replace any existing AdminProtection import with the correct path
      content = content.replace(
        /import\s+AdminProtection\s+from\s+['"](.*?)['"];?/g,
        `import AdminProtection from '${correctImportPath}';`
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath} -> ${correctImportPath}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
  return false;
}

function fixAllAdminProtectionImports() {
  console.log('🔧 Fixing AdminProtection imports...');
  
  let fixedCount = 0;
  
  for (const [relativePath, correctImport] of Object.entries(pathMappings)) {
    const fullPath = path.join(adminDir, relativePath);
    
    if (fs.existsSync(fullPath)) {
      if (fixImportsInFile(fullPath, correctImport)) {
        fixedCount++;
      }
    } else {
      console.log(`⚠️  File not found: ${fullPath}`);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} AdminProtection import(s)`);
}

// Run the fix
fixAllAdminProtectionImports();