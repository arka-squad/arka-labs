/**
 * Script B28 - Inventaire fichiers racine
 * Catégorise les fichiers à conserver, archiver ou supprimer
 */

const fs = require('fs');
const path = require('path');

function inventoryRootFiles() {
  console.log('📁 Inventaire des fichiers à la racine...');

  const rootFiles = fs.readdirSync('.').filter(file => {
    const stats = fs.statSync(file);
    return stats.isFile();
  });

  const categories = {
    KEEP: [],
    ARCHIVE: [],
    DELETE: []
  };

  // Fichiers essentiels à conserver
  const keepPatterns = [
    'package.json', 'package-lock.json', 'tsconfig.json',
    'next.config.js', 'tailwind.config.js', 'postcss.config.js',
    '.gitignore', '.env.example', 'README.md', 'vercel.json',
    'PHASE1-LOG.md', 'CHANGELOG.md', 'LICENSE'
  ];

  // Patterns de fichiers à archiver
  const archivePatterns = [
    /^fix-.*\.js$/, /^test-.*\.js$/, /^check-.*\.js$/,
    /^setup-.*\.js$/, /^debug-.*\.js$/, /^create-.*\.js$/,
    /^migrate-.*\.js$/, /^rollback-.*\.js$/,
    /.*-old\..*/, /.*-complex\..*/, /.*-backup\..*/, /.*\.bak$/
  ];

  // Patterns de fichiers à supprimer
  const deletePatterns = [
    /^temp-.*/, /.*\.tmp$/, /.*\.temp$/, /^logs_.*\.json$/,
    /.*~$/, /^#.*#$/, /\.DS_Store$/
  ];

  console.log(`📊 Analyse de ${rootFiles.length} fichiers...`);

  rootFiles.forEach(file => {
    if (keepPatterns.includes(file)) {
      categories.KEEP.push({ file, reason: 'Essential config' });
    } else if (file.startsWith('.') && !file.includes('temp')) {
      categories.KEEP.push({ file, reason: 'Dotfile config' });
    } else if (archivePatterns.some(p => p.test(file))) {
      categories.ARCHIVE.push({ file, reason: 'Temporary/Legacy script' });
    } else if (deletePatterns.some(p => p.test(file))) {
      categories.DELETE.push({ file, reason: 'Temporary/junk file' });
    } else {
      // Analyser le contenu pour décider
      try {
        const stats = fs.statSync(file);
        const ext = path.extname(file);

        if (['.js', '.mjs', '.ts'].includes(ext)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('// TEMP') || content.includes('// TODO: remove')) {
            categories.DELETE.push({ file, reason: 'Marked as temporary' });
          } else if (stats.mtime < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
            categories.ARCHIVE.push({ file, reason: 'Script > 30 days old' });
          } else {
            categories.DELETE.push({ file, reason: 'Unknown script' });
          }
        } else if (['.log', '.txt'].includes(ext)) {
          categories.DELETE.push({ file, reason: 'Log/text file' });
        } else {
          categories.ARCHIVE.push({ file, reason: 'Unknown file type' });
        }
      } catch (error) {
        categories.DELETE.push({ file, reason: 'Unreadable file' });
      }
    }
  });

  // Générer rapport
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: rootFiles.length,
    keep: categories.KEEP.length,
    archive: categories.ARCHIVE.length,
    delete: categories.DELETE.length,
    categories
  };

  const reportPath = path.join('logs', 'phase1', 'root-inventory.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Générer rapport markdown
  const markdown = `# Inventaire Fichiers Racine

## 📊 Résumé
- **Total fichiers**: ${report.totalFiles}
- **À conserver**: ${report.keep}
- **À archiver**: ${report.archive}
- **À supprimer**: ${report.delete}

## ✅ À Conserver (${categories.KEEP.length})
${categories.KEEP.map(item => `- \`${item.file}\` - ${item.reason}`).join('\n')}

## 📦 À Archiver (${categories.ARCHIVE.length})
${categories.ARCHIVE.map(item => `- \`${item.file}\` - ${item.reason}`).join('\n')}

## 🗑️ À Supprimer (${categories.DELETE.length})
${categories.DELETE.map(item => `- \`${item.file}\` - ${item.reason}`).join('\n')}

## 🎯 Actions Recommandées

### Commandes d'archivage
\`\`\`bash
# Créer dossier archive
mkdir -p archive/b28-cleanup-$(date +%Y%m%d)

# Archiver fichiers
${categories.ARCHIVE.map(item => `mv "${item.file}" archive/b28-cleanup-$(date +%Y%m%d)/`).join('\n')}
\`\`\`

### Commandes de suppression
\`\`\`bash
# Supprimer fichiers temporaires
${categories.DELETE.map(item => `rm "${item.file}"`).join('\n')}
\`\`\`

*Généré le ${report.timestamp}*
`;

  const markdownPath = path.join('logs', 'phase1', 'root-inventory.md');
  fs.writeFileSync(markdownPath, markdown);

  console.log(`✅ Inventaire terminé:`);
  console.log(`   📁 ${report.keep} à conserver`);
  console.log(`   📦 ${report.archive} à archiver`);
  console.log(`   🗑️  ${report.delete} à supprimer`);
  console.log(`📄 Rapport: ${reportPath}`);
  console.log(`📋 Guide: ${markdownPath}`);

  return report;
}

// Exécution si lancé directement
if (require.main === module) {
  inventoryRootFiles();
}

module.exports = { inventoryRootFiles };