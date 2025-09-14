const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('./app');
let totalFixed = 0;
let filesChanged = 0;

console.log('🔍 Scanning for apiFetch usage without JSON parsing...\n');

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  let changes = 0;

  // Look for pattern: const data = await apiFetch(...);
  // and replace with: const response = await apiFetch(...); const data = await response.json();
  const pattern = /const\s+(\w+)\s*=\s*await\s+apiFetch\(([^)]+)\);/g;
  const matches = content.match(pattern);
  if (matches) {
    for (const match of matches) {
      const variableMatch = match.match(/const\s+(\w+)\s*=\s*await\s+apiFetch\(([^)]+)\);/);
      if (variableMatch) {
        const [fullMatch, varName, apiCall] = variableMatch;
        const replacement = `const response = await apiFetch(${apiCall});\n      const ${varName} = await response.json();`;
        newContent = newContent.replace(fullMatch, replacement);
        changes++;
      }
    }
    console.log(`📝 ${file}: Fixed ${matches.length} apiFetch usage(s)`);
  }

  if (changes > 0) {
    fs.writeFileSync(file, newContent);
    totalFixed += changes;
    filesChanged++;
  }
}

console.log(`\n✅ Fixed ${totalFixed} apiFetch usages in ${filesChanged} files`);