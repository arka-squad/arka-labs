#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Script de correction des erreurs de déstructuration SQL');
console.log('='.repeat(60));

// Patterns à corriger
const patterns = [
  // Pattern: const { rows } = await sql`...`
  {
    name: 'rows simple',
    regex: /const\s+\{\s*rows\s*\}\s*=\s*await\s+sql`/g,
    replacement: 'const rows = await sql`'
  },
  // Pattern: const { rows: variableName } = await sql`...`
  {
    name: 'rows avec alias',
    regex: /const\s+\{\s*rows:\s*(\w+)\s*\}\s*=\s*await\s+sql`/g,
    replacement: 'const $1 = await sql`'
  }
];

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer certains dossiers
      if (!['node_modules', '.next', 'dist', '.git'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      // Inclure seulement les fichiers des API et lib
      if (filePath.includes('app\\api\\') || filePath.includes('lib\\') || filePath.includes('tests\\')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function fixSqlDestructuring(content) {
  let modifiedContent = content;
  let totalReplacements = 0;
  let details = [];
  
  patterns.forEach(({ name, regex, replacement }) => {
    const matches = [...modifiedContent.matchAll(regex)];
    if (matches.length > 0) {
      modifiedContent = modifiedContent.replace(regex, replacement);
      totalReplacements += matches.length;
      details.push(`${matches.length} × ${name}`);
    }
  });
  
  return {
    content: modifiedContent,
    replacements: totalReplacements,
    details
  };
}

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier contient les patterns problématiques
    const hasProblematicPatterns = patterns.some(({ regex }) => {
      regex.lastIndex = 0; // Reset regex state
      return regex.test(originalContent);
    });
    
    if (!hasProblematicPatterns) {
      return { processed: false, replacements: 0 };
    }
    
    const { content: fixedContent, replacements, details } = fixSqlDestructuring(originalContent);
    
    if (replacements > 0) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}: ${details.join(', ')}`);
      return { processed: true, replacements };
    }
    
    return { processed: false, replacements: 0 };
  } catch (error) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.error(`❌ Erreur lors du traitement de ${relativePath}:`, error.message);
    return { processed: false, replacements: 0, error: true };
  }
}

function main() {
  console.log('🔍 Recherche des fichiers TypeScript...');
  
  const files = walkDirectory(process.cwd());
  console.log(`📁 ${files.length} fichiers trouvés\n`);
  
  let totalFiles = 0;
  let totalReplacements = 0;
  let errors = 0;
  
  files.forEach(file => {
    const result = processFile(file);
    
    if (result.error) {
      errors++;
    } else if (result.processed) {
      totalFiles++;
      totalReplacements += result.replacements;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Résumé des corrections:');
  console.log(`   • Fichiers traités: ${totalFiles}`);
  console.log(`   • Corrections totales: ${totalReplacements}`);
  
  if (errors > 0) {
    console.log(`   • Erreurs: ${errors}`);
  }
  
  if (totalReplacements > 0) {
    console.log('\n✨ Corrections terminées ! Testez le build avec: npm run build');
  } else {
    console.log('\n📝 Aucune correction nécessaire.');
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { fixSqlDestructuring, patterns };