#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Script de correction des imports NextResponse manquants');
console.log('='.repeat(60));

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
      if (filePath.includes('app' + path.sep + 'api' + path.sep)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function fixNextResponseImports(content) {
  let modifiedContent = content;
  let fixed = false;
  
  // Si le fichier utilise NextResponse mais ne l'importe pas
  if (modifiedContent.includes('NextResponse') && !modifiedContent.includes('import') + modifiedContent.includes('NextResponse')) {
    // Chercher l'import de NextRequest pour ajouter NextResponse
    const nextRequestImportRegex = /import\s*\{\s*NextRequest\s*\}\s*from\s*['"]next\/server['"];?/;
    const match = modifiedContent.match(nextRequestImportRegex);
    
    if (match) {
      modifiedContent = modifiedContent.replace(
        match[0],
        "import { NextRequest, NextResponse } from 'next/server';"
      );
      fixed = true;
    } else {
      // Si pas d'import NextRequest, ajouter l'import au début
      const lines = modifiedContent.split('\n');
      lines.splice(0, 0, "import { NextResponse } from 'next/server';");
      modifiedContent = lines.join('\n');
      fixed = true;
    }
  }
  
  return { content: modifiedContent, fixed };
}

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    const { content: fixedContent, fixed } = fixNextResponseImports(originalContent);
    
    if (fixed) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}: Import NextResponse ajouté`);
      return { processed: true };
    }
    
    return { processed: false };
  } catch (error) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.error(`❌ Erreur lors du traitement de ${relativePath}:`, error.message);
    return { processed: false, error: true };
  }
}

function main() {
  console.log('🔍 Recherche des fichiers API utilisant NextResponse sans import...');
  
  const files = walkDirectory(path.join(process.cwd(), 'app', 'api'));
  console.log(`📁 ${files.length} fichiers API trouvés\n`);
  
  let totalFiles = 0;
  let errors = 0;
  
  files.forEach(file => {
    const result = processFile(file);
    
    if (result.error) {
      errors++;
    } else if (result.processed) {
      totalFiles++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Résumé des corrections:');
  console.log(`   • Fichiers traités: ${totalFiles}`);
  
  if (errors > 0) {
    console.log(`   • Erreurs: ${errors}`);
  }
  
  if (totalFiles > 0) {
    console.log('\n✨ Imports NextResponse corrigés ! Testez: npm run build');
  } else {
    console.log('\n📝 Aucune correction nécessaire.');
  }
}

if (require.main === module) {
  main();
}