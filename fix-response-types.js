#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Script de correction des Response.json vers NextResponse.json');
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
      if (filePath.includes('app' + path.sep + 'api' + path.sep)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function fixResponseTypes(content) {
  let modifiedContent = content;
  let totalReplacements = 0;
  let details = [];
  let needsNextResponseImport = false;
  
  // Pattern: return Response.json(
  const responseJsonPattern = /return\s+Response\.json\(/g;
  const matches = [...modifiedContent.matchAll(responseJsonPattern)];
  if (matches.length > 0) {
    modifiedContent = modifiedContent.replace(responseJsonPattern, 'return NextResponse.json(');
    totalReplacements += matches.length;
    details.push(`${matches.length} × Response.json → NextResponse.json`);
    needsNextResponseImport = true;
  }
  
  // Vérifier si NextResponse est importé
  if (needsNextResponseImport && !modifiedContent.includes('NextResponse')) {
    // Chercher l'import de NextRequest pour ajouter NextResponse
    const nextRequestImport = /import\s*\{\s*NextRequest\s*\}\s*from\s*['"]next\/server['"];?/;
    if (nextRequestImport.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(
        nextRequestImport,
        "import { NextRequest, NextResponse } from 'next/server';"
      );
      details.push('Import NextResponse ajouté');
    } else {
      // Ajouter l'import au début
      const lines = modifiedContent.split('\n');
      lines.splice(0, 0, "import { NextResponse } from 'next/server';");
      modifiedContent = lines.join('\n');
      details.push('Import NextResponse ajouté au début');
    }
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
    
    // Vérifier si le fichier contient Response.json
    if (!originalContent.includes('Response.json')) {
      return { processed: false, replacements: 0 };
    }
    
    const { content: fixedContent, replacements, details } = fixResponseTypes(originalContent);
    
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
  console.log('🔍 Recherche des fichiers API avec Response.json...');
  
  const files = walkDirectory(path.join(process.cwd(), 'app', 'api'));
  console.log(`📁 ${files.length} fichiers API trouvés\n`);
  
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