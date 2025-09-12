const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapping des permissions vers les rôles
const permissionToRoles = {
  // Read permissions - tous les rôles peuvent lire
  'projects:read': "['admin', 'manager', 'operator', 'viewer']",
  'clients:read': "['admin', 'manager', 'operator', 'viewer']",
  'squads:read': "['admin', 'manager', 'operator', 'viewer']",
  'agents:read': "['admin', 'manager', 'operator', 'viewer']",
  'dashboard:read': "['admin', 'manager', 'operator', 'viewer']",
  
  // Create/Write permissions - admin et manager
  'projects:create': "['admin', 'manager']",
  'projects:write': "['admin', 'manager']",
  'clients:create': "['admin', 'manager']",
  'clients:write': "['admin', 'manager']",
  'squads:create': "['admin', 'manager']",
  'agents:write': "['admin', 'manager']",
  
  // Update permissions - admin, manager et operator
  'squads:update': "['admin', 'manager', 'operator']",
  'squads:add_members': "['admin', 'manager']",
  'squads:create_instructions': "['admin', 'manager']",
  'projects:attach_squads': "['admin', 'manager']",
  
  // Delete permissions - admin seulement
  'projects:delete': "['admin']",
  'clients:delete': "['admin']",
  'squads:delete': "['admin']",
  'agents:delete': "['admin']",
};

// Trouve tous les fichiers route.ts dans app/api/admin
const files = glob.sync('app/api/admin/**/route.ts', {
  ignore: ['**/*route-complex.ts']
});

console.log(`Found ${files.length} route files to check\n`);

let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  let changes = [];
  
  // Pour chaque permission dans notre mapping
  Object.entries(permissionToRoles).forEach(([permission, roles]) => {
    const regex = new RegExp(`withAdminAuth\\(\\['${permission}'\\]`, 'g');
    const replacement = `withAdminAuth(${roles}`;
    
    if (content.includes(`withAdminAuth(['${permission}']`)) {
      content = content.replace(regex, replacement);
      changed = true;
      changes.push(`  '${permission}' → ${roles}`);
      totalChanges++;
    }
  });
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`✅ Updated: ${file}`);
    changes.forEach(change => console.log(change));
    console.log('');
  }
});

console.log(`\n📊 Summary: ${totalChanges} permissions updated across ${files.length} files`);
console.log('\n🎯 Standard role mappings applied:');
console.log('  - READ operations → admin, manager, operator, viewer');
console.log('  - CREATE operations → admin, manager');
console.log('  - UPDATE operations → admin, manager, operator');
console.log('  - DELETE operations → admin only');