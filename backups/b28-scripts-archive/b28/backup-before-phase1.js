/**
 * Script B28 - Backup complet avant Phase 1
 * Sauvegarde état système avant modifications critiques
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join('backups', `b28-phase1-${timestamp}`);

  console.log(`🛡️  Création backup complet: ${backupDir}`);

  // Créer dossier backup
  fs.mkdirSync(backupDir, { recursive: true });

  try {
    // 1. Backup du schéma DB actuel
    const schemaSource = path.join('db', '20250914schema_export.sql');
    if (fs.existsSync(schemaSource)) {
      const schemaBackup = path.join(backupDir, 'schema_export_backup.sql');
      fs.copyFileSync(schemaSource, schemaBackup);
      console.log('✅ Schéma DB sauvegardé');
    }

    // 2. Backup des migrations existantes
    const migrationsSource = path.join('db', 'migrations');
    if (fs.existsSync(migrationsSource)) {
      const migrationsBackup = path.join(backupDir, 'migrations');
      fs.mkdirSync(migrationsBackup, { recursive: true });

      const migrationFiles = fs.readdirSync(migrationsSource);
      migrationFiles.forEach(file => {
        fs.copyFileSync(
          path.join(migrationsSource, file),
          path.join(migrationsBackup, file)
        );
      });
      console.log(`✅ ${migrationFiles.length} migrations sauvegardées`);
    }

    // 3. Export état Git actuel
    try {
      const gitHistory = execSync('git log --oneline -n 20', { encoding: 'utf8' });
      fs.writeFileSync(path.join(backupDir, 'git-history.txt'), gitHistory);

      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      fs.writeFileSync(path.join(backupDir, 'git-status.txt'), gitStatus);

      const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      fs.writeFileSync(path.join(backupDir, 'git-branch.txt'), gitBranch);

      console.log('✅ État Git sauvegardé');
    } catch (gitError) {
      console.log('⚠️  Git backup échoué (non-critique)');
    }

    // 4. Backup configuration critique
    const criticalFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'tailwind.config.js'
    ];

    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(backupDir, file));
      }
    });
    console.log('✅ Configs critiques sauvegardées');

    // 5. Snapshot état environnement
    const envSnapshot = {
      timestamp,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd()
    };

    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      envSnapshot.npmVersion = npmVersion;
    } catch (e) {
      envSnapshot.npmVersion = 'unknown';
    }

    fs.writeFileSync(
      path.join(backupDir, 'environment.json'),
      JSON.stringify(envSnapshot, null, 2)
    );

    // 6. Créer index du backup
    const backupIndex = {
      timestamp,
      backupDir,
      purpose: 'B28 Phase 1 - Pre-stabilisation backup',
      contents: {
        schema: fs.existsSync(path.join(backupDir, 'schema_export_backup.sql')),
        migrations: fs.existsSync(path.join(backupDir, 'migrations')),
        git: fs.existsSync(path.join(backupDir, 'git-history.txt')),
        configs: criticalFiles.filter(f => fs.existsSync(path.join(backupDir, f))),
        environment: true
      },
      restoreInstructions: [
        '1. Stop application',
        '2. Restore schema: cp schema_export_backup.sql ../db/20250914schema_export.sql',
        '3. Restore configs: cp *.json *.js ../',
        '4. Git reset if needed: git reset --hard [commit]',
        '5. Restart application'
      ]
    };

    fs.writeFileSync(
      path.join(backupDir, 'INDEX.json'),
      JSON.stringify(backupIndex, null, 2)
    );

    const backupSize = getDirSize(backupDir);

    console.log(`✅ Backup complet créé: ${backupDir}`);
    console.log(`📦 Taille: ${(backupSize / 1024).toFixed(1)} KB`);
    console.log(`📄 Index: ${path.join(backupDir, 'INDEX.json')}`);

    return {
      success: true,
      backupDir,
      size: backupSize,
      timestamp
    };

  } catch (error) {
    console.error('❌ Erreur lors du backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function getDirSize(dirPath) {
  let totalSize = 0;

  function getSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const items = fs.readdirSync(itemPath);
      items.forEach(item => {
        getSize(path.join(itemPath, item));
      });
    }
  }

  getSize(dirPath);
  return totalSize;
}

// Exécution si lancé directement
if (require.main === module) {
  createBackup().then(result => {
    if (!result.success) {
      process.exit(1);
    }
  });
}

module.exports = { createBackup };