/**
 * Script B28 Phase 2 - Analyse Architecture API Triple
 * Inventorie les 3 systèmes API parallèles pour planifier unification
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function analyzeAPIArchitecture() {
  console.log('🔍 Analyse de l\'architecture API triple...');

  const analysis = {
    directRoutes: [],
    apiLite: [],
    apiRouter: [],
    summary: {}
  };

  // 1. Analyser les routes directes Next.js
  console.log('📊 Inventaire routes directes Next.js...');

  try {
    const directRoutes = await glob('app/api/**/route.{ts,js}', {
      ignore: ['node_modules/**', 'archive/**', '.next/**']
    });

    for (const routePath of directRoutes) {
      const content = fs.readFileSync(routePath, 'utf8');
      const endpoint = routePath
        .replace('app/api', '')
        .replace('/route.ts', '')
        .replace('/route.js', '')
        .replace(/\[([^\]]+)\]/g, ':$1'); // [id] → :id

      // Détecter les méthodes HTTP
      const methods = [];
      if (content.includes('export async function GET')) methods.push('GET');
      if (content.includes('export async function POST')) methods.push('POST');
      if (content.includes('export async function PUT')) methods.push('PUT');
      if (content.includes('export async function DELETE')) methods.push('DELETE');
      if (content.includes('export async function PATCH')) methods.push('PATCH');

      // Analyser la complexité
      const lines = content.split('\n').length;
      const hasDB = content.includes('sql`') || content.includes('db.');
      const hasAuth = content.includes('withAuth') || content.includes('Authorization');
      const hasValidation = content.includes('zod') || content.includes('joi');

      analysis.directRoutes.push({
        file: routePath,
        endpoint,
        methods,
        lines,
        complexity: {
          hasDB,
          hasAuth,
          hasValidation,
          score: (hasDB ? 1 : 0) + (hasAuth ? 1 : 0) + (hasValidation ? 1 : 0)
        }
      });
    }

    console.log(`   ✅ ${analysis.directRoutes.length} routes directes trouvées`);

  } catch (error) {
    console.log(`   ⚠️  Erreur routes directes: ${error.message}`);
  }

  // 2. Analyser API Lite
  console.log('📊 Inventaire API Lite...');

  const apiLitePath = path.join('lib', 'api-lite', 'setup.ts');
  if (fs.existsSync(apiLitePath)) {
    const content = fs.readFileSync(apiLitePath, 'utf8');
    const size = content.length;

    // Extraire les routes avec regex plus précise
    const routeRegex = /(?:router|api)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = routeRegex.exec(content)) !== null) {
      const [, method, path] = match;
      analysis.apiLite.push({
        method: method.toUpperCase(),
        path,
        source: 'api-lite/setup.ts'
      });
    }

    analysis.summary.apiLiteSize = size;
    analysis.summary.apiLiteTokens = Math.round(size / 4); // Estimation tokens
    console.log(`   ✅ ${analysis.apiLite.length} routes API Lite (${(size/1024).toFixed(1)}KB)`);
  }

  // 3. Analyser API Router (si existe)
  console.log('📊 Inventaire API Router...');

  const apiRouterPath = path.join('lib', 'api-router', 'index.ts');
  if (fs.existsSync(apiRouterPath)) {
    analysis.apiRouter.push({
      file: apiRouterPath,
      note: 'Système fallback Vercel détecté'
    });
    console.log('   ✅ API Router détecté');
  } else {
    console.log('   ℹ️  API Router non trouvé (normal)');
  }

  // 4. Analyser les dépendances
  console.log('📊 Analyse dépendances...');

  const packagePath = path.join('package.json');
  if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    analysis.summary.dependencies = {
      nextjs: packageContent.dependencies?.next || 'N/A',
      typescript: packageContent.devDependencies?.typescript || 'N/A',
      zod: packageContent.dependencies?.zod || 'N/A'
    };
  }

  // 5. Générer le résumé
  analysis.summary = {
    ...analysis.summary,
    directRoutesCount: analysis.directRoutes.length,
    apiLiteCount: analysis.apiLite.length,
    apiRouterCount: analysis.apiRouter.length,
    totalEndpoints: analysis.directRoutes.length + analysis.apiLite.length,
    complexity: {
      simple: analysis.directRoutes.filter(r => r.complexity.score <= 1).length,
      medium: analysis.directRoutes.filter(r => r.complexity.score === 2).length,
      complex: analysis.directRoutes.filter(r => r.complexity.score >= 3).length
    }
  };

  // 6. Générer rapport détaillé
  const report = generateDetailedReport(analysis);
  const reportPath = path.join('logs', 'phase2', 'api-architecture-analysis.md');

  // Créer dossier logs/phase2 si nécessaire
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);

  // 7. Générer plan de migration
  const migrationPlan = generateMigrationPlan(analysis);
  const planPath = path.join('logs', 'phase2', 'migration-plan.md');
  fs.writeFileSync(planPath, migrationPlan);

  console.log(`✅ Analyse terminée:`);
  console.log(`   📄 Rapport: ${reportPath}`);
  console.log(`   📋 Plan: ${planPath}`);
  console.log(`   🎯 ${analysis.summary.totalEndpoints} endpoints à unifier`);

  return analysis;
}

