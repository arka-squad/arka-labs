#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Script de correction des imports NextResponse dupliqués');
console.log('='.repeat(65));

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

function fixDuplicateImports(content) {
  let modifiedContent = content;
  let fixed = false;
  
  // Pattern pour imports NextResponse dupliqués
  const lines = modifiedContent.split('\n');
  const newLines = [];
  let foundNextResponseImport = false;
  let foundNextRequestImport = false;
  let combinedImport = null;
  
  lines.forEach(line => {
    // Détecter les imports NextResponse/NextRequest
    if (line.includes("import") && line.includes("'next/server'")) {
      if (line.includes('NextResponse') && line.includes('NextRequest')) {
        // Import combiné - garder tel quel
        if (!foundNextResponseImport) {
          newLines.push(line);
          foundNextResponseImport = true;
          foundNextRequestImport = true;
        } else {
          // Ignorer les doublons
          fixed = true;
        }
      } else if (line.includes('NextResponse')) {
        if (!foundNextResponseImport) {
          foundNextResponseImport = true;
          if (foundNextRequestImport) {
            // Combiner avec l'import NextRequest existant
            const lastImportIndex = newLines.findLastIndex(l => 
              l.includes("import") && l.includes("NextRequest") && l.includes("'next/server'")
            );
            if (lastImportIndex !== -1) {
              newLines[lastImportIndex] = "import { NextRequest, NextResponse } from 'next/server';";
              fixed = true;
            } else {
              newLines.push(line);
            }
          } else {
            newLines.push(line);
          }
        } else {
          // Ignorer les doublons
          fixed = true;
        }
      } else if (line.includes('NextRequest')) {
        if (!foundNextRequestImport) {
          foundNextRequestImport = true;
          if (foundNextResponseImport) {
            // Combiner avec l'import NextResponse existant
            const lastImportIndex = newLines.findLastIndex(l => 
              l.includes("import") && l.includes("NextResponse") && l.includes("'next/server'")
            );
            if (lastImportIndex !== -1) {
              newLines[lastImportIndex] = "import { NextRequest, NextResponse } from 'next/server';";
              fixed = true;
            } else {
              newLines.push(line);
            }
          } else {
            newLines.push(line);
          }
        } else {
          // Ignorer les doublons
          fixed = true;
        }
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  });
  
  if (fixed) {
    modifiedContent = newLines.join('\n');
  }
  
  return { content: modifiedContent, fixed };
}

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier s'il y a des imports dupliqués
    const nextServerImports = (originalContent.match(/import.*'next\/server'/g) || []).length;
    if (nextServerImports <= 1) {
      return { processed: false };
    }
    
    const { content: fixedContent, fixed } = fixDuplicateImports(originalContent);
    
    if (fixed) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}: Imports dupliqués supprimés`);
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
  console.log('🔍 Recherche des imports NextResponse dupliqués...');
  
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
  
  console.log('\n' + '='.repeat(65));
  console.log('📊 Résumé des corrections:');
  console.log(`   • Fichiers traités: ${totalFiles}`);
  
  if (errors > 0) {
    console.log(`   • Erreurs: ${errors}`);
  }
  
  if (totalFiles > 0) {
    console.log('\n✨ Imports dupliqués supprimés ! Testez: npm run build');
  } else {
    console.log('\n📝 Aucune correction nécessaire.');
  }
}

if (require.main === module) {
  main();
}