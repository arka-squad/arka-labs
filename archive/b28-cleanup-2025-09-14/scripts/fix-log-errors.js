#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Script de correction des erreurs de log TypeScript');
console.log('='.repeat(60));

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', 'dist', '.git'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      if (filePath.includes('app\\api\\')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function fixLogErrors(content) {
  let modifiedContent = content;
  let totalReplacements = 0;
  let details = [];
  
  // Pattern 1: log('error', 'message', { ... error: error.message, ... }) sans status
  const errorLogPattern = /log\(\s*'error'\s*,\s*'[^']*'\s*,\s*\{([^}]*)\}\s*\)/g;
  const matches = [...content.matchAll(errorLogPattern)];
  
  matches.forEach(match => {
    const logContent = match[1];
    // Vérifier si status est absent
    if (!logContent.includes('status:') && !logContent.includes('status =')) {
      // Vérifier si error: error.message est présent
      if (logContent.includes('error: error.message')) {
        // Remplacer error.message par la version sécurisée et ajouter status
        let newLogContent = logContent.replace(
          'error: error.message',
          'status: 500,\n      error: error instanceof Error ? error.message : \'Unknown error\''
        );
        
        const newMatch = match[0].replace(logContent, newLogContent);
        modifiedContent = modifiedContent.replace(match[0], newMatch);
        totalReplacements++;
        details.push('error log avec status');
      } else if (!logContent.includes('status:')) {
        // Juste ajouter status si absent
        const lines = logContent.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const indentation = lastLine.match(/^\s*/)[0];
        
        // Insérer status après method s'il existe, sinon au début
        let insertIndex = lines.findIndex(line => line.includes('method:'));
        if (insertIndex === -1) {
          insertIndex = 0;
        } else {
          insertIndex++;
        }
        
        lines.splice(insertIndex, 0, `${indentation}status: 500,`);
        const newLogContent = lines.join('\n');
        
        const newMatch = match[0].replace(logContent, newLogContent);
        modifiedContent = modifiedContent.replace(match[0], newMatch);
        totalReplacements++;
        details.push('status ajouté');
      }
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
    
    // Vérifier si le fichier contient des log d'erreur
    const hasErrorLogs = /log\(\s*'error'\s*,/.test(originalContent);
    
    if (!hasErrorLogs) {
      return { processed: false, replacements: 0 };
    }
    
    const { content: fixedContent, replacements, details } = fixLogErrors(originalContent);
    
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
  console.log('🔍 Recherche des fichiers d\'API TypeScript...');
  
  const files = walkDirectory(path.join(process.cwd(), 'app', 'api'));
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

if (require.main === module) {
  main();
}