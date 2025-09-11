const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('./app/api');
let totalFixed = 0;
let filesChanged = 0;

console.log('🔍 Scanning for sql.unsafe usage...\n');

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  let changes = 0;

  // Fix: ORDER BY ${sql.unsafe(variable)} -> ORDER BY variable (if it's ASC/DESC)
  const orderByPattern = /ORDER BY \${sql\.unsafe\(([^)]+)\)}/g;
  let matches = content.match(orderByPattern);
  if (matches) {
    newContent = newContent.replace(orderByPattern, 'ORDER BY $1');
    changes += matches.length;
    console.log(`📝 ${file}: Fixed ${matches.length} sql.unsafe ORDER BY usage(s)`);
  }

  // Fix other sql.unsafe patterns - replace with the variable directly
  const unsafePattern = /\${sql\.unsafe\(([^)]+)\)}/g;
  matches = content.match(unsafePattern);
  if (matches) {
    newContent = newContent.replace(unsafePattern, '${$1}');
    changes += matches.length;
    console.log(`📝 ${file}: Fixed ${matches.length} sql.unsafe usage(s)`);
  }

  if (changes > 0) {
    fs.writeFileSync(file, newContent);
    totalFixed += changes;
    filesChanged++;
  }
}

console.log(`\n✅ Fixed ${totalFixed} sql.unsafe usages in ${filesChanged} files`);