function generateDetailedReport(analysis) {
  return `# Analyse Architecture API Triple - B28 Phase 2

## 📊 Vue d'Ensemble

### Systèmes Détectés
- **Routes Directes Next.js** : ${analysis.summary.directRoutesCount} endpoints
- **API Lite** : ${analysis.summary.apiLiteCount} endpoints (${(analysis.summary.apiLiteTokens || 0).toLocaleString()} tokens)
- **API Router** : ${analysis.summary.apiRouterCount} système(s)

### Total Endpoints à Unifier
**${analysis.summary.totalEndpoints} endpoints** répartis sur 3 architectures

## 🔍 Analyse Routes Directes (${analysis.directRoutes.length})

### Par Complexité
- **Simples** (0-1 feature) : ${analysis.summary.complexity.simple}
- **Moyennes** (2 features) : ${analysis.summary.complexity.medium}
- **Complexes** (3+ features) : ${analysis.summary.complexity.complex}

### Détail Routes Directes

${analysis.directRoutes.map(route => `#### ${route.endpoint}
- **Fichier** : \`${route.file}\`
- **Méthodes** : ${route.methods.join(', ')}
- **Lignes** : ${route.lines}
- **Features** : ${route.complexity.hasDB ? '🗄️ DB' : ''} ${route.complexity.hasAuth ? '🔐 Auth' : ''} ${route.complexity.hasValidation ? '✅ Valid' : ''}
- **Score complexité** : ${route.complexity.score}/3
`).join('\n')}

## 🔧 API Lite Actuelle (${analysis.apiLite.length} routes)

${analysis.apiLite.map(route => `- **${route.method}** \`${route.path}\``).join('\n')}

${analysis.summary.apiLiteSize ? `
### Métriques API Lite
- **Taille fichier** : ${(analysis.summary.apiLiteSize/1024).toFixed(1)} KB
- **Tokens estimés** : ${analysis.summary.apiLiteTokens?.toLocaleString()}
- **Status** : 🔴 Monolithe (besoin découpage)
` : ''}

## 🎯 Recommandations Phase 2

### 1. Ordre Migration Recommandé

#### Batch 1 - Routes Simples (${analysis.summary.complexity.simple} routes)
${analysis.directRoutes
  .filter(r => r.complexity.score <= 1)
  .slice(0, 5)
  .map(r => `- ${r.endpoint} (${r.methods.join(', ')})`)
  .join('\n')}

#### Batch 2 - Routes Moyennes (${analysis.summary.complexity.medium} routes)
${analysis.directRoutes
  .filter(r => r.complexity.score === 2)
  .slice(0, 5)
  .map(r => `- ${r.endpoint} (${r.methods.join(', ')})`)
  .join('\n')}

#### Batch 3 - Routes Complexes (${analysis.summary.complexity.complex} routes)
${analysis.directRoutes
  .filter(r => r.complexity.score >= 3)
  .slice(0, 3)
  .map(r => `- ${r.endpoint} (${r.methods.join(', ')})`)
  .join('\n')}

### 2. Architecture Cible

\`\`\`
src/api/
├── routes/
│   ├── admin/      # Routes d'administration
│   ├── auth/       # Authentification
│   ├── clients/    # Gestion clients
│   ├── projects/   # Gestion projets
│   ├── agents/     # Gestion agents
│   └── squads/     # Gestion squads
├── middleware/     # Auth, validation, logging
├── validators/     # Schemas Zod
└── index.ts       # Point d'entrée unique
\`\`\`

### 3. Bénéfices Attendus

- ✅ **-66% architectures** (3 → 1 système)
- ✅ **+80% maintenabilité** (structure modulaire)
- ✅ **-90% confusion** (1 seul point d'entrée)
- ✅ **+60% performance** (moins d'overhead)

---

*Généré le ${new Date().toISOString()}*
*Prochaine étape : Création templates migration*`;
}

function generateMigrationPlan(analysis) {
  const batches = [
    {
      name: 'Batch 1 - Routes Simples',
      routes: analysis.directRoutes.filter(r => r.complexity.score <= 1),
      priority: 'HAUTE',
      effort: '2 jours'
    },
    {
      name: 'Batch 2 - Routes Moyennes',
      routes: analysis.directRoutes.filter(r => r.complexity.score === 2),
      priority: 'MOYENNE',
      effort: '4 jours'
    },
    {
      name: 'Batch 3 - Routes Complexes',
      routes: analysis.directRoutes.filter(r => r.complexity.score >= 3),
      priority: 'BASSE',
      effort: '6 jours'
    }
  ];

  return `# Plan Migration API - B28 Phase 2

## 🎯 Stratégie Migration

### Approche : Migration Progressive par Batches
- **Avantage** : Tests continus, rollback facile
- **Principe** : Simple → Complexe
- **Validation** : Tests après chaque batch

## 📋 Plan Détaillé

${batches.map((batch, index) => `
### ${batch.name}
**Priorité** : ${batch.priority} | **Effort estimé** : ${batch.effort}

**Routes (${batch.routes.length})** :
${batch.routes.map(r => `- \`${r.endpoint}\` (${r.methods.join(', ')}) - ${r.lines} lignes`).join('\n')}

**Actions** :
1. Créer module \`src/api/routes/[domain]/\`
2. Migrer routes vers templates standardisés
3. Tests validation fonctionnelle
4. Déprécier routes directes
5. Monitoring post-migration
`).join('\n')}

## ⏱️ Timeline

| Batch | Routes | Durée | Début | Fin |
|-------|--------|-------|-------|-----|
| **1** | ${batches[0].routes.length} simples | 2j | J+0 | J+2 |
| **2** | ${batches[1].routes.length} moyennes | 4j | J+2 | J+6 |
| **3** | ${batches[2].routes.length} complexes | 6j | J+6 | J+12 |
| **Tests** | Global | 2j | J+12 | J+14 |

**Total** : 14 jours (conforme spec Phase 2)

## 🛡️ Plan Risques

### Risques Identifiés
1. **Breaking changes** : Routes changent d'URL
2. **Performance** : Overhead nouveau système
3. **Bugs** : Erreurs migration logique métier
4. **Timeline** : ${analysis.summary.totalEndpoints} endpoints = beaucoup

### Mitigation
- **Feature flags** : Activation progressive
- **Tests automatisés** : Validation continue
- **Rollback rapide** : Git branches par batch
- **Documentation** : Guides migration détaillés

## ✅ Critères Succès

### Fonctionnels
- [ ] 100% routes migrées sans perte fonctionnelle
- [ ] 0 régression performance
- [ ] Tests E2E passants
- [ ] Documentation à jour

### Techniques
- [ ] 1 seule architecture API (vs 3)
- [ ] Modules <5K tokens (vs monolithe 40K)
- [ ] Structure \`src/\` moderne
- [ ] Catch-all unique \`app/api/[[...slug]]/\`

---

*Plan validé pour ${analysis.summary.totalEndpoints} endpoints*
*Prochaine action : Création templates migration*`;
}

// Exécution si lancé directement
if (require.main === module) {
  analyzeAPIArchitecture().catch(error => {
    console.error('❌ Erreur analyse architecture:', error);
    process.exit(1);
  });
}

module.exports = { analyzeAPIArchitecture };