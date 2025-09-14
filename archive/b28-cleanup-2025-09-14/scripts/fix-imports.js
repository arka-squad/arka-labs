const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Trouve tous les fichiers route.ts dans app/api/admin
const files = glob.sync('app/api/admin/**/route.ts', {
  ignore: ['**/*route-complex.ts']
});

console.log(`Checking ${files.length} files for import corrections...\n`);

let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Compter la profondeur du fichier pour déterminer le bon chemin relatif
  const segments = file.split('/').length;
  
  // app/api/admin/xxx/route.ts = 5 segments = ../../../../lib
  // app/api/admin/xxx/[id]/route.ts = 6 segments = ../../../../../lib
  // app/api/admin/xxx/[id]/yyy/route.ts = 7 segments = ../../../../../../lib
  // app/api/admin/xxx/[id]/yyy/[zid]/route.ts = 8 segments = ../../../../../../../lib
  
  const libPath = '../'.repeat(segments - 1) + 'lib';
  
  // Remplacer l'import rbac-admin par rbac-admin-b24
  const oldImportRegex = /from ['"](.*)\/rbac-admin['"]/g;
  const newImport = `from '${libPath}/rbac-admin-b24'`;
  
  if (content.includes('/rbac-admin\'') || content.includes('/rbac-admin"')) {
    content = content.replace(oldImportRegex, newImport);
    changed = true;
    fixedCount++;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed import in: ${file}`);
    console.log(`   New import: ${newImport}`);
  }
});

console.log(`\n✨ Fixed ${fixedCount} imports!`);