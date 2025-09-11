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

const files = getAllFiles('./lib');
let totalFixed = 0;
let filesChanged = 0;

console.log('🔍 Scanning for log calls missing route/status in lib/...\n');

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  let changes = 0;

  // Pattern for log calls that don't have both route and status
  const logPattern = /log\('(\w+)',\s*'([^']+)',\s*\{([^}]*)\}\)/g;
  let match;
  
  while ((match = logPattern.exec(content)) !== null) {
    const [fullMatch, level, message, props] = match;
    
    // Check if it already has route and status
    if (props.includes('route:') && props.includes('status:')) {
      continue;
    }
    
    const status = level === 'info' || level === 'debug' ? 200 : 500;
    const route = file.includes('cache') ? 'cache' : 
                 file.includes('integration') ? 'integration' :
                 file.includes('idempotency') ? 'idempotency' : 'lib';
    
    let newProps = `route: '${route}', status: ${status}`;
    if (props.trim()) {
      newProps += `, ${props.trim()}`;
    }
    
    const replacement = `log('${level}', '${message}', { ${newProps} })`;
    newContent = newContent.replace(fullMatch, replacement);
    changes++;
  }

  if (changes > 0) {
    fs.writeFileSync(file, newContent);
    totalFixed += changes;
    filesChanged++;
    console.log(`📝 ${file}: Fixed ${changes} log call(s)`);
  }
}

console.log(`\n✅ Fixed ${totalFixed} log calls in ${filesChanged} lib files`);