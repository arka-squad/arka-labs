#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Script de correction COMPLETE des erreurs de déstructuration SQL');
console.log('='.repeat(70));

function walkDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', 'dist', '.git'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixSqlDestructuring(content) {
  let modifiedContent = content;
  let totalReplacements = 0;
  let details = [];
  
  // Pattern 1: const { rows } = await sql`...`
  const pattern1 = /const\s+\{\s*rows\s*\}\s*=\s*await\s+sql`/g;
  let matches1 = [...modifiedContent.matchAll(pattern1)];
  if (matches1.length > 0) {
    modifiedContent = modifiedContent.replace(pattern1, 'const rows = await sql`');
    totalReplacements += matches1.length;
    details.push(`${matches1.length} × { rows } = await sql`);
  }
  
  // Pattern 2: const { rows: variableName } = await sql`...`
  const pattern2 = /const\s+\{\s*rows:\s*(\w+)\s*\}\s*=\s*await\s+sql`/g;
  let matches2 = [...modifiedContent.matchAll(pattern2)];
  if (matches2.length > 0) {
    modifiedContent = modifiedContent.replace(pattern2, 'const $1 = await sql`');
    totalReplacements += matches2.length;
    details.push(`${matches2.length} × { rows: alias } = await sql`);
  }
  
  // Pattern 3: Multiline patterns
  const pattern3 = /const\s+\{\s*rows\s*\}\s*=\s*\n\s*await\s+sql`/g;
  let matches3 = [...modifiedContent.matchAll(pattern3)];
  if (matches3.length > 0) {
    modifiedContent = modifiedContent.replace(pattern3, 'const rows =\n    await sql`');
    totalReplacements += matches3.length;
    details.push(`${matches3.length} × multiline { rows } = await sql`);
  }
  
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
    const hasProblematicPatterns = /const\s+\{\s*rows/g.test(originalContent);
    
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
  console.log('🔍 Recherche EXHAUSTIVE dans tous les fichiers TypeScript...');
  
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
  
  console.log('\n' + '='.repeat(70));
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

if (require.main === module) {
  main();
}

module.exports = { fixSqlDestructuring };