#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/JavaScript files that use localStorage.getItem('jwt')
const files = glob.sync('app/**/*.{tsx,ts,jsx,js}', {
  cwd: process.cwd(),
  absolute: true
});

let filesFixed = 0;
let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Pattern 1: Replace Authorization header with localStorage
  const pattern1 = /['"]Authorization['"]\s*:\s*`Bearer \$\{localStorage\.getItem\(['"]jwt['"]\)\}`/g;
  content = content.replace(pattern1, '');
  
  // Pattern 2: Remove any standalone Authorization headers using localStorage
  const pattern2 = /,?\s*['"]Authorization['"]\s*:\s*`Bearer \$\{localStorage\.getItem\(['"]jwt['"]\)\}`,?/g;
  content = content.replace(pattern2, ',');
  
  // Pattern 3: Add credentials: 'include' if fetch call exists and doesn't have it
  const fetchPattern = /fetch\s*\([^)]+\{([^}]+)\}/g;
  let matches = content.matchAll(fetchPattern);
  
  for (const match of matches) {
    const fetchOptions = match[1];
    if (!fetchOptions.includes('credentials')) {
      // Add credentials: 'include' to the fetch options
      const updatedOptions = fetchOptions + ",\n        credentials: 'include'";
      const originalFetch = match[0];
      const updatedFetch = originalFetch.replace(fetchOptions, updatedOptions);
      content = content.replace(originalFetch, updatedFetch);
    }
  }
  
  // Clean up any double commas or trailing commas before }
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,\s*\}/g, '}');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesFixed++;
    console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`  Files scanned: ${files.length}`);
console.log(`  Files fixed: ${filesFixed}`);