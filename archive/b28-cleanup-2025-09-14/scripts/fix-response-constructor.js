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

console.log('🔍 Scanning for Response constructor usage...\n');

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  let changes = 0;

  // Fix: new Response( -> new NextResponse(
  const responsePattern = /new Response\(/g;
  const matches = content.match(responsePattern);
  if (matches) {
    newContent = newContent.replace(responsePattern, 'new NextResponse(');
    changes += matches.length;
    console.log(`📝 ${file}: Fixed ${matches.length} Response constructor(s)`);
  }

  if (changes > 0) {
    fs.writeFileSync(file, newContent);
    totalFixed += changes;
    filesChanged++;
  }
}

console.log(`\n✅ Fixed ${totalFixed} Response constructors in ${filesChanged} files`);