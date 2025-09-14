/**
 * Script B28 - Analyse corruption schéma DB
 * Détecte les contraintes PRIMARY KEY dupliquées
 */

const fs = require('fs');
const path = require('path');

async function analyzeDBSchema() {
  console.log('🔍 Analyse du schéma DB pour détecter les corruptions...');

  const schemaPath = path.join(process.cwd(), 'db', '20250914schema_export.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Fichier schéma non trouvé: ${schemaPath}`);
    process.exit(1);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const issues = [];

  // Détecter les contraintes PRIMARY KEY dupliquées
  const constraints = {};
  const regex = /ALTER TABLE (\w+) ADD CONSTRAINT (\w+) PRIMARY KEY \(([^)]+)\)/g;
  let match;

  console.log('📊 Analyse des contraintes PRIMARY KEY...');

  while ((match = regex.exec(schema)) !== null) {
    const [fullMatch, table, constraint, columns] = match;
    const key = `${table}.${constraint}`;

    // Calculer la ligne dans le fichier
    const beforeMatch = schema.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;

    if (constraints[key]) {
      issues.push({
        type: 'DUPLICATE_CONSTRAINT',
        table,
        constraint,
        columns,
        line: lineNumber,
        original: constraints[key].line,
        content: fullMatch.trim()
      });
      console.log(`⚠️  DUPLICATE détecté: ${table}.${constraint} (lignes ${constraints[key].line} et ${lineNumber})`);
    } else {
      constraints[key] = { columns, line: lineNumber };
    }
  }

  // Détecter les contraintes multiples sur même table
  const tableConstraints = {};
  Object.entries(constraints).forEach(([key, info]) => {
    const table = key.split('.')[0];
    if (!tableConstraints[table]) {
      tableConstraints[table] = [];
    }
    tableConstraints[table].push(key);
  });

  Object.entries(tableConstraints).forEach(([table, constraintsList]) => {
    if (constraintsList.length > 1) {
      issues.push({
        type: 'MULTIPLE_PRIMARY_KEYS',
        table,
        constraints: constraintsList,
        count: constraintsList.length,
        detail: `Table ${table} a ${constraintsList.length} PRIMARY KEY: ${constraintsList.join(', ')}`
      });
      console.log(`🔴 CRITIQUE: Table ${table} a ${constraintsList.length} PRIMARY KEY multiples`);
    }
  });

  // Générer rapport détaillé
  const report = {
    timestamp: new Date().toISOString(),
    schemaFile: schemaPath,
    totalTables: Object.keys(tableConstraints).length,
    totalConstraints: Object.keys(constraints).length,
    totalIssues: issues.length,
    criticalIssues: issues.filter(i => i.type === 'MULTIPLE_PRIMARY_KEYS').length,
    affectedTables: [...new Set(issues.map(i => i.table))],
    details: issues
  };

  // Sauvegarder rapport
  const reportPath = path.join(process.cwd(), 'logs', 'phase1', 'db-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Générer résumé markdown
  const summary = `# Analyse Corruption Schéma DB

## 📊 Résumé
- **Total tables**: ${report.totalTables}
- **Total contraintes**: ${report.totalConstraints}
- **Total problèmes**: ${report.totalIssues}
- **Problèmes critiques**: ${report.criticalIssues}
- **Tables affectées**: ${report.affectedTables.length}

## 🔴 Problèmes Détectés

${issues.map(issue => {
  if (issue.type === 'DUPLICATE_CONSTRAINT') {
    return `### DUPLICATE: ${issue.table}.${issue.constraint}
- **Colonnes**: ${issue.columns}
- **Lignes**: ${issue.original} et ${issue.line}
- **Contenu**: \`${issue.content}\``;
  } else if (issue.type === 'MULTIPLE_PRIMARY_KEYS') {
    return `### MULTIPLE PRIMARY KEYS: ${issue.table}
- **Nombre**: ${issue.count}
- **Contraintes**: ${issue.constraints.join(', ')}
- **Détail**: ${issue.detail}`;
  }
}).join('\n\n')}

## 🛠 Actions Recommandées
1. **URGENT**: Corriger les contraintes dupliquées
2. **CRITICAL**: Une seule PRIMARY KEY par table
3. **TEST**: Valider sur DB locale avant production

*Généré le ${report.timestamp}*
`;

  const summaryPath = path.join(process.cwd(), 'logs', 'phase1', 'db-corruption-summary.md');
  fs.writeFileSync(summaryPath, summary);

  console.log(`✅ Analyse complète: ${issues.length} problèmes détectés`);
  console.log(`📄 Rapport: ${reportPath}`);
  console.log(`📋 Résumé: ${summaryPath}`);

  if (issues.length > 0) {
    console.log('\n🚨 ATTENTION: Problèmes critiques détectés dans le schéma DB');
    console.log('   → Correction OBLIGATOIRE avant déploiement production');
  } else {
    console.log('\n✅ Aucun problème détecté dans le schéma DB');
  }

  return report;
}

// Exécution si lancé directement
if (require.main === module) {
  analyzeDBSchema().catch(error => {
    console.error('❌ Erreur lors de l\'analyse:', error);
    process.exit(1);
  });
}

module.exports = { analyzeDBSchema };