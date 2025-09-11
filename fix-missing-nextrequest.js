#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Script final: ajout des imports NextRequest manquants');
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

function fixMissingNextRequest(content) {
  let modifiedContent = content;
  let fixed = false;
  
  // Si le fichier utilise NextRequest mais ne l'importe pas
  if (modifiedContent.includes(': NextRequest') && 
      !modifiedContent.includes('NextRequest') || 
      (modifiedContent.includes('NextRequest') && modifiedContent.indexOf(': NextRequest') < modifiedContent.indexOf('NextRequest'))) {
    
    // Trouver l'import NextResponse
    const nextResponseImport = /import\s*\{\s*NextResponse\s*\}\s*from\s*['"]next\/server['"];?/;
    if (nextResponseImport.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(
        nextResponseImport,
        "import { NextRequest, NextResponse } from 'next/server';"
      );
      fixed = true;
    }
  }
  
  return { content: modifiedContent, fixed };
}

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si NextRequest est utilisé mais pas importé
    const usesNextRequest = originalContent.includes(': NextRequest');
    const importsNextRequest = originalContent.includes('NextRequest') && 
                               originalContent.indexOf('NextRequest') < originalContent.indexOf(': NextRequest');
    
    if (!usesNextRequest || importsNextRequest) {
      return { processed: false };
    }
    
    const { content: fixedContent, fixed } = fixMissingNextRequest(originalContent);
    
    if (fixed) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}: NextRequest ajouté à l'import`);
      return { processed: true };
    }
    
    return { processed: false };
  } catch (error) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.error(`❌ Erreur: ${relativePath}:`, error.message);
    return { processed: false, error: true };
  }
}

function main() {
  const files = walkDirectory(path.join(process.cwd(), 'app', 'api'));
  console.log(`📁 ${files.length} fichiers API à vérifier\n`);
  
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
  console.log(`📊 ${totalFiles} fichiers corrigés`);
  
  if (errors > 0) {
    console.log(`❌ ${errors} erreurs`);
  }
  
  console.log('✨ Terminé ! Test final: npm run build');
}

if (require.main === module) {
  main();
}