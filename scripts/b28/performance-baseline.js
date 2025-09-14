/**
 * Script B28 Phase 3 - Mesure Performance Baseline
 * Établit les métriques avant optimisation pour comparaison
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function measurePerformanceBaseline() {
  console.log('📊 B28 Phase 3 - Mesure Performance Baseline...');

  const metrics = {
    timestamp: new Date().toISOString(),
    build: {},
    api: {},
    frontend: {},
    codebase: {}
  };

  try {
    // 1. MÉTRIQUES BUILD
    console.log('🔧 Mesure du build...');
    const buildStart = Date.now();

    try {
      // Attempt to build if possible
      execSync('npm run build', { stdio: 'pipe', timeout: 300000 });
      metrics.build.time = Date.now() - buildStart;
      metrics.build.success = true;

      // Analyser taille bundle si build réussi
      if (fs.existsSync('.next/build-manifest.json')) {
        const buildManifest = JSON.parse(fs.readFileSync('.next/build-manifest.json', 'utf8'));
        metrics.build.bundleEstimate = calculateBundleSize(buildManifest);
      }
    } catch (error) {
      metrics.build.time = Date.now() - buildStart;
      metrics.build.success = false;
      metrics.build.error = error.message.substring(0, 200);
      console.log('  ⚠️ Build failed, continuing with other metrics...');
    }

    // 2. MÉTRIQUES CODEBASE
    console.log('📁 Analyse codebase...');

    // Compter fichiers et lignes
    const stats = analyzeCodebase();
    metrics.codebase = stats;

    // 3. MÉTRIQUES TYPESCRIPT
    console.log('🎯 Analyse TypeScript...');
    metrics.typescript = analyzeTypeScript();

    // 4. MÉTRIQUES API (simulation car pas de serveur)
    console.log('🔍 Analyse API structure...');
    metrics.api = analyzeAPIStructure();

    // 5. TESTS ET COVERAGE
    console.log('🧪 Analyse tests...');
    metrics.tests = analyzeTestCoverage();

    // 6. GÉNÉRER RAPPORT BASELINE
    const report = generateBaselineReport(metrics);

    // Sauvegarder métriques
    fs.mkdirSync(path.join('logs', 'phase3', 'performance'), { recursive: true });
    fs.writeFileSync(
      path.join('logs', 'phase3', 'performance', 'baseline.json'),
      JSON.stringify(metrics, null, 2)
    );

    fs.writeFileSync(
      path.join('logs', 'phase3', 'performance', 'baseline-report.md'),
      report
    );

    console.log('\n✅ Baseline Performance établie:');
    console.log(`   📊 Build: ${metrics.build.success ? metrics.build.time + 'ms' : 'FAILED'}`);
    console.log(`   📁 Codebase: ${metrics.codebase.totalFiles} fichiers, ${metrics.codebase.totalLines} lignes`);
    console.log(`   🎯 TypeScript: ${metrics.typescript.anyCount} 'any' à corriger`);
    console.log(`   🔍 API: ${metrics.api.routesCount} routes analysées`);
    console.log(`   🧪 Tests: ${metrics.tests.coverage}% coverage estimé`);

    return metrics;

  } catch (error) {
    console.error('❌ Erreur mesure baseline:', error);
    throw error;
  }
}

function calculateBundleSize(manifest) {
  // Estimation simple basée sur le manifeste
  let totalSize = 0;

  if (manifest.pages) {
    Object.values(manifest.pages).forEach(pageFiles => {
      if (Array.isArray(pageFiles)) {
        totalSize += pageFiles.length * 45; // Estimation 45KB par fichier
      }
    });
  }

  return totalSize; // KB estimés
}

function analyzeCodebase() {
  const stats = {
    totalFiles: 0,
    totalLines: 0,
    byExtension: {},
    srcFiles: 0,
    srcLines: 0
  };

  try {
    // Compter tous les fichiers TS/TSX dans src/
    const srcFiles = execSync('find src -name "*.ts" -o -name "*.tsx" | wc -l', { encoding: 'utf8' }).trim();
    stats.srcFiles = parseInt(srcFiles) || 0;

    // Compter lignes dans src/
    const srcLines = execSync('find src -name "*.ts" -o -name "*.tsx" -exec wc -l {} + | tail -1', { encoding: 'utf8' });
    stats.srcLines = parseInt(srcLines.split(/\s+/)[0]) || 0;

    // Statistiques générales
    const allFiles = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();
    stats.totalFiles = parseInt(allFiles) || 0;

    const allLines = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs wc -l | tail -1', { encoding: 'utf8' });
    stats.totalLines = parseInt(allLines.split(/\s+/)[0]) || 0;

  } catch (error) {
    console.log('  ⚠️ Erreur analyse codebase:', error.message);
  }

  return stats;
}

function analyzeTypeScript() {
  const analysis = {
    anyCount: 0,
    strictMode: false,
    errors: 0
  };

  try {
    // Compter les 'any' dans src/
    const anySearch = execSync('grep -r ": any" src/ || true', { encoding: 'utf8' });
    analysis.anyCount = (anySearch.match(/: any/g) || []).length;

    // Vérifier strict mode dans tsconfig.json
    if (fs.existsSync('tsconfig.json')) {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      analysis.strictMode = tsconfig.compilerOptions?.strict === true;
    }

    // Compter erreurs TypeScript (tentative)
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe', timeout: 30000 });
      analysis.errors = 0;
    } catch (error) {
      const errorOutput = error.stdout?.toString() || '';
      analysis.errors = (errorOutput.match(/error TS\d+/g) || []).length;
    }

  } catch (error) {
    console.log('  ⚠️ Erreur analyse TypeScript:', error.message);
  }

  return analysis;
}

function analyzeAPIStructure() {
  const analysis = {
    routesCount: 0,
    modulesCount: 0,
    endpointsDetected: []
  };

  try {
    // Compter modules API
    if (fs.existsSync('src/api/routes')) {
      const modules = fs.readdirSync('src/api/routes', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      analysis.modulesCount = modules.length;
    }

    // Compter routes dans les modules
    const routeFiles = execSync('find src/api -name "*.ts" | xargs grep -l "router\\." || true', { encoding: 'utf8' });
    const files = routeFiles.trim().split('\n').filter(f => f);

    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const routes = content.match(/router\.(get|post|put|delete|patch)/g) || [];
        analysis.routesCount += routes.length;
      }
    });

    // Détecter endpoints API Lite
    if (fs.existsSync('src/lib/api-lite/modules')) {
      const modules = fs.readdirSync('src/lib/api-lite/modules');
      analysis.endpointsDetected = modules.map(m => m.replace('.ts', ''));
    }

  } catch (error) {
    console.log('  ⚠️ Erreur analyse API:', error.message);
  }

  return analysis;
}

function analyzeTestCoverage() {
  const analysis = {
    coverage: 0,
    testFiles: 0,
    hasJestConfig: false
  };

  try {
    // Vérifier configuration Jest
    analysis.hasJestConfig = fs.existsSync('jest.config.js') || fs.existsSync('jest.config.ts');

    // Compter fichiers de test
    const testFiles = execSync('find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();
    analysis.testFiles = parseInt(testFiles) || 0;

    // Estimation coverage basée sur ratio test/src files
    if (analysis.testFiles > 0) {
      const srcFiles = execSync('find src -name "*.ts" -o -name "*.tsx" | wc -l', { encoding: 'utf8' }).trim();
      const ratio = analysis.testFiles / (parseInt(srcFiles) || 1);
      analysis.coverage = Math.min(Math.round(ratio * 100), 100);
    }

  } catch (error) {
    console.log('  ⚠️ Erreur analyse tests:', error.message);
  }

  return analysis;
}

function generateBaselineReport(metrics) {
  return `# B28 Phase 3 - Performance Baseline

**Date**: ${metrics.timestamp}
**Objectif**: Établir métriques avant optimisation

## 🔧 Build Metrics

| Métrique | Valeur | Objectif Phase 3 |
|----------|--------|-------------------|
| Build Success | ${metrics.build.success ? '✅ OUI' : '❌ NON'} | ✅ Requis |
| Build Time | ${metrics.build.time || 'N/A'}ms | < 180,000ms |
| Bundle Size | ${metrics.build.bundleEstimate || 'N/A'}KB | < 500KB |

## 📁 Codebase Metrics

| Métrique | Valeur |
|----------|--------|
| Total Files | ${metrics.codebase.totalFiles} |
| Total Lines | ${metrics.codebase.totalLines} |
| Src Files | ${metrics.codebase.srcFiles} |
| Src Lines | ${metrics.codebase.srcLines} |

## 🎯 TypeScript Quality

| Métrique | Valeur | Objectif Phase 3 |
|----------|--------|-------------------|
| 'any' Count | ${metrics.typescript.anyCount} | 0 |
| Strict Mode | ${metrics.typescript.strictMode ? '✅ OUI' : '❌ NON'} | ✅ Requis |
| TS Errors | ${metrics.typescript.errors} | 0 |

## 🔍 API Structure

| Métrique | Valeur |
|----------|--------|
| Routes Count | ${metrics.api.routesCount} |
| Modules Count | ${metrics.api.modulesCount} |
| API Lite Modules | ${metrics.api.endpointsDetected.length} |

## 🧪 Tests & Coverage

| Métrique | Valeur | Objectif Phase 3 |
|----------|--------|-------------------|
| Test Files | ${metrics.tests.testFiles} | > 20 |
| Coverage Estimate | ${metrics.tests.coverage}% | > 80% |
| Jest Config | ${metrics.tests.hasJestConfig ? '✅ OUI' : '❌ NON'} | ✅ Requis |

## 🎯 Score Baseline

### Performance: ${getPerformanceScore(metrics)}/10
### Quality: ${getQualityScore(metrics)}/10
### Testing: ${getTestingScore(metrics)}/10

## 📈 Plan Optimisation

1. **Performance** ${metrics.build.success ? '→ Optimiser bundle' : '→ Fix build d\'abord'}
2. **TypeScript** → Éliminer ${metrics.typescript.anyCount} 'any'
3. **Tests** → Passer de ${metrics.tests.coverage}% à > 80%
4. **API** → Optimiser ${metrics.api.routesCount} routes
5. **Monitoring** → Implémenter métriques temps réel

---
*Baseline établie le ${new Date().toLocaleString('fr-FR')}*
`;
}

function getPerformanceScore(metrics) {
  let score = 0;
  if (metrics.build.success) score += 4;
  if (metrics.build.time < 180000) score += 3;
  if (metrics.build.bundleEstimate < 500) score += 3;
  return Math.min(score, 10);
}

function getQualityScore(metrics) {
  let score = 0;
  if (metrics.typescript.strictMode) score += 3;
  if (metrics.typescript.anyCount === 0) score += 4;
  if (metrics.typescript.errors === 0) score += 3;
  return Math.min(score, 10);
}

function getTestingScore(metrics) {
  let score = 0;
  if (metrics.tests.hasJestConfig) score += 2;
  if (metrics.tests.testFiles > 0) score += 3;
  if (metrics.tests.coverage > 50) score += 3;
  if (metrics.tests.coverage > 80) score += 2;
  return Math.min(score, 10);
}

// Exécution si lancé directement
if (require.main === module) {
  measurePerformanceBaseline()
    .then(metrics => {
      console.log('\n🎯 Baseline Phase 3 établie !');
      console.log('📊 Rapport: logs/phase3/performance/baseline-report.md');
      console.log('📈 Prochaine étape: Optimisations ciblées');
    })
    .catch(error => {
      console.error('❌ Erreur baseline:', error);
      process.exit(1);
    });
}

module.exports = { measurePerformanceBaseline };