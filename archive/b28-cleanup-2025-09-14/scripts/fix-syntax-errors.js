#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files with syntax errors from the migration
const problematicFiles = [
  'app/admin/squads/[id]/page.tsx',
  'app/admin/squads/page.tsx',
  'app/cockpit/admin/page.tsx',
  'app/cockpit/agents/page.tsx',
  'app/cockpit/analytics/page.tsx',
  'app/cockpit/clients/[id]/page.tsx',
  'app/cockpit/clients/page.tsx',
  'app/cockpit/instructions/page.tsx',
  'app/cockpit/projects/[id]/DocumentUpload.tsx',
  'app/cockpit/projects/[id]/page.tsx',
  'app/cockpit/projects/new/page.tsx',
  'app/cockpit/projects/page.tsx',
  'app/cockpit/squads/[id]/page.tsx',
  'app/cockpit/squads/new/page.tsx',
  'app/cockpit/squads/page.tsx',
  'app/cockpit/components/RealTimeUpdates.tsx'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix pattern 1: Malformed headers with credentials
    // Before: headers: { , 'X-Trace-Id': `trace-${Date.now(), credentials: 'include'}`
    // After: headers: { 'X-Trace-Id': `trace-${Date.now()}` }, credentials: 'include'
    content = content.replace(
      /headers:\s*{\s*,\s*['"]X-Trace-Id['"]\s*:\s*`trace-\$\{Date\.now\(\)\s*,\s*credentials:\s*'include'\}`/g,
      "headers: { 'X-Trace-Id': `trace-${Date.now()}` }, credentials: 'include'"
    );
    
    // Fix pattern 2: Empty headers with comma
    // Before: headers: { , }
    // After: headers: {}
    content = content.replace(/headers:\s*{\s*,\s*}/g, 'headers: {}');
    
    // Fix pattern 3: Credentials inside template literal
    // Before: ${Date.now(), credentials: 'include'}
    // After: ${Date.now()}`, credentials: 'include'
    content = content.replace(
      /\$\{Date\.now\(\)\s*,\s*credentials:\s*'include'\}/g,
      "${Date.now()}"
    );
    
    // Fix pattern 4: Malformed fetch options
    // Before: }, credentials: 'include'}); 
    // After: , credentials: 'include' });
    content = content.replace(
      /}\s*,\s*credentials:\s*'include'\s*}\);/g,
      ", credentials: 'include' });"
    );
    
    // Fix pattern 5: Double commas
    content = content.replace(/,\s*,/g, ',');
    
    // Fix pattern 6: Fix specific malformed patterns
    content = content.replace(
      /,\s*credentials:\s*'include'\s*headers:\s*{/g,
      ", headers: {"
    );
    
    // Fix pattern 7: Clean up misplaced credentials
    content = content.replace(
      /body:\s*JSON\.stringify\([^)]+\)\s*,\s*credentials:\s*'include'\s*\)\s*,\s*credentials:\s*'include'/g,
      "body: JSON.stringify($1), credentials: 'include'"
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing syntax errors from JWT migration...\n');

let fixedCount = 0;
for (const file of problematicFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    if (fixFile(fullPath)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
}

console.log(`\n📊 Summary: Fixed ${fixedCount} files`);