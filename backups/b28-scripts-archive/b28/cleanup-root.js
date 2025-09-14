/**
 * Script B28 - Nettoyage sécurisé racine
 * Archive et supprime les fichiers temporaires/obsolètes
 */

const fs = require('fs');
const path = require('path');

function cleanupRoot() {
  console.log('🧹 Nettoyage sécurisé des fichiers racine...');

  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const archiveDir = path.join('archive', `b28-cleanup-${timestamp}`);

  // Créer structure archive
  fs.mkdirSync(path.join(archiveDir, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(archiveDir, 'legacy'), { recursive: true });
  fs.mkdirSync(path.join(archiveDir, 'temp'), { recursive: true });
  fs.mkdirSync(path.join(archiveDir, 'docs'), { recursive: true });

  // Lire le rapport d'inventaire
  const inventoryPath = path.join('logs', 'phase1', 'root-inventory.json');
  if (!fs.existsSync(inventoryPath)) {
    console.error('❌ Rapport d\'inventaire non trouvé. Lancez d\'abord inventory-root-files.js');
    process.exit(1);
  }

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  let movedCount = 0;
  let deletedCount = 0;
  let errors = [];

  console.log('📦 Archivage des fichiers...');

  // Archiver fichiers temporaires et legacy
  inventory.categories.ARCHIVE.forEach(item => {
    const filename = item.file;
    try {
      if (fs.existsSync(filename)) {
        let destDir;

        if (filename.startsWith('fix-') || filename.startsWith('check-') ||
            filename.startsWith('create-') || filename.startsWith('debug-') ||
            filename.startsWith('setup-') || filename.startsWith('test-')) {
          destDir = path.join(archiveDir, 'scripts');
        } else if (filename.includes('-old') || filename.includes('-complex') ||
                   filename.includes('-backup') || filename.endsWith('.bak')) {
          destDir = path.join(archiveDir, 'legacy');
        } else if (filename.endsWith('.md') || filename.endsWith('.txt')) {
          destDir = path.join(archiveDir, 'docs');
        } else {
          destDir = path.join(archiveDir, 'temp');
        }

        const destPath = path.join(destDir, filename);
        fs.renameSync(filename, destPath);
        console.log(`  ✅ ${filename} → ${destPath}`);
        movedCount++;
      }
    } catch (error) {
      errors.push({ file: filename, action: 'archive', error: error.message });
      console.log(`  ❌ Erreur ${filename}: ${error.message}`);
    }
  });

  console.log('🗑️  Suppression des fichiers temporaires...');

  // Supprimer fichiers temporaires
  inventory.categories.DELETE.forEach(item => {
    const filename = item.file;
    try {
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
        console.log(`  🗑️  ${filename}`);
        deletedCount++;
      }
    } catch (error) {
      errors.push({ file: filename, action: 'delete', error: error.message });
      console.log(`  ❌ Erreur ${filename}: ${error.message}`);
    }
  });

  // Créer index de l'archive
  const archiveIndex = {
    timestamp: new Date().toISOString(),
    originalLocation: process.cwd(),
    totalFiles: inventory.totalFiles,
    archived: movedCount,
    deleted: deletedCount,
    errors: errors.length,
    structure: {
      scripts: fs.readdirSync(path.join(archiveDir, 'scripts')).length,
      legacy: fs.readdirSync(path.join(archiveDir, 'legacy')).length,
      temp: fs.readdirSync(path.join(archiveDir, 'temp')).length,
      docs: fs.readdirSync(path.join(archiveDir, 'docs')).length
    },
    errors
  };

  fs.writeFileSync(
    path.join(archiveDir, 'INDEX.json'),
    JSON.stringify(archiveIndex, null, 2)
  );

  // Créer README pour l'archive
  const archiveReadme = `# Archive B28 Cleanup - ${timestamp}

## 📊 Résumé
- **Date**: ${new Date().toISOString()}
- **Fichiers archivés**: ${movedCount}
- **Fichiers supprimés**: ${deletedCount}
- **Erreurs**: ${errors.length}

## 📁 Structure
- \`scripts/\`: Scripts temporaires (${archiveIndex.structure.scripts} fichiers)
- \`legacy/\`: Code legacy/obsolète (${archiveIndex.structure.legacy} fichiers)
- \`temp/\`: Fichiers temporaires (${archiveIndex.structure.temp} fichiers)
- \`docs/\`: Documentation obsolète (${archiveIndex.structure.docs} fichiers)

## 🔄 Récupération
Pour restaurer un fichier:
\`\`\`bash
cp archive/b28-cleanup-${timestamp}/[category]/[filename] ./
\`\`\`

## ⚠️ Important
Ces fichiers ont été archivés car identifiés comme temporaires ou obsolètes.
Vérifiez qu'ils ne sont plus nécessaires avant suppression définitive.

${errors.length > 0 ? `## ❌ Erreurs
${errors.map(e => `- ${e.file} (${e.action}): ${e.error}`).join('\n')}` : ''}
`;

  fs.writeFileSync(path.join(archiveDir, 'README.md'), archiveReadme);

  // Vérifier le nettoyage
  const remainingFiles = fs.readdirSync('.').filter(file => {
    const stats = fs.statSync(file);
    return stats.isFile();
  });

  console.log('\n✅ Nettoyage terminé !');
  console.log(`📦 ${movedCount} fichiers archivés dans: ${archiveDir}`);
  console.log(`🗑️  ${deletedCount} fichiers supprimés`);
  console.log(`📁 ${remainingFiles.length} fichiers restants à la racine`);

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} erreurs rencontrées`);
  }

  // Mettre à jour le log de phase 1
  updatePhaseLog(movedCount, deletedCount, remainingFiles.length, errors.length);

  return {
    success: errors.length === 0,
    archived: movedCount,
    deleted: deletedCount,
    remaining: remainingFiles.length,
    errors,
    archiveDir
  };
}

function updatePhaseLog(archived, deleted, remaining, errorCount) {
  const logPath = 'PHASE1-LOG.md';
  if (fs.existsSync(logPath)) {
    let content = fs.readFileSync(logPath, 'utf8');

    const cleanupUpdate = `

**${new Date().toISOString().split('T')[0]} - Nettoyage racine terminé**
- 📦 ${archived} fichiers archivés
- 🗑️ ${deleted} fichiers supprimés
- 📁 ${remaining} fichiers restants
- ${errorCount === 0 ? '✅' : '❌'} ${errorCount} erreurs`;

    content = content.replace(
      '---\n\n## 📝 Historique des Actions',
      `---\n\n## 📝 Historique des Actions${cleanupUpdate}`
    );

    fs.writeFileSync(logPath, content);
  }
}

// Exécution si lancé directement
if (require.main === module) {
  cleanupRoot();
}

module.exports = { cleanupRoot };