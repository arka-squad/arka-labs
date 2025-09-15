#!/usr/bin/env node

/**
 * B29 RESOLUTION - Fix API Mappings FR→EN
 * This script corrects French column references to English ones
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 B29 API Mappings Correction Starting...\n');

// Define the mappings to fix
const mappings = [
  // Client fields
  { from: /client_taille/g, to: 'client_size', desc: 'Client size mapping' },
  { from: /client_secteur/g, to: 'client_sector', desc: 'Client sector mapping' },
  { from: /client_statut/g, to: 'client_status', desc: 'Client status mapping' },

  // Direct column references in SQL
  { from: /c\.taille as client_taille/g, to: 'c.size as client_size', desc: 'SQL column mapping' },
  { from: /c\.secteur as client_secteur/g, to: 'c.sector as client_sector', desc: 'SQL column mapping' },
  { from: /c\.statut as client_statut/g, to: 'c.status as client_status', desc: 'SQL column mapping' },
];

// Files to fix
const filesToFix = [
  'lib/api-lite/setup.ts',
  'lib/api-router/admin-routes.ts',
  'app/api/admin/projects/[id]/route.ts',
  'app/api/admin/clients/route.ts',
];

let totalReplacements = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`📝 Processing: ${filePath}`);

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileReplacements = 0;

  mappings.forEach(mapping => {
    const matches = content.match(mapping.from);
    if (matches) {
      console.log(`  ✅ ${mapping.desc}: ${matches.length} replacements`);
      content = content.replace(mapping.from, mapping.to);
      fileReplacements += matches.length;
      totalReplacements += matches.length;
    }
  });

  if (fileReplacements > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`  💾 File updated with ${fileReplacements} changes\n`);
  } else {
    console.log(`  ✨ File already correct\n`);
  }
});

// Fix TypeScript interface files
console.log('🔍 Scanning TypeScript files for interface corrections...');

function scanDirectory(dirPath, extensions = ['.ts', '.tsx']) {
  const files = [];

  function scan(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    items.forEach(item => {
      const fullPath = path.join(currentPath, item.name);

      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        scan(fullPath);
      } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  scan(dirPath);
  return files;
}

const tsFiles = scanDirectory('app/cockpit/admin');

// Interface property mappings
const interfaceMappings = [
  { from: /client\.taille/g, to: 'client.size', desc: 'Client size property' },
  { from: /client\.secteur/g, to: 'client.sector', desc: 'Client sector property' },
  { from: /client\.nom/g, to: 'client.name', desc: 'Client name property' },
  { from: /client\.statut/g, to: 'client.status', desc: 'Client status property' },

  // Interface definitions
  { from: /taille:/g, to: 'size:', desc: 'Interface property definition' },
  { from: /secteur:/g, to: 'sector:', desc: 'Interface property definition' },
  { from: /nom:/g, to: 'name:', desc: 'Interface property definition' },
  { from: /statut:/g, to: 'status:', desc: 'Interface property definition' },
];

let tsReplacements = 0;

tsFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;

  interfaceMappings.forEach(mapping => {
    const matches = content.match(mapping.from);
    if (matches) {
      content = content.replace(mapping.from, mapping.to);
      fileReplacements += matches.length;
      tsReplacements += matches.length;
    }
  });

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ ${path.relative('.', filePath)}: ${fileReplacements} fixes`);
  }
});

console.log('\n=== B29 API MAPPINGS CORRECTION COMPLETE ===');
console.log(`📊 Total API mappings corrected: ${totalReplacements}`);
console.log(`📊 Total TypeScript fixes: ${tsReplacements}`);
console.log(`📊 Grand total: ${totalReplacements + tsReplacements} corrections`);

if (totalReplacements > 0 || tsReplacements > 0) {
  console.log('\n🔄 NEXT STEPS:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Test the admin pages: http://localhost:3000/cockpit/admin');
  console.log('3. Run validation script: node scripts/b29-resolution/validate_b29_complete.mjs');
} else {
  console.log('\n✨ All mappings were already correct!');
}

console.log('\n📋 Files that were processed:');
filesToFix.forEach(file => {
  console.log(`  - ${file}`);
});

if (tsReplacements > 0) {
  console.log(`  - ${tsFiles.length} TypeScript files in app/cockpit/admin/`);
}