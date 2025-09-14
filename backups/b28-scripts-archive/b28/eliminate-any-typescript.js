/**
 * Script B28 Phase 3 - Élimination TypeScript 'any'
 * Objectif: 0 'any' dans le codebase pour TypeScript strict
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function eliminateAnyTypeScript() {
  console.log('🎯 B28 Phase 3 - Élimination TypeScript any...');

  const report = {
    timestamp: new Date().toISOString(),
    totalAny: 0,
    filesCorrected: 0,
    corrections: [],
    errors: []
  };

  try {
    // 1. Scanner tous les fichiers TS/TSX dans src/
    const files = scanTypeScriptFiles();
    console.log(`📁 ${files.length} fichiers TypeScript trouvés`);

    // 2. Analyser chaque fichier pour les 'any'
    for (const filePath of files) {
      try {
        const analysis = analyzeFileAny(filePath);

        if (analysis.anyCount > 0) {
          console.log(`🔍 ${filePath}: ${analysis.anyCount} 'any' détectés`);
          report.totalAny += analysis.anyCount;

          // 3. Appliquer corrections automatiques
          const corrected = await applyAnyCorrections(filePath, analysis);

          if (corrected.fixed > 0) {
            report.filesCorrected++;
            report.corrections.push({
              file: filePath,
              beforeCount: analysis.anyCount,
              afterCount: analysis.anyCount - corrected.fixed,
              fixes: corrected.fixes
            });

            console.log(`  ✅ ${corrected.fixed} 'any' corrigés`);
          }
        }

      } catch (error) {
        report.errors.push({
          file: filePath,
          error: error.message
        });
        console.log(`  ❌ Erreur: ${error.message}`);
      }
    }

    // 4. Vérifier le résultat final
    const finalCount = countRemainingAny();
    const correctedCount = report.totalAny - finalCount;

    console.log(`\n✅ Élimination 'any' terminée:`);
    console.log(`   📊 'any' initial: ${report.totalAny}`);
    console.log(`   🎯 'any' corrigés: ${correctedCount}`);
    console.log(`   ⚠️  'any' restants: ${finalCount}`);
    console.log(`   📁 Fichiers modifiés: ${report.filesCorrected}`);

    // 5. Générer rapport détaillé
    await generateAnyEliminationReport(report, finalCount);

    return {
      ...report,
      finalCount,
      correctedCount,
      success: finalCount < report.totalAny
    };

  } catch (error) {
    console.error('❌ Erreur élimination any:', error);
    throw error;
  }
}

function scanTypeScriptFiles() {
  const files = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          scanDir(fullPath);
        }
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  scanDir('src');
  return files;
}

function analyzeFileAny(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const anyOccurrences = [];
  let anyCount = 0;

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }

    // Detect 'any' patterns
    const anyMatches = line.match(/:\s*any\b/g);
    if (anyMatches) {
      anyOccurrences.push({
        line: index + 1,
        content: line.trim(),
        count: anyMatches.length
      });
      anyCount += anyMatches.length;
    }
  });

  return {
    filePath,
    content,
    anyCount,
    anyOccurrences,
    suggestions: generateTypeSuggestions(content)
  };
}

async function applyAnyCorrections(filePath, analysis) {
  let content = analysis.content;
  let fixCount = 0;
  const fixes = [];

  // Pattern corrections communes
  const corrections = [
    {
      pattern: /(\w+):\s*any(\s*=\s*req)/g,
      replacement: '$1: NextRequest$2',
      description: 'req: any → req: NextRequest'
    },
    {
      pattern: /(\w+):\s*any(\s*=\s*res)/g,
      replacement: '$1: NextResponse$2',
      description: 'res: any → res: NextResponse'
    },
    {
      pattern: /(error):\s*any/g,
      replacement: '$1: Error | unknown',
      description: 'error: any → error: Error | unknown'
    },
    {
      pattern: /(context):\s*any/g,
      replacement: '$1: { params: any }',
      description: 'context: any → context: { params: any }'
    },
    {
      pattern: /(params):\s*any/g,
      replacement: '$1: Record<string, string>',
      description: 'params: any → params: Record<string, string>'
    },
    {
      pattern: /(data):\s*any(\[\])?/g,
      replacement: '$1: unknown$2',
      description: 'data: any → data: unknown'
    },
    {
      pattern: /(response):\s*any/g,
      replacement: '$1: Response',
      description: 'response: any → response: Response'
    }
  ];

  // Appliquer corrections
  for (const correction of corrections) {
    const beforeCount = (content.match(correction.pattern) || []).length;
    content = content.replace(correction.pattern, correction.replacement);
    const afterCount = (content.match(correction.pattern) || []).length;

    const fixed = beforeCount - afterCount;
    if (fixed > 0) {
      fixes.push({
        description: correction.description,
        count: fixed
      });
      fixCount += fixed;
    }
  }

  // Écrire fichier corrigé si modifications
  if (fixCount > 0) {
    fs.writeFileSync(filePath, content);
  }

  return {
    fixed: fixCount,
    fixes
  };
}

function generateTypeSuggestions(content) {
  const suggestions = [];

  const patterns = [
    {
      pattern: /req:\s*any/,
      suggestion: 'Remplacer par NextRequest depuis next/server'
    },
    {
      pattern: /res:\s*any/,
      suggestion: 'Remplacer par NextResponse depuis next/server'
    },
    {
      pattern: /error:\s*any/,
      suggestion: 'Utiliser Error | unknown pour type safety'
    },
    {
      pattern: /data:\s*any/,
      suggestion: 'Créer interface spécifique ou utiliser unknown'
    },
    {
      pattern: /\w+:\s*any\[\]/,
      suggestion: 'Définir type des éléments du tableau'
    }
  ];

  patterns.forEach(({ pattern, suggestion }) => {
    if (pattern.test(content)) {
      suggestions.push(suggestion);
    }
  });

  return suggestions.length > 0 ? suggestions : ['Analyser contexte pour type approprié'];
}

function countRemainingAny() {
  try {
    const result = execSync('grep -r ": any" src/ | wc -l', { encoding: 'utf8' });
    return parseInt(result.trim()) || 0;
  } catch (error) {
    return 0;
  }
}

async function generateAnyEliminationReport(report, finalCount) {
  const reductionPercent = report.totalAny > 0
    ? Math.round(((report.totalAny - finalCount) / report.totalAny) * 100)
    : 0;

  const markdown = `# B28 Phase 3 - Élimination TypeScript 'any'

**Date**: ${report.timestamp}
**Objectif**: 0 'any' dans le codebase (TypeScript strict)

## 📊 Résultats

| Métrique | Valeur |
|----------|--------|
| 'any' initial | ${report.totalAny} |
| 'any' corrigés | ${report.totalAny - finalCount} |
| 'any' restants | ${finalCount} |
| Réduction | ${reductionPercent}% |
| Fichiers modifiés | ${report.filesCorrected} |

## ✅ Corrections Automatiques

${report.corrections.map(correction => `
### ${correction.file}
- **Avant**: ${correction.beforeCount} 'any'
- **Après**: ${correction.afterCount} 'any'
- **Fixes appliqués**:
${correction.fixes.map(fix => `  - ${fix.description} (${fix.count}x)`).join('\n')}
`).join('\n')}

${finalCount > 0 ? `
## ⚠️ 'any' Restants à Corriger Manuellement

Les 'any' restants nécessitent une analyse manuelle:
- Types complexes nécessitant interfaces spécifiques
- APIs externes sans types disponibles
- Cas où 'unknown' n'est pas approprié

### Actions Recommandées
1. Créer interfaces TypeScript pour objets complexes
2. Utiliser génériques pour fonctions réutilisables
3. Typer les APIs externes avec des déclarations
4. Considérer 'unknown' au lieu de 'any'
` : `
## 🎉 Objectif Atteint !

Tous les 'any' ont été éliminés du codebase.
TypeScript strict mode peut maintenant être activé.
`}

## 📈 Bénéfices

- ✅ **Type Safety**: Erreurs détectées à la compilation
- ✅ **IntelliSense**: Autocomplétion améliorée
- ✅ **Refactoring**: Plus sûr avec types stricts
- ✅ **Documentation**: Code auto-documenté
- ✅ **Qualité**: Moins de bugs runtime

---
*Rapport généré le ${new Date().toLocaleString('fr-FR')}*
`;

  // Sauvegarder rapport
  fs.mkdirSync(path.join('logs', 'phase3', 'typescript'), { recursive: true });
  fs.writeFileSync(
    path.join('logs', 'phase3', 'typescript', 'any-elimination-report.md'),
    markdown
  );

  console.log('📄 Rapport: logs/phase3/typescript/any-elimination-report.md');
}

// Exécution si lancé directement
if (require.main === module) {
  eliminateAnyTypeScript()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Élimination any réussie !');
        console.log(`📈 ${result.correctedCount} 'any' éliminés`);
        if (result.finalCount === 0) {
          console.log('🎯 Objectif Phase 3 atteint: 0 any !');
        }
      } else {
        console.log('\n⚠️ Élimination partielle');
        console.log('🔧 Corrections manuelles requises');
      }
    })
    .catch(error => {
      console.error('❌ Erreur élimination any:', error);
      process.exit(1);
    });
}

module.exports = { eliminateAnyTypeScript };