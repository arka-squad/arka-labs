/**
 * Script B28 Phase 2 - Raffiner Module Misc
 * Découpe le module misc.ts (3224 lignes) en modules plus petits
 */

const fs = require('fs');
const path = require('path');

async function refineMiscModule() {
  console.log('🔍 Raffinage module misc (3224 lignes)...');

  const miscPath = path.join('src', 'lib', 'api-lite', 'modules', 'misc.ts');
  const content = fs.readFileSync(miscPath, 'utf8');
  const lines = content.split('\n');

  console.log(`📋 Analyse module misc: ${lines.length} lignes`);

  // Analyser et découper par patterns de code
  const subModules = analyzeMiscContent(lines);

  console.log(`🔍 ${subModules.length} sous-modules détectés:`);
  subModules.forEach(s =>
    console.log(`   - ${s.name}: ${s.lines.length} lignes`)
  );

  // Créer les nouveaux modules
  for (const subModule of subModules) {
    if (subModule.lines.length > 100) { // Seulement les modules significatifs
      const modulePath = path.join('src', 'lib', 'api-lite', 'modules', `${subModule.name}.ts`);
      const moduleContent = generateRefinedModuleContent(subModule);

      fs.writeFileSync(modulePath, moduleContent);
      console.log(`   ✅ ${subModule.name}: ${subModule.lines.length} lignes créé`);
    }
  }

  // Nettoyer le misc original
  const cleanedMiscContent = generateCleanedMiscContent(subModules.filter(s => s.lines.length <= 100));
  fs.writeFileSync(miscPath, cleanedMiscContent);

  console.log(`\n✅ Raffinage terminé:`);
  console.log(`   🔪 3224 lignes → ${subModules.filter(s => s.lines.length > 100).length} nouveaux modules`);
  console.log(`   📊 Module misc réduit: ${cleanedMiscContent.split('\n').length} lignes`);
}

function analyzeMiscContent(lines) {
  const subModules = [
    { name: 'auth', lines: [], pattern: /auth|login|token|jwt|session|password/i },
    { name: 'projects', lines: [], pattern: /project|dossier|folder/i },
    { name: 'agents', lines: [], pattern: /agent|ai|llm|model|provider/i },
    { name: 'system', lines: [], pattern: /health|version|metrics|status|ping/i },
    { name: 'data', lines: [], pattern: /sql|database|query|select|insert|update/i },
    { name: 'files', lines: [], pattern: /file|upload|download|storage|blob/i },
    { name: 'misc_remaining', lines: [] } // Catch-all
  ];

  let currentModule = null;

  for (const line of lines) {
    // Détecter le module approprié basé sur le contenu
    const detectedModule = subModules.find(module =>
      module.pattern && module.pattern.test(line)
    );

    if (detectedModule && detectedModule !== currentModule) {
      currentModule = detectedModule;
    }

    // Ajouter ligne au module courant ou misc_remaining
    if (currentModule) {
      currentModule.lines.push(line);
    } else {
      subModules.find(m => m.name === 'misc_remaining').lines.push(line);
    }
  }

  return subModules.filter(m => m.lines.length > 0);
}

function generateRefinedModuleContent(subModule) {
  return `/**
 * API Lite Module: ${subModule.name.toUpperCase()}
 * Extrait du module misc - B28 Phase 2
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';

export function setup${capitalizeFirst(subModule.name)}Routes(api: APILite) {
  console.log('🚀 Setup module ${subModule.name} (${subModule.lines.length} lignes)...');

${subModule.lines.join('\n')}

  console.log('✅ Module ${subModule.name} configuré');
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`;
}

function generateCleanedMiscContent(remainingSubModules) {
  const remainingLines = remainingSubModules.flatMap(m => m.lines);

  return `/**
 * API Lite Module: MISC (Nettoyé)
 * Contenu résiduel après raffinage B28 Phase 2
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';

export function setupMiscRoutes(api: APILite) {
  console.log('🚀 Setup module misc (contenu résiduel)...');

${remainingLines.join('\n')}

  console.log('✅ Module misc configuré');
}
`;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Exécution
if (require.main === module) {
  refineMiscModule()
    .then(() => {
      console.log('🎉 Raffinage module misc réussi !');
    })
    .catch(error => {
      console.error('❌ Erreur raffinage:', error);
      process.exit(1);
    });
}

module.exports = { refineMiscModule };