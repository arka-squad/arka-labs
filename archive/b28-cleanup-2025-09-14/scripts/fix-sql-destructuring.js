#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Script de correction des erreurs de déstructuration SQL');
console.log('='.repeat(60));

// Patterns à corriger
const patterns = [
  // Pattern: const { rows } = await sql`...`
  {
    regex: /const\s+\{\s*rows\s*\}\s*=\s*await\s+sql`/g,
    replacement: 'const rows = await sql`'
  },
  // Pattern: const { rows: variableName } = await sql`...`
  {
    regex: /const\s+\{\s*rows:\s*(\w+)\s*\}\s*=\s*await\s+sql`/g,
    replacement: 'const $1 = await sql`'
  }
];

async function findTypeScriptFiles() {
  try {
    // Chercher tous les fichiers .ts dans app/api et lib
    const files = await glob('**/*.ts', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.next/**', 'dist/**', '**/*.d.ts']
    });
    
    return files.filter(file => 
      file.includes('app/api/') || 
      file.includes('lib/') ||
      file.includes('tests/')
    );
  } catch (error) {
    console.error('Erreur lors de la recherche de fichiers:', error);
    return [];
  }
}

function fixSqlDestructuring(content) {
  let modifiedContent = content;
  let totalReplacements = 0;
  
  patterns.forEach(({ regex, replacement }) => {
    const matches = [...modifiedContent.matchAll(regex)];
    if (matches.length > 0) {
      modifiedContent = modifiedContent.replace(regex, replacement);
      totalReplacements += matches.length;
    }
  });
  
  return {
    content: modifiedContent,
    replacements: totalReplacements
  };
}

async function processFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier si le fichier contient les patterns problématiques
    const hasProblematicPatterns = patterns.some(({ regex }) => 
      regex.test(originalContent)
    );
    
    if (!hasProblematicPatterns) {
      return { processed: false, replacements: 0 };
    }
    
    const { content: fixedContent, replacements } = fixSqlDestructuring(originalContent);
    
    if (replacements > 0) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ ${filePath}: ${replacements} correction(s)`);
      return { processed: true, replacements };
    }
    
    return { processed: false, replacements: 0 };
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return { processed: false, replacements: 0, error: true };
  }
}

async function main() {
  console.log('🔍 Recherche des fichiers TypeScript...');
  
  const files = await findTypeScriptFiles();
  console.log(`📁 ${files.length} fichiers trouvés\n`);
  
  let totalFiles = 0;
  let totalReplacements = 0;
  let errors = 0;
  
  for (const file of files) {
    const result = await processFile(file);
    
    if (result.error) {
      errors++;
    } else if (result.processed) {
      totalFiles++;
      totalReplacements += result.replacements;
    }
  }
  
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
  main().catch(console.error);
}

module.exports = { fixSqlDestructuring, patterns